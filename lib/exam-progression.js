import WeeklyHistory from "@/models/WeeklyHistoryModel";
import ExamAttempt from "@/models/ExamAttemptModel";

export const PASSING_GRADE_PERCENTAGE = 80; // 80% (8/10 questions)
export const REQUIRED_STUDY_GAP_DAYS = 6; // 6 days minimum gap between weeks
export const REQUIRED_STUDY_GAP_MS = REQUIRED_STUDY_GAP_DAYS * 24 * 60 * 60 * 1000;

/**
 * Validates if a user is eligible to start a given week's exam
 * @param {string} userId - User's Clerk ID
 * @param {number} targetWeek - 1 to 10
 * @param {boolean} devBypass - Whether to bypass checks for testing
 * @returns {Promise<{ allowed: boolean, reason?: string, message?: string, unlockDate?: string, daysRemaining?: number, prevScore?: number }>}
 */
export async function validateWeekProgression(userId, targetWeek, devBypass = false) {
  const week = parseInt(targetWeek) || 1;

  // Week 1 is always unlocked
  if (week <= 1) {
    return { allowed: true };
  }

  // If developer bypass is active, allow starting
  if (devBypass) {
    return { allowed: true, bypassed: true };
  }

  const prevWeek = week - 1;

  // 1. Check previous week's highest score from WeeklyHistory & ExamAttempt
  let prevHistory = await WeeklyHistory.findOne({
    userId,
    weekNumber: prevWeek,
  })
    .sort({ percentage: -1 })
    .lean();

  if (!prevHistory) {
    // Fallback: check ExamAttempt
    const prevAttempt = await ExamAttempt.findOne({
      userId,
      weekNumber: prevWeek,
    })
      .sort({ percentage: -1 })
      .lean();

    if (prevAttempt) {
      prevHistory = {
        score: prevAttempt.score,
        percentage: prevAttempt.percentage,
        submittedAt: prevAttempt.submittedAt || prevAttempt.createdAt,
      };
    }
  }

  // Condition 1: Must have completed previous week with >= 80%
  const prevPercentage = prevHistory ? (prevHistory.percentage ?? 0) : 0;
  const prevPassed = prevHistory && (prevPercentage >= PASSING_GRADE_PERCENTAGE || (prevHistory.score >= 8));

  if (!prevPassed) {
    return {
      allowed: false,
      reason: "SCORE_REQUIREMENT_NOT_MET",
      prevScore: prevPercentage,
      requiredScore: PASSING_GRADE_PERCENTAGE,
      message: `You must score at least ${PASSING_GRADE_PERCENTAGE}% (8/10) on Week ${prevWeek} exam before unlocking Week ${week}. Current: ${prevPercentage}%.`,
    };
  }

  // Condition 2: Must have at least 6 days of gap since previous week's exam completion
  const submittedTime = new Date(prevHistory.submittedAt || Date.now()).getTime();
  const unlockTime = submittedTime + REQUIRED_STUDY_GAP_MS;
  const now = Date.now();

  if (now < unlockTime) {
    const diffMs = unlockTime - now;
    const daysRemaining = Math.max(1, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));
    const unlockDate = new Date(unlockTime);

    return {
      allowed: false,
      reason: "COOLDOWN_ACTIVE",
      unlockDate: unlockDate.toISOString(),
      unlockDateFormatted: unlockDate.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      daysRemaining,
      message: `Weekly exams require at least 6 days of preparation between weeks. Week ${week} unlocks on ${unlockDate.toLocaleDateString()} (${daysRemaining} day${daysRemaining > 1 ? "s" : ""} remaining).`,
    };
  }

  return { allowed: true };
}
