import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/db";
import User from "@/models/UserModel";
import ExamSession from "@/models/ExamSessionModel";

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
    const { sessionId } = body;
    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    await dbConnect();

    const session = await ExamSession.findOne({ sessionId });
    if (!session) {
      return NextResponse.json({ error: "Exam session not found" }, { status: 404 });
    }

    // Only user1 can trigger solo fallback on their initiated session
    if (session.user1Id !== userId) {
      return NextResponse.json(
        { error: "Only the session creator can switch to solo mode." },
        { status: 403 }
      );
    }

    if (session.status === "COMPLETED") {
      return NextResponse.json(
        { error: "Session is already completed." },
        { status: 400 }
      );
    }

    // Record teammate missed exam if teammate hadn't joined
    if (session.user2Id && !session.user2JoinedAt) {
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

    // Switch to SOLO mode with fresh 90 min timer
    session.mode = "SOLO";
    session.status = "IN_PROGRESS";
    session.startTime = new Date();
    session.endTime = new Date(Date.now() + 90 * 60 * 1000); // 90 min timer

    await session.save();

    console.log(`✅ Session ${sessionId} switched to SOLO mode for User ${userId}`);

    return NextResponse.json({
      success: true,
      session: {
        sessionId: session.sessionId,
        weekNumber: session.weekNumber,
        user1Id: session.user1Id,
        user2Id: null,
        mode: "SOLO",
        status: "IN_PROGRESS",
        startTime: session.startTime,
        endTime: session.endTime,
      },
      message: "Switched to solo mode. 90-minute timer started.",
    });
  } catch (error) {
    console.error("❌ Error switching to solo mode:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
