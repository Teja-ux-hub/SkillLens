import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/db";
import User from "@/models/UserModel";
import ExamSession from "@/models/ExamSessionModel";
import ExamDiscussion from "@/models/ExamDiscussionModel";
import { getExamQuestionsForWeek } from "@/lib/exam-questions";
import { isExamWindowOpen } from "../availability/route";
import { validateWeekProgression } from "@/lib/exam-progression";

export async function POST(request) {
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

    const body = await request.json();
    const { weekNumber, requestedMode, forceWindow } = body;
    const week = parseInt(weekNumber) || 1;

    // Check 12-hour window (12:00 PM to 12:00 AM) unless forced in testing
    if (!isExamWindowOpen() && !forceWindow) {
      return NextResponse.json(
        {
          error: "Weekly exam is available only between 12 PM and 12 AM.",
          windowClosed: true,
        },
        { status: 403 }
      );
    }

    await dbConnect();

    // Check Week Progression Requirements (>= 80% on previous week & 6-day cooldown)
    const progressionCheck = await validateWeekProgression(userId, week, forceWindow);
    if (!progressionCheck.allowed) {
      return NextResponse.json(
        {
          error: progressionCheck.message,
          reason: progressionCheck.reason,
          unlockDate: progressionCheck.unlockDate,
          daysRemaining: progressionCheck.daysRemaining,
          prevScore: progressionCheck.prevScore,
          progressionLocked: true,
        },
        { status: 403 }
      );
    }

    const currentUser = await User.findOne({ clerkUserId: userId }).lean();
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const teammateId = currentUser.matching?.teammateId;
    const isPairedRequested = requestedMode !== "SOLO" && !!teammateId;

    const sessionId = `exam_w${week}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    // Generate 10 questions from mockQuesitons.jsx for that week
    const roadmapRole = currentUser.onboarding?.selectedRole || currentUser.roadmap?.role;
    const { sanitizedQuestions, answerKey } = getExamQuestionsForWeek(week, roadmapRole, 10);

    let sessionData = {
      sessionId,
      weekNumber: week,
      user1Id: userId,
      selectedQuestions: sanitizedQuestions,
      answerKey,
      user1JoinedAt: new Date(),
      isDevBypassed: Boolean(forceWindow),
    };

    if (isPairedRequested) {
      sessionData = {
        ...sessionData,
        user2Id: teammateId,
        mode: "PAIRED",
        status: "WAITING_FOR_TEAMMATE",
        joinDeadline: new Date(Date.now() + 60 * 60 * 1000), // 1 hour join window
      };
    } else {
      // Solo mode
      sessionData = {
        ...sessionData,
        user2Id: null,
        mode: "SOLO",
        status: "IN_PROGRESS",
        joinDeadline: new Date(Date.now() + 90 * 60 * 1000),
        startTime: new Date(),
        endTime: new Date(Date.now() + 90 * 60 * 1000), // 90 min timer
      };
    }

    const newSession = await ExamSession.create(sessionData);

    // Initialize collaborative discussion document for this session
    await ExamDiscussion.create({
      sessionId,
      content: "",
      lastEditedBy: userId,
    });

    console.log(`✅ Created exam session ${sessionId} (${sessionData.mode}) for User ${userId}`);

    // Return sanitized session (NO answerKey exposed)
    return NextResponse.json({
      success: true,
      session: {
        sessionId: newSession.sessionId,
        weekNumber: newSession.weekNumber,
        user1Id: newSession.user1Id,
        user2Id: newSession.user2Id,
        mode: newSession.mode,
        status: newSession.status,
        joinDeadline: newSession.joinDeadline,
        startTime: newSession.startTime,
        endTime: newSession.endTime,
        selectedQuestions: newSession.selectedQuestions,
      },
      teammateId: isPairedRequested ? teammateId : null,
      message: isPairedRequested
        ? "Exam session created. Waiting for teammate to join..."
        : "Solo exam started. 90-minute timer running.",
    });
  } catch (error) {
    console.error("❌ Error starting exam session:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
