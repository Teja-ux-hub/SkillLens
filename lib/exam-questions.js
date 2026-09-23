import { mcqsWebdev, aiMlMcqs, cyberMCQ, DataAnaMCQ } from "@/data/mockQuesitons";
import { mobiledevMCQ, cloudMcqs, gameMcqs, blockchainMcqs } from "@/data/mockQuestions2";
import { uiuxMCQ } from "@/data/mockdata3";

// Map roadmaps to their respective MCQ question lists from mockQuesitons.jsx
export const roadmapMCQMap = {
  webdeveloper: mcqsWebdev || [],
  "ai/mlengineer": aiMlMcqs || [],
  datascience: DataAnaMCQ || [],
  CybersecurityAnalyst: cyberMCQ || [],
  cybersecurityspecialist: cyberMCQ || [],
  MobileAppDeveloper: mobiledevMCQ || [],
  mobileappdeveloper: mobiledevMCQ || [],
  CloudDevOpsEngineer: cloudMcqs || [],
  cloudarchitect: cloudMcqs || [],
  devopsengineer: cloudMcqs || [],
  GameDeveloper: gameMcqs || [],
  gameengineer: gameMcqs || [],
  BlockchainDeveloper: blockchainMcqs || [],
  blockchainengineer: blockchainMcqs || [],
  UIUXDesigner: uiuxMCQ || [],
  "ui/uxdesigner": uiuxMCQ || [],
};

/**
 * Get the exact 10 weekly questions from mockQuesitons.jsx
 * @param {number} weekNumber - 1 to 10
 * @param {string} roadmapRole - optional role name (defaults to webdeveloper)
 * @param {number} count - number of questions to pick (default: 10)
 * @returns {{ sanitizedQuestions: Array, answerKey: Object }}
 */
export function getExamQuestionsForWeek(weekNumber, roadmapRole = null, count = 10) {
  const targetWeek = parseInt(weekNumber) || 1;
  let pool = [];

  // 1. Try to draw strictly from the requested role's track in mockQuesitons
  const selectedRole = roadmapRole && roadmapMCQMap[roadmapRole] ? roadmapRole : "webdeveloper";
  const questionDataset = roadmapMCQMap[selectedRole] || mcqsWebdev;

  const matchingQuestions = questionDataset.filter(
    (q) => parseInt(q.week) === targetWeek
  );

  if (matchingQuestions.length > 0) {
    pool = [...matchingQuestions];
  } else {
    // Fallback: draw directly from mcqsWebdev for that week
    pool = (mcqsWebdev || []).filter((q) => parseInt(q.week) === targetWeek);
  }

  // If still fewer than count, fallback to first available questions
  if (pool.length === 0) {
    pool = (mcqsWebdev || []).slice(0, count);
  }

  // Take the 10 questions for that week
  const selected = pool.slice(0, count);

  const sanitizedQuestions = [];
  const answerKey = {};

  selected.forEach((q, index) => {
    const qId = q._customId || `w${targetWeek}_q${index + 1}`;
    const correctAnswer = q.correctAnswer || q.answer || (q.options && q.options[0]) || "";

    answerKey[qId] = correctAnswer;

    sanitizedQuestions.push({
      id: qId,
      week: targetWeek,
      topic: q.topic || "Technical Assessment",
      question: q.question,
      options: q.options || [],
      explanation: q.explanation || "",
    });
  });

  return {
    sanitizedQuestions,
    answerKey,
  };
}
