"use client"
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, BookOpen, Target, Trophy, RotateCcw, ArrowLeft, AlertTriangle, Check, Shield } from 'lucide-react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

// Import your MCQ datasets - replace these imports with your actual data files
import { mcqsWebdev, aiMlMcqs, cyberMCQ, DataAnaMCQ, agenticAiMCQ } from '@/data/mockQuesitons';
import { mobiledevMCQ, cloudMcqs, gameMcqs, blockchainMcqs } from '@/data/mockQuestions2';
import { uiuxMCQ } from '@/data/mockdata3';

const allMCQs = {
  'webdeveloper': mcqsWebdev,
  'ai/mlengineer': aiMlMcqs,
  'CybersecurityAnalyst': cyberMCQ,
  'datascience': DataAnaMCQ,
  'MobileAppDeveloper': mobiledevMCQ,
  'CloudDevOpsEngineer': cloudMcqs,
  'GameDeveloper': gameMcqs,
  'BlockchainDeveloper': blockchainMcqs,
  'UIUXDesigner': uiuxMCQ,
  'agenticaiengineer': agenticAiMCQ,
  // ... other roadmaps
};

// Function to convert roadmap display names to MCQ keys
const getRoadmapKey = (roadmapName) => {
  const mappings = {
    'Frontend Developer': 'webdeveloper',
    'AI/ML Engineer': 'ai/mlengineer',
    'Data Scientist': 'datascience',
    'MobileAppDeveloper': 'MobileAppDeveloper',
    'CybersecurityAnalyst': 'CybersecurityAnalyst',
    'CloudDevOpsEngineer': 'CloudDevOpsEngineer',
    'GameDeveloper': 'GameDeveloper',
    'BlockchainDeveloper': 'BlockchainDeveloper',
    'UI/UXDesigner': 'UIUXDesigner',
    // Add more mappings as needed
  };
  return mappings[roadmapName] || roadmapName.toLowerCase().replace(/[^a-z0-9]/g, '');
};

const QuizPage = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const weekId = parseInt(params.weekid);
  const roadmap = searchParams.get('roadmap') || 'webdeveloper'; // Get roadmap from URL params
  
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [userAnswers, setUserAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(600);
  const [quizStarted, setQuizStarted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showExitConfirmModal, setShowExitConfirmModal] = useState(false);

  // Strict Exam Guard: Prevent Accidental Exit, Browser Back, Page Refresh, and Monitor Tab Switching
  useEffect(() => {
    if (!quizStarted || showResults) return;

    // 1. Native Browser Close / Refresh Warning
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "Quiz is currently in progress! If you leave or refresh, your current quiz attempt and score will not be saved.";
      return e.returnValue;
    };

    // 2. Browser Back / Forward History Trap
    window.history.pushState({ inQuiz: true }, "", window.location.href);

    const handlePopState = () => {
      // Re-push current state to trap navigation
      window.history.pushState({ inQuiz: true }, "", window.location.href);

      // Flash top toast
      toast.error("⚠️ Quiz in progress! You cannot go back while writing the quiz.", {
        description: "Please submit your quiz to record your progress, or use the exit dialog to abandon it.",
        duration: 5000,
      });

      // Open strict confirmation modal
      setShowExitConfirmModal(true);
    };

    // 3. Tab Switching Alert
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        toast.warning("⚠️ Attention: Leaving or switching tabs during the quiz is strictly monitored!", {
          duration: 4500,
        });
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [quizStarted, showResults]);

  // Load questions for the specific week and roadmap
  useEffect(() => {
    const loadQuestions = () => {
      setLoading(true);
      
      // Convert roadmap name to the correct key
      const roadmapKey = getRoadmapKey(roadmap);
      console.log(`Converting roadmap "${roadmap}" to key "${roadmapKey}"`);
      
      // Get the MCQ dataset for the selected roadmap
      const roadmapMCQs = allMCQs[roadmapKey];
      
      if (!roadmapMCQs) {
        console.error(`No MCQ data found for roadmap key: ${roadmapKey} (original: ${roadmap})`);
        console.log('Available roadmap keys:', Object.keys(allMCQs));
        setQuestions([]);
        setLoading(false);
        return;
      }
      
      // Filter questions for the specific week
      const weekQuestions = roadmapMCQs.filter(q => q.week === weekId);
      
      console.log(`Loaded ${weekQuestions.length} questions for ${roadmap} week ${weekId}`);
      
      setQuestions(weekQuestions);
      setUserAnswers(new Array(weekQuestions.length).fill(''));
      setLoading(false);
    };

    loadQuestions();
  }, [weekId, roadmap]);

  // Timer
  useEffect(() => {
    let timer;
    if (quizStarted && timeLeft > 0 && !showResults) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && quizStarted) {
      handleSubmitQuiz();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, quizStarted, showResults]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = answer;
    setUserAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(userAnswers[currentQuestion + 1] || '');
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(userAnswers[currentQuestion - 1] || '');
    }
  };

  const handleSubmitQuiz = async () => {
    setShowResults(true);
    
    // Save the mock score to database
    const percentage = getPercentage();
    console.log(`Saving mock score: ${percentage}% for roadmap "${roadmap}" week ${weekId}`);
    
    try {
      const response = await fetch('/api/save-mock-score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roadmap: roadmap,
          weekId: weekId,
          mockScore: percentage
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Mock score saved successfully:', result);
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to save mock score:', response.status, errorText);
      }
    } catch (error) {
      console.error('❌ Error saving mock score:', error);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((question, index) => {
      if (userAnswers[index] === question.answer) {
        correct++;
      }
    });
    return correct;
  };

  const getScorePoints = () => {
    const correct = calculateScore();
    return Math.round((correct / questions.length) * 20);
  };

  const getPercentage = () => {
    const correct = calculateScore();
    return Math.round((correct / questions.length) * 100);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer('');
    setUserAnswers(new Array(questions.length).fill(''));
    setShowResults(false);
    setQuizStarted(false);
    setTimeLeft(600);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-white mb-2">Loading Quiz...</h2>
          <p className="text-gray-300">Week {weekId} • {roadmap.toUpperCase()}</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">No Questions Available</h2>
          <p className="text-gray-300">Week {weekId} questions for {roadmap.toUpperCase()} are not available yet.</p>
          <p className="text-gray-400 text-sm mt-2">Available roadmaps: {Object.keys(allMCQs).join(', ')}</p>
        </div>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700/50 p-8 text-center">
            <Target className="w-16 h-16 text-cyan-400 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-white mb-4">
              {roadmap.toUpperCase()} - Week {weekId} Quiz
            </h1>
            <p className="text-gray-300 text-lg mb-6">Test your knowledge with {questions.length} questions</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-900/30 border border-blue-500/20 rounded-lg p-4">
                <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <h3 className="text-white font-semibold mb-1">Time Limit</h3>
                <p className="text-blue-300">10 minutes</p>
              </div>
              <div className="bg-green-900/30 border border-green-500/20 rounded-lg p-4">
                <Trophy className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <h3 className="text-white font-semibold mb-1">Max Score</h3>
                <p className="text-green-300">20 points</p>
              </div>
              <div className="bg-purple-900/30 border border-purple-500/20 rounded-lg p-4">
                <BookOpen className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <h3 className="text-white font-semibold mb-1">Questions</h3>
                <p className="text-purple-300">{questions.length} MCQs</p>
              </div>
            </div>

            <button
              onClick={() => setQuizStarted(true)}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-cyan-600 hover:to-blue-600 transition-all transform hover:scale-105 shadow-lg"
            >
              Start Quiz 🚀
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    const score = calculateScore();
    const percentage = getPercentage();
    const points = getScorePoints();

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700/50 p-8">
            <div className="text-center mb-8">
              <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-6 animate-bounce" />
              <h1 className="text-3xl font-bold text-white mb-4">Quiz Completed!</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-green-900/30 border border-green-500/20 rounded-lg p-6">
                  <div className="text-3xl font-bold text-green-400 mb-2">{score}/{questions.length}</div>
                  <div className="text-green-300">Correct Answers</div>
                </div>
                <div className="bg-blue-900/30 border border-blue-500/20 rounded-lg p-6">
                  <div className="text-3xl font-bold text-blue-400 mb-2">{percentage}%</div>
                  <div className="text-blue-300">Accuracy</div>
                </div>
                <div className="bg-yellow-900/30 border border-yellow-500/20 rounded-lg p-6">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">{points}/20</div>
                  <div className="text-yellow-300">Points Earned</div>
                </div>
              </div>

              {/* 80% Passing Status Banner */}
              <div className={`p-4 rounded-xl border mb-8 text-sm flex items-center justify-center gap-2.5 ${
                percentage >= 80 
                  ? "bg-green-950/40 border-green-500/40 text-green-300"
                  : "bg-amber-950/40 border-amber-500/40 text-amber-300"
              }`}>
                {percentage >= 80 ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="font-semibold">
                      Passing Grade Achieved (≥80%)! You can now mark Week {weekId} as completed on your roadmap! ✅
                    </span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                    <span className="font-semibold">
                      Score: {percentage}% — You need at least 80% to mark Week {weekId} as completed. Please retake to improve! ⚠️
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Detailed Results */}
            <div className="space-y-4 mb-8">
              <h2 className="text-xl font-bold text-white mb-4">Detailed Results</h2>
              {questions.map((question, index) => {
                const userAnswer = userAnswers[index];
                const isCorrect = userAnswer === question.answer;
                
                return (
                  <div key={index} className={`border rounded-lg p-4 ${
                    isCorrect ? 'border-green-500/30 bg-green-900/20' : 'border-red-500/30 bg-red-900/20'
                  }`}>
                    <div className="flex items-start space-x-3">
                      {isCorrect ? (
                        <CheckCircle className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-400 mt-1 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-2">Q{index + 1}: {question.question}</h3>
                        <div className="space-y-1 text-sm">
                          <p className="text-gray-300">
                            <span className="font-medium">Your answer:</span> 
                            <span className={userAnswer === question.answer ? 'text-green-400' : 'text-red-400'}>
                              {userAnswer || 'Not answered'}
                            </span>
                          </p>
                          {!isCorrect && (
                            <p className="text-gray-300">
                              <span className="font-medium">Correct answer:</span> 
                              <span className="text-green-400">{question.answer}</span>
                            </p>
                          )}
                          <p className="text-gray-400 text-xs">{question.explanation}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={resetQuiz}
                className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-gray-700 hover:to-gray-800 transition-all flex items-center space-x-2"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Retake Quiz</span>
              </button>
              <button
                onClick={() => window.history.back()}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all flex items-center space-x-2"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Roadmap</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700/50 mb-6 p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-white">
              {roadmap.toUpperCase()} - Week {weekId} Quiz
            </h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-cyan-400">
                <Clock className="w-5 h-5" />
                <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
              </div>
              <div className="text-gray-300">
                {currentQuestion + 1} / {questions.length}
              </div>
              <button
                onClick={() => setShowExitConfirmModal(true)}
                className="flex items-center gap-1 text-gray-400 hover:text-red-400 hover:bg-red-500/10 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-gray-700 hover:border-red-500/30 transition-all"
                title="Exit Quiz"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span>Exit</span>
              </button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700/50 p-8">
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <span className="px-3 py-1 bg-blue-900/30 border border-blue-500/20 rounded-full text-blue-300 text-sm">
                {currentQ.topic}
              </span>
            </div>
            <h2 className="text-xl font-semibold text-white leading-relaxed">
              {currentQ.question}
            </h2>
          </div>

          {/* Options */}
          <div className="space-y-3 mb-8">
            {currentQ.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                  selectedAnswer === option
                    ? 'border-cyan-500 bg-cyan-900/30 shadow-lg shadow-cyan-500/20'
                    : 'border-gray-600/50 bg-gray-700/30 hover:border-cyan-400 hover:bg-cyan-900/20'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    selectedAnswer === option
                      ? 'border-cyan-400 bg-cyan-400'
                      : 'border-gray-500'
                  }`} />
                  <span className="text-white">{option}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={handlePrevQuestion}
              disabled={currentQuestion === 0}
              className="px-6 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex space-x-3">
              {currentQuestion === questions.length - 1 ? (
                <button
                  onClick={handleSubmitQuiz}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all"
                >
                  Submit Quiz
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Question Navigation */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700/50 mt-6 p-6">
          <h3 className="text-white font-semibold mb-4">Question Navigation</h3>
          <div className="grid grid-cols-10 gap-2">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentQuestion(index);
                  setSelectedAnswer(userAnswers[index] || '');
                }}
                className={`w-10 h-10 rounded-lg font-semibold text-sm transition-all ${
                  currentQuestion === index
                    ? 'bg-cyan-500 text-white'
                    : userAnswers[index]
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* Strict Quiz Exit Confirmation Modal */}
      {showExitConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-gray-900 border border-red-500/40 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 flex-shrink-0">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Quiz In Progress</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                    Strict Mode
                  </span>
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  You are currently writing the Week {weekId} quiz. If you leave now, your quiz progress and answers will be lost.
                </p>
              </div>
            </div>

            <div className="bg-gray-950/80 border border-red-500/20 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between text-gray-300 font-medium">
                <span>Progress:</span>
                <span className="text-cyan-400 font-bold">{currentQuestion + 1} / {questions.length} Questions</span>
              </div>
              <div className="flex items-center justify-between text-gray-300 font-medium">
                <span>Time Remaining:</span>
                <span className="text-amber-400 font-mono font-bold">{formatTime(timeLeft)}</span>
              </div>
              <p className="text-[11px] text-gray-400 pt-1 border-t border-gray-800">
                Are you sure you still want to exit?
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                onClick={() => setShowExitConfirmModal(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-md hover:shadow-cyan-500/20 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Stay & Continue Quiz
              </button>
              <button
                onClick={() => {
                  setShowExitConfirmModal(false);
                  router.push('/roadmaps');
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/30 transition-colors"
              >
                Yes, Abandon & Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

  );
};

export default QuizPage;