import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/db";
import User from "@/models/UserModel";
import WeeklyHistory from "@/models/WeeklyHistoryModel";

export async function GET(request) {
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

    await dbConnect();

    const user = await User.findOne({ clerkUserId: userId }).lean();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get all weekly history records for this user
    const historyRecords = await WeeklyHistory.find({ userId })
      .sort({ weekNumber: 1 })
      .lean();

    // Map history to weeks 1-10
    const historyMap = {};
    historyRecords.forEach((rec) => {
      historyMap[rec.weekNumber] = rec;
    });

    const weeks = [];
    const now = Date.now();
    const SIX_DAYS_MS = 6 * 24 * 60 * 60 * 1000;

    for (let w = 1; w <= 10; w++) {
      const record = historyMap[w];
      const isAttempted = !!record;
      const isPassed = record ? (record.percentage >= 80 || record.score >= 8) : false;

      let isLocked = false;
      let lockReason = null;
      let lockMessage = null;
      let unlockDate = null;
      let daysRemaining = null;

      if (w > 1) {
        const prevRecord = historyMap[w - 1];
        const prevPassed = prevRecord ? (prevRecord.percentage >= 80 || prevRecord.score >= 8) : false;

        if (!prevPassed) {
          isLocked = true;
          lockReason = "SCORE_NOT_MET";
          lockMessage = `Requires at least 80% (8/10) on Week ${w - 1} exam.`;
        } else {
          // Check 6-day cooldown
          const prevSubmitTime = new Date(prevRecord.submittedAt || Date.now()).getTime();
          const unlockTime = prevSubmitTime + SIX_DAYS_MS;

          if (now < unlockTime) {
            isLocked = true;
            lockReason = "COOLDOWN_ACTIVE";
            unlockDate = new Date(unlockTime).toISOString();
            daysRemaining = Math.max(1, Math.ceil((unlockTime - now) / (24 * 60 * 60 * 1000)));
            lockMessage = `6-day study gap required. Unlocks on ${new Date(unlockTime).toLocaleDateString()} (${daysRemaining} day${daysRemaining > 1 ? "s" : ""} left).`;
          }
        }
      }

      weeks.push({
        weekNumber: w,
        attempted: isAttempted,
        isPassed,
        isLocked,
        lockReason,
        lockMessage,
        unlockDate,
        daysRemaining,
        score: record ? record.score : null,
        percentage: record ? record.percentage : null,
        status: record ? record.completionStatus : "NOT_ATTEMPTED",
        mode: record ? record.mode : null,
        submittedAt: record ? record.submittedAt : null,
      });
    }

    // Teammate details
    let teammate = null;
    if (user.matching?.teammateId) {
      const tm = await User.findOne({ clerkUserId: user.matching.teammateId })
        .select("firstName lastName username email profile.avatarUrl onboarding.selectedRole reliability")
        .lean();
      if (tm) {
        teammate = {
          userId: user.matching.teammateId,
          name: tm.firstName && tm.lastName ? `${tm.firstName} ${tm.lastName}` : tm.username || "Teammate",
          username: tm.username,
          avatarUrl: tm.profile?.avatarUrl,
          role: tm.onboarding?.selectedRole,
          missedExams: tm.reliability?.missedExams || 0,
        };
      }
    }

    return NextResponse.json({
      success: true,
      currentWeek: user.roadmap?.currentWeek || 1,
      selectedRole: user.onboarding?.selectedRole || user.roadmap?.role || "Web Developer",
      reliability: user.reliability || { missedExams: 0, isFlagged: false },
      teammate,
      weeks,
      summary: user.assessmentSummary || {
        totalAttempts: 0,
        totalCompleted: 0,
        averageScore: 0,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching exam history:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
