import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/db";
import User from "@/models/UserModel";
import ExamSession from "@/models/ExamSessionModel";
import ExamAttempt from "@/models/ExamAttemptModel";
import WeeklyHistory from "@/models/WeeklyHistoryModel";
import { getExamQuestionsForWeek } from "@/lib/exam-questions";
import { mcqsWebdev, aiMlMcqs, cyberMCQ, DataAnaMCQ } from "@/data/mockQuesitons";
import { mobiledevMCQ, cloudMcqs, gameMcqs, blockchainMcqs } from "@/data/mockQuestions2";
import { uiuxMCQ } from "@/data/mockdata3";
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
    const { sessionId, answers = {} } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    await dbConnect();

    const session = await ExamSession.findOne({ sessionId });
    if (!session) {
      return NextResponse.json({ error: "Exam session not found" }, { status: 404 });
    }

    const isUser1 = session.user1Id === userId;
    const isUser2 = session.user2Id === userId;

    if (!isUser1 && !isUser2) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Enforce progression check: Can only submit if prerequisite >= 80% and 6-day cooldown met
    if (session.weekNumber > 1) {
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
          },
          { status: 403 }
        );
      }
    }

    // Server-Side Scoring against isolated session.answerKey & dataset fallbacks
    const selectedQuestions = session.selectedQuestions || [];
    const totalQuestions = selectedQuestions.length || 10;

    let correctCount = 0;
    let wrongCount = 0;
    const questionReview = [];

    selectedQuestions.forEach((q, idx) => {
      const qId = q.id || `w${session.weekNumber || 1}_q${idx + 1}`;

      // Resolve user answer (checking by ID string/number and index)
      let userAnswer = null;
      if (answers[qId] !== undefined) {
        userAnswer = answers[qId];
      } else if (answers[String(qId)] !== undefined) {
        userAnswer = answers[String(qId)];
      } else if (answers[idx] !== undefined) {
        userAnswer = answers[idx];
      }

      // Resolve correct answer (safely handling Mongoose Map vs plain Object)
      let correctAnswer = null;
      if (session.answerKey) {
        if (typeof session.answerKey.get === "function") {
          correctAnswer = session.answerKey.get(qId) || session.answerKey.get(String(qId));
        } else if (typeof session.answerKey === "object") {
          correctAnswer = session.answerKey[qId] || session.answerKey[String(qId)];
        }
      }

      // Fallback 1: Check question object properties
      if (!correctAnswer) {
        correctAnswer = q.correctAnswer || q.answer;
      }

      // Fallback 2: Generate week answer key from questions generator
      if (!correctAnswer) {
        try {
          const { answerKey: generatedKey } = getExamQuestionsForWeek(session.weekNumber || 1, null, 10);
          correctAnswer = generatedKey[qId] || generatedKey[`w${session.weekNumber || 1}_q${idx + 1}`];
        } catch (e) {
          console.warn("Could not generate fallback key:", e.message);
        }
      }

      // Fallback 3: Search matching question text in mock datasets
      if (!correctAnswer && q.question) {
        const allMCQs = [
          ...mcqsWebdev,
          ...aiMlMcqs,
          ...cyberMCQ,
          ...DataAnaMCQ,
          ...mobiledevMCQ,
          ...cloudMcqs,
          ...gameMcqs,
          ...blockchainMcqs,
          ...uiuxMCQ,
        ];
        const match = allMCQs.find(
          (item) => String(item.question).trim() === String(q.question).trim()
        );
        if (match) {
          correctAnswer = match.correctAnswer || match.answer;
        }
      }

      // Robust comparison (trims and lowercases both strings)
      const isCorrect =
        userAnswer !== null &&
        userAnswer !== undefined &&
        correctAnswer !== null &&
        correctAnswer !== undefined &&
        String(userAnswer).trim().toLowerCase() === String(correctAnswer).trim().toLowerCase();

      if (isCorrect) {
        correctCount++;
      } else {
        wrongCount++;
      }

      questionReview.push({
        id: qId,
        question: q.question,
        options: q.options,
        userAnswer,
        correctAnswer,
        isCorrect,
        explanation: q.explanation,
      });
    });

    const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const passed = percentage >= 80; // Required 80% (8/10) to pass and unlock next week

    // 1. Record ExamAttempt
    const attempt = await ExamAttempt.findOneAndUpdate(
      { sessionId, userId },
      {
        sessionId,
        userId,
        weekNumber: session.weekNumber,
        mode: session.mode,
        answers,
        score: correctCount,
        totalQuestions,
        percentage,
        correct: correctCount,
        wrong: wrongCount,
        passed,
        submittedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // 2. Record WeeklyHistory
    const partnerId = isUser1 ? session.user2Id : session.user1Id;
    await WeeklyHistory.findOneAndUpdate(
      { userId, weekNumber: session.weekNumber },
      {
        userId,
        weekNumber: session.weekNumber,
        sessionId,
        score: correctCount,
        percentage,
        completionStatus: passed ? "PASSED" : "FAILED",
        mode: session.mode,
        partnerId: partnerId || null,
        submittedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // 3. Update User Aggregate Stats
    const user = await User.findOne({ clerkUserId: userId });
    if (user) {
      if (!user.assessmentSummary) {
        user.assessmentSummary = {
          totalAttempts: 0,
          totalCompleted: 0,
          averageScore: 0,
          latestScore: 0,
          bestScore: 0,
        };
      }

      const prevCompleted = user.assessmentSummary.totalCompleted || 0;
      const prevAvg = user.assessmentSummary.averageScore || 0;
      const newTotalCompleted = prevCompleted + 1;
      const newAvg = Math.round((prevAvg * prevCompleted + percentage) / newTotalCompleted);

      user.assessmentSummary.totalAttempts = (user.assessmentSummary.totalAttempts || 0) + 1;
      user.assessmentSummary.totalCompleted = newTotalCompleted;
      user.assessmentSummary.averageScore = newAvg;
      user.assessmentSummary.latestScore = percentage;
      user.assessmentSummary.bestScore = Math.max(user.assessmentSummary.bestScore || 0, percentage);
      user.assessmentSummary.lastAttemptAt = new Date();

      // If passed and unlocks next week, update roadmap week
      if (passed && user.roadmap) {
        const nextWeek = Math.min(10, (session.weekNumber || 1) + 1);
        if (nextWeek > (user.roadmap.currentWeek || 1)) {
          user.roadmap.currentWeek = nextWeek;
          user.roadmap.progress = Math.min(100, Math.round((nextWeek / 10) * 100));
        }
      }

      user.markModified("assessmentSummary");
      user.markModified("roadmap");
      await user.save();
    }

    // 4. Update ExamSession status
    if (isUser1) {
      session.user1SubmittedAt = new Date();
    } else if (isUser2) {
      session.user2SubmittedAt = new Date();
    }

    // Check completion condition
    if (session.mode === "SOLO") {
      session.status = "COMPLETED";
    } else if (session.mode === "PAIRED") {
      if (session.user1SubmittedAt && session.user2SubmittedAt) {
        session.status = "COMPLETED";
      }
    }

    await session.save();

    // Check if partner has submitted
    let partnerAttempt = null;
    if (partnerId) {
      partnerAttempt = await ExamAttempt.findOne({ sessionId, userId: partnerId }).lean();
    }

    console.log(`🎯 User ${userId} submitted session ${sessionId}: ${correctCount}/${totalQuestions} (${percentage}%)`);

    return NextResponse.json({
      success: true,
      result: {
        score: correctCount,
        totalQuestions,
        percentage,
        correct: correctCount,
        wrong: wrongCount,
        passed,
        submittedAt: attempt.submittedAt,
        sessionStatus: session.status,
        questionReview,
      },
      partnerResult: partnerAttempt
        ? {
            submitted: true,
            score: session.status === "COMPLETED" ? partnerAttempt.score : null,
            percentage: session.status === "COMPLETED" ? partnerAttempt.percentage : null,
            submittedAt: partnerAttempt.submittedAt,
          }
        : null,
    });
  } catch (error) {
    console.error("❌ Error submitting exam:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
