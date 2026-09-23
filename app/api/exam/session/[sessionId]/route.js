import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/db";
import User from "@/models/UserModel";
import ExamSession from "@/models/ExamSessionModel";
import ExamDiscussion from "@/models/ExamDiscussionModel";
import ExamAttempt from "@/models/ExamAttemptModel";
import { validateWeekProgression } from "@/lib/exam-progression";

export async function GET(request, context) {
  try {
    let authData;
    try {
      authData = auth();
      if (authData && typeof authData.then === "function") {
        authData = await authData;
      }
    } catch (err) {
      authData = await auth();
    }

    const { userId } = authData || {};
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await context.params;
    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    await dbConnect();

    let session = await ExamSession.findOne({ sessionId });
    if (!session) {
      return NextResponse.json({ error: "Exam session not found" }, { status: 404 });
    }

    // Security check: Only session participants can access
    const isUser1 = session.user1Id === userId;
    const isUser2 = session.user2Id === userId;

    if (!isUser1 && !isUser2) {
      return NextResponse.json(
        { error: "Access denied. You are not a member of this exam session." },
        { status: 403 }
      );
    }

    // Check progression prerequisites if user has not yet submitted an attempt
    const myAttempt = await ExamAttempt.findOne({ sessionId, userId }).lean();
    if (!myAttempt && session.weekNumber > 1) {
      const progressionCheck = await validateWeekProgression(
        userId,
        session.weekNumber,
        session.isDevBypassed
      );
      if (!progressionCheck.allowed) {
        return NextResponse.json(
          {
            error: progressionCheck.message,
            reason: progressionCheck.reason,
            unlockDate: progressionCheck.unlockDate,
            daysRemaining: progressionCheck.daysRemaining,
            progressionLocked: true,
            weekNumber: session.weekNumber,
          },
          { status: 403 }
        );
      }
    }

    const now = new Date();

    // Check 1-Hour Join Window
    if (session.status === "WAITING_FOR_TEAMMATE") {
      if (session.joinDeadline && now > new Date(session.joinDeadline)) {
        // 60 minutes expired without teammate joining!
        console.log(`⏰ Join deadline expired for session ${sessionId}. Switching to SOLO_AVAILABLE.`);
        session.status = "SOLO_AVAILABLE";

        // Increment missed exam count for the absentee partner
        if (session.user2Id) {
          const absentee = await User.findOne({ clerkUserId: session.user2Id });
          if (absentee) {
            absentee.reliability = absentee.reliability || { missedExams: 0, isFlagged: false };
            absentee.reliability.missedExams = (absentee.reliability.missedExams || 0) + 1;
            if (absentee.reliability.missedExams >= 2) {
              absentee.reliability.isFlagged = true;
            }
            if (absentee.reliability.missedExams >= 3) {
              absentee.reliability.cooldownUntil = new Date(Date.now() + 48 * 60 * 60 * 1000);
            }
            absentee.markModified("reliability");
            await absentee.save();
          }
        }

        await session.save();
      } else if (isUser2 && !session.user2JoinedAt) {
        // User 2 (teammate) joins within the 1-hour window!
        console.log(`🎉 Teammate ${userId} joined session ${sessionId}. Starting 90-min timer.`);
        session.user2JoinedAt = new Date();
        session.startTime = new Date();
        session.endTime = new Date(Date.now() + 90 * 60 * 1000); // 90 min timer
        session.status = "IN_PROGRESS";
        await session.save();
      }
    }

    // Check 90-minute timer expiration
    let isExpired = false;
    if (session.status === "IN_PROGRESS" && session.endTime && now > new Date(session.endTime)) {
      isExpired = true;
    }

    // Fetch Discussion Content
    const discussion = await ExamDiscussion.findOne({ sessionId }).lean();

    // Fetch Partner details
    const partnerId = isUser1 ? session.user2Id : session.user1Id;
    let partnerProfile = null;

    if (partnerId) {
      const partnerUser = await User.findOne({ clerkUserId: partnerId })
        .select("firstName lastName username email github.username onboarding.selectedRole")
        .lean();

      let pName = "Matched Partner";
      let pUsername = "partner";
      let pEmail = "";

      if (partnerUser) {
        if (partnerUser.firstName || partnerUser.lastName) {
          pName = `${partnerUser.firstName || ""} ${partnerUser.lastName || ""}`.trim();
        } else if (partnerUser.username) {
          pName = partnerUser.username;
        }
        pUsername = partnerUser.username || "partner";
        pEmail = partnerUser.email || "";
      }

      // If generic, fetch real profile from Clerk
      if ((pName === "Matched Partner" || pName === "undefined undefined") && process.env.CLERK_SECRET_KEY) {
        try {
          const { createClerkClient } = await import("@clerk/backend");
          const client = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
          const clerkUser = await client.users.getUser(partnerId);
          if (clerkUser) {
            if (clerkUser.firstName || clerkUser.lastName) {
              pName = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim();
            } else if (clerkUser.username) {
              pName = clerkUser.username;
            } else if (clerkUser.emailAddresses?.[0]?.emailAddress) {
              pName = clerkUser.emailAddresses[0].emailAddress.split("@")[0];
            }
            pUsername = clerkUser.username || pName.toLowerCase().replace(/\s+/g, "");
            pEmail = clerkUser.emailAddresses?.[0]?.emailAddress || "";
          }
        } catch (e) {
          console.warn("Could not fetch Clerk user for partner:", e.message);
        }
      }

      partnerProfile = {
        userId: partnerId,
        name: pName,
        username: pUsername,
        email: pEmail,
        role: partnerUser?.onboarding?.selectedRole || "Developer",
      };
    }

    // Partner submission attempt if any
    const partnerAttempt = partnerId
      ? await ExamAttempt.findOne({ sessionId, userId: partnerId }).lean()
      : null;

    // Sanitize questions (Strictly NO answerKey returned)
    const sanitizedQuestions = session.selectedQuestions || [];

    return NextResponse.json({
      session: {
        sessionId: session.sessionId,
        weekNumber: session.weekNumber,
        user1Id: session.user1Id,
        user2Id: session.user2Id,
        mode: session.mode,
        status: session.status,
        startTime: session.startTime,
        endTime: session.endTime,
        joinDeadline: session.joinDeadline,
        user1JoinedAt: session.user1JoinedAt,
        user2JoinedAt: session.user2JoinedAt,
        user1SubmittedAt: session.user1SubmittedAt,
        user2SubmittedAt: session.user2SubmittedAt,
        isExpired,
      },
      questions: sanitizedQuestions,
      discussionContent: discussion?.content || "",
      discussionMessages: discussion?.messages || [],
      partner: partnerProfile,
      isUser1,
      isUser2,
      myAttempt: myAttempt
        ? {
            submitted: true,
            score: myAttempt.score,
            percentage: myAttempt.percentage,
            correct: myAttempt.correct,
            wrong: myAttempt.wrong,
            passed: myAttempt.passed,
            submittedAt: myAttempt.submittedAt,
          }
        : null,
      partnerAttempt: partnerAttempt
        ? {
            submitted: true,
            score: session.status === "COMPLETED" ? partnerAttempt.score : null,
            percentage: session.status === "COMPLETED" ? partnerAttempt.percentage : null,
            submittedAt: partnerAttempt.submittedAt,
          }
        : null,
      serverTime: now.toISOString(),
    });
  } catch (error) {
    console.error("❌ Error fetching exam session:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
