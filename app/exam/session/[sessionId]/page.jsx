"use client";

import React, { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import {
  Clock,
  Users,
  Trophy,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Send,
  Zap,
  Shield,
  FileText,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Eye,
  Check,
  Award,
  AlertCircle,
  Lock,
} from "lucide-react";
import { getSocket } from "@/lib/socket";

export default function ExamSessionPage({ params }) {
  const unwrappedParams = use(params);
  const sessionId = unwrappedParams.sessionId;
  const router = useRouter();
  const { user, isLoaded } = useUser();

  // Core State
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [partner, setPartner] = useState(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [qId]: selectedOption }
  const [submitting, setSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [examResult, setExamResult] = useState(null);
  const [partnerResult, setPartnerResult] = useState(null);

  // Split-screen View control (Guaranteed 50/50 Desktop & Snapped screen support)
  const [viewMode, setViewMode] = useState("split"); // "split" | "exam" | "partner"
  const [mobileTab, setMobileTab] = useState("exam"); // fallback for small screens

  // 90-Minute Timer & Join Deadline Timer
  const [secondsRemaining, setSecondsRemaining] = useState(90 * 60);
  const [joinSecondsRemaining, setJoinSecondsRemaining] = useState(60 * 60);

  // Teammate Live Progress (Zero answer leakage)
  const [partnerProgress, setPartnerProgress] = useState({
    currentQuestion: 1,
    answeredCount: 0,
    totalQuestions: 10,
    online: false,
    submitted: false,
  });

  // Collaborative Discussion Workspace (Tagged User A / User B)
  const [discussionContent, setDiscussionContent] = useState("");
  const [discussionMessages, setDiscussionMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const messagesEndRef = useRef(null);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [partnerTypingName, setPartnerTypingName] = useState("");
  const [discussionSaveStatus, setDiscussionSaveStatus] = useState("Saved"); // "Saving..." | "Saved"
  const typingTimeoutRef = useRef(null);

  // Confirmation Modal
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // 1. Fetch Exam Session Data on Load
  useEffect(() => {
    if (!isLoaded || !user?.id || !sessionId) return;

    const fetchSession = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/exam/session/${sessionId}`);
        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error || "Failed to load exam session.");
          router.push("/roadmaps");
          return;
        }

        setSession(data.session);
        setQuestions(data.questions || []);
        setPartner(data.partner);
        setDiscussionContent(data.discussionContent || "");
        setDiscussionMessages(data.discussionMessages || []);

        // If already submitted prior
        if (data.myAttempt?.submitted) {
          setIsSubmitted(true);
          setExamResult(data.myAttempt);
        }

        if (data.partnerAttempt?.submitted) {
          setPartnerProgress((prev) => ({ ...prev, submitted: true }));
          setPartnerResult(data.partnerAttempt);
        }

        // Calculate timer values from server response
        const now = new Date(data.serverTime || Date.now()).getTime();

        if (data.session.endTime) {
          const end = new Date(data.session.endTime).getTime();
          const diffSec = Math.max(0, Math.floor((end - now) / 1000));
          setSecondsRemaining(diffSec);
        }

        if (data.session.joinDeadline) {
          const joinEnd = new Date(data.session.joinDeadline).getTime();
          const joinDiffSec = Math.max(0, Math.floor((joinEnd - now) / 1000));
          setJoinSecondsRemaining(joinDiffSec);
        }
      } catch (err) {
        console.error("Error fetching session:", err);
        toast.error("Error loading session data.");
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId, user?.id, isLoaded, router]);

  // 2. Socket.IO Real-Time Synchronization
  useEffect(() => {
    if (!user?.id || !sessionId) return;

    const socket = getSocket();
    if (!socket) return;

    // Join room
    socket.emit("exam:join-room", {
      sessionId,
      userId: user.id,
      userName: user.fullName || user.username || "Partner",
    });

    // Listen for partner progress updates
    const handlePartnerProgress = (data) => {
      setPartnerProgress((prev) => ({
        ...prev,
        currentQuestion: data.currentQuestion,
        answeredCount: data.answeredCount,
        totalQuestions: data.totalQuestions || 10,
        online: true,
      }));
    };

    // Listen for partner online/offline status
    const handlePartnerStatus = (data) => {
      setPartnerProgress((prev) => ({
        ...prev,
        online: data.online,
      }));
      if (data.online) {
        toast.info(`${data.userName || "Teammate"} is connected!`);
        setSession((prev) => {
          if (!prev) return prev;
          if (prev.status === "WAITING_FOR_TEAMMATE" || prev.status === "SOLO_AVAILABLE") {
            return {
              ...prev,
              status: "IN_PROGRESS",
            };
          }
          return prev;
        });
      }
    };

    // Listen for session active event (both partners joined room)
    const handleSessionActive = (data) => {
      console.log("🎉 Both partners connected! Activating session live...");
      setSession((prev) => (prev ? { ...prev, status: "IN_PROGRESS" } : prev));
      setPartnerProgress((prev) => ({ ...prev, online: true }));
      toast.success("Both partners connected! 90-minute exam has started!");
    };

    // Listen for partner submission
    const handlePartnerSubmitted = (data) => {
      setPartnerProgress((prev) => ({ ...prev, submitted: true }));
      toast.success(`🏁 ${data.userName || "Your partner"} has submitted their exam!`);
      if (data.score !== undefined) {
        setPartnerResult({
          score: data.score,
          percentage: data.percentage,
        });
      }
    };

    // Listen for collaborative discussion document updates
    const handleDiscussionUpdated = (data) => {
      if (data.senderId !== user.id) {
        setDiscussionContent(data.content);
        setDiscussionSaveStatus("Saved");
      }
    };

    // Listen for partner typing indicator
    const handlePartnerTyping = (data) => {
      if (data.userId !== user.id) {
        setIsPartnerTyping(data.isTyping);
        setPartnerTypingName(data.userName || "Teammate");
      }
    };

    // Listen for tagged discussion messages (User A / User B)
    const handleDiscussionMessage = (msg) => {
      setDiscussionMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    };

    socket.on("exam:partner-progress", handlePartnerProgress);
    socket.on("exam:partner-status", handlePartnerStatus);
    socket.on("exam:session-active", handleSessionActive);
    socket.on("exam:partner-submitted", handlePartnerSubmitted);
    socket.on("exam:discussion-updated", handleDiscussionUpdated);
    socket.on("exam:discussion-message", handleDiscussionMessage);
    socket.on("exam:partner-typing", handlePartnerTyping);

    return () => {
      socket.emit("exam:leave-room", { sessionId });
      socket.off("exam:partner-progress", handlePartnerProgress);
      socket.off("exam:partner-status", handlePartnerStatus);
      socket.off("exam:session-active", handleSessionActive);
      socket.off("exam:partner-submitted", handlePartnerSubmitted);
      socket.off("exam:discussion-updated", handleDiscussionUpdated);
      socket.off("exam:discussion-message", handleDiscussionMessage);
      socket.off("exam:partner-typing", handlePartnerTyping);
    };
  }, [user?.id, sessionId]);

  // 3. Countdown Timers
  useEffect(() => {
    if (isSubmitted || !session) return;

    const interval = setInterval(() => {
      // 90-minute main exam timer (if IN_PROGRESS)
      if (session.status === "IN_PROGRESS") {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }

      // 60-minute partner join timer (if WAITING_FOR_TEAMMATE)
      if (session.status === "WAITING_FOR_TEAMMATE") {
        setJoinSecondsRemaining((prev) => {
          if (prev <= 1) {
            setSession((s) => ({ ...s, status: "SOLO_AVAILABLE" }));
            toast.warning("Teammate join window expired. You can switch to Solo Mode!");
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [session?.status, isSubmitted]);

  // Format seconds to MM:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // 4. Client-Side Answer Selection (No API calls!)
  const handleSelectOption = (questionId, option) => {
    if (isSubmitted) return;

    const updatedAnswers = {
      ...answers,
      [questionId]: option,
    };
    setAnswers(updatedAnswers);

    // Broadcast updated progress counters via Socket.IO
    const socket = getSocket();
    if (socket && session?.mode === "PAIRED") {
      const answeredCount = Object.keys(updatedAnswers).length;
      socket.emit("exam:progress-change", {
        sessionId,
        currentQuestion: currentQIndex + 1,
        answeredCount,
        totalQuestions: questions.length || 10,
      });
    }
  };

  // Change current question index
  const handleQuestionNavigate = (index) => {
    if (index < 0 || index >= questions.length) return;
    setCurrentQIndex(index);

    // Broadcast current question update to partner
    const socket = getSocket();
    if (socket && session?.mode === "PAIRED") {
      socket.emit("exam:progress-change", {
        sessionId,
        currentQuestion: index + 1,
        answeredCount: Object.keys(answers).length,
        totalQuestions: questions.length || 10,
      });
    }
  };

  // 5. Collaborative Discussion Textarea Change
  const handleDiscussionChange = (e) => {
    const newContent = e.target.value;
    setDiscussionContent(newContent);
    setDiscussionSaveStatus("Saving...");

    const socket = getSocket();
    if (socket) {
      // Emit discussion content update
      socket.emit("exam:discussion-change", {
        sessionId,
        content: newContent,
        userId: user.id,
      });

      // Emit typing indicator
      socket.emit("exam:typing", {
        sessionId,
        userId: user.id,
        userName: user.fullName || user.username || "Partner",
        isTyping: true,
      });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("exam:typing", {
          sessionId,
          userId: user.id,
          userName: user.fullName || user.username || "Partner",
          isTyping: false,
        });
        setDiscussionSaveStatus("Saved");
      }, 1000);
    }
  };

  // Auto-scroll chat feed to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [discussionMessages]);

  // Post Discussion Line with User A / User B Tagging
  const handleSendChatMessage = (e) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || !user?.id) return;

    const isUser1 = session?.user1Id === user?.id;
    const senderLabel = isUser1 ? "User A" : "User B";
    const myName = user.fullName || user.username || senderLabel;

    const newMsg = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      senderId: user.id,
      senderLabel,
      userName: myName,
      text: chatInput.trim(),
      timestamp: new Date().toISOString(),
    };

    // Emit over Socket.IO
    const socket = getSocket();
    if (socket) {
      socket.emit("exam:discussion-message", {
        sessionId,
        message: newMsg,
      });

      // Reset typing indicator
      socket.emit("exam:typing", {
        sessionId,
        userId: user.id,
        userName: senderLabel,
        isTyping: false,
      });
    }

    // Optimistic local update
    setDiscussionMessages((prev) => {
      if (prev.some((m) => m.id === newMsg.id)) return prev;
      return [...prev, newMsg];
    });

    setChatInput("");
  };

  // Real-Time Typing for Chat Input
  const handleChatInputChange = (e) => {
    const val = e.target.value;
    setChatInput(val);

    const socket = getSocket();
    if (socket) {
      const isUser1 = session?.user1Id === user?.id;
      const label = isUser1 ? "User A" : "User B";

      socket.emit("exam:typing", {
        sessionId,
        userId: user.id,
        userName: label,
        isTyping: true,
      });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("exam:typing", {
          sessionId,
          userId: user.id,
          userName: label,
          isTyping: false,
        });
      }, 1200);
    }
  };

  // 6. Switch to Solo Mode Fallback
  const handleSwitchToSolo = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/exam/solo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to switch to solo mode.");
        setLoading(false);
        return;
      }

      setSession((prev) => ({
        ...prev,
        mode: "SOLO",
        status: "IN_PROGRESS",
        startTime: data.session.startTime,
        endTime: data.session.endTime,
      }));

      setSecondsRemaining(90 * 60);
      toast.success("Switched to Solo Mode! 90-minute timer started.");
    } catch (err) {
      console.error("Error switching to solo:", err);
      toast.error("Error triggering solo fallback.");
    } finally {
      setLoading(false);
    }
  };

  // 7. Auto Submit when 90-minute timer expires
  const handleAutoSubmit = () => {
    toast.warning("⏰ Time is up! Auto-submitting your exam now...");
    handleSubmitExam();
  };

  // 8. Submit Exam
  const handleSubmitExam = async () => {
    if (submitting || isSubmitted) return;

    try {
      setSubmitting(true);
      setShowSubmitModal(false);

      const res = await fetch("/api/exam/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          answers,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to submit exam.");
        setSubmitting(false);
        return;
      }

      setIsSubmitted(true);
      setExamResult(data.result);
      if (data.partnerResult) {
        setPartnerResult(data.partnerResult);
      }

      // Notify room via socket
      const socket = getSocket();
      if (socket) {
        socket.emit("exam:submit-notify", {
          sessionId,
          userId: user.id,
          userName: user.fullName || user.username || "Partner",
          score: data.result.score,
          percentage: data.result.percentage,
        });
      }

      toast.success(`Exam submitted! You scored ${data.result.score}/${data.result.totalQuestions} (${data.result.percentage}%)`);
    } catch (err) {
      console.error("Error submitting exam:", err);
      toast.error("Network error while submitting.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-200">
        <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-400">Loading Exam Workspace...</p>
      </div>
    );
  }

  const currentQ = questions[currentQIndex] || null;
  const answeredTotal = Object.keys(answers).length;
  const isTimeCritical = secondsRemaining <= 15 * 60; // under 15 mins
  const isTimeWarning = secondsRemaining <= 5 * 60; // under 5 mins

  // -------------------------------------------------------------
  // POST-EXAM RESULTS SCREEN
  // -------------------------------------------------------------
  if (isSubmitted && examResult) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <Award className="w-4 h-4" />
              Week {session?.weekNumber || 1} Assessment Completed
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
              {examResult.passed ? "Congratulations! You Passed! 🎉" : "Assessment Completed"}
            </h1>
            <p className="text-slate-400 text-sm">
              Review your individual performance, score comparison, and detailed question explanations below.
            </p>
          </div>

          {/* Results Score Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* My Score */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
              <div
                className={`absolute top-0 left-0 right-0 h-1.5 ${
                  examResult.passed ? "bg-emerald-500" : "bg-rose-500"
                }`}
              />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Your Result
              </span>
              <div className="flex items-baseline gap-3 mt-3">
                <span className="text-5xl font-black text-white">{examResult.score}</span>
                <span className="text-2xl font-bold text-slate-500">
                  / {examResult.totalQuestions || 10}
                </span>
                <span
                  className={`ml-auto text-xl font-bold px-3 py-1 rounded-lg ${
                    examResult.passed
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  }`}
                >
                  {examResult.percentage}%
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400">Correct Answers:</span>
                  <p className="text-base font-bold text-emerald-400">{examResult.correct || 0}</p>
                </div>
                <div>
                  <span className="text-slate-400">Incorrect / Skipped:</span>
                  <p className="text-base font-bold text-rose-400">{examResult.wrong || 0}</p>
                </div>
              </div>

              {/* Progression Unlocking Status */}
              <div className={`mt-4 p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                examResult.passed 
                  ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-200" 
                  : "bg-amber-950/20 border-amber-500/30 text-amber-200"
              }`}>
                {examResult.passed ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-emerald-300">Passing Grade Achieved (≥80%)</p>
                      <p className="text-slate-400 mt-0.5">
                        Week {(session?.weekNumber || 1) + 1} unlocks after the mandatory 6-day study gap cooldown.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-300">80% Prerequisite Not Met ({examResult.percentage}%)</p>
                      <p className="text-slate-400 mt-0.5">
                        You need at least 80% (8/10) on this week's exam to unlock Week {(session?.weekNumber || 1) + 1}. Please review explanations and retake!
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Teammate Result Card */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl flex flex-col justify-between">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-indigo-500" />
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Teammate Result
                </span>
                {session?.mode === "SOLO" ? (
                  <div className="mt-4 text-sm text-slate-400">
                    <p className="font-semibold text-slate-200">Solo Exam Mode</p>
                    <p className="text-xs text-slate-500 mt-1">This exam was completed in solo mode.</p>
                  </div>
                ) : partnerResult?.score !== null && partnerResult?.score !== undefined ? (
                  <div className="flex items-baseline gap-3 mt-3">
                    <span className="text-5xl font-black text-indigo-300">{partnerResult.score}</span>
                    <span className="text-2xl font-bold text-slate-500">/ 10</span>
                    <span className="ml-auto text-xl font-bold px-3 py-1 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                      {partnerResult.percentage}%
                    </span>
                  </div>
                ) : partnerProgress.submitted ? (
                  <div className="mt-4 text-sm text-slate-300">
                    <p className="font-semibold text-white">Partner Submitted!</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Both submissions recorded. Refreshing sync...
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 text-sm text-slate-400 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                      <p className="font-medium text-slate-200">{partner?.name || "Teammate"} is still writing...</p>
                    </div>
                    <p className="text-xs text-slate-500">
                      Their score will display here once both of you submit.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Partner: <strong>{partner?.name || "None (Solo)"}</strong></span>
                <span className="text-indigo-400">Simultaneous Pair Sync</span>
              </div>
            </div>
          </div>

          {/* Action Navigation */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/40 border border-slate-800 rounded-xl p-4">
            <button
              onClick={() => router.push("/roadmaps")}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm transition-colors flex items-center justify-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Return to Roadmap
            </button>
            <button
              onClick={() => router.push(`/exam/week/${session?.weekNumber || 1}`)}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              View Exam Hub
            </button>
          </div>

          {/* Detailed Question Review */}
          {examResult.questionReview && (
            <div className="space-y-4 pt-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                Comprehensive Question Review
              </h3>

              <div className="space-y-4">
                {examResult.questionReview.map((q, idx) => (
                  <div
                    key={q.id || idx}
                    className={`bg-slate-900/60 border rounded-xl p-5 space-y-3 transition-colors ${
                      q.isCorrect ? "border-emerald-500/30" : "border-rose-500/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          Q{idx + 1}
                        </span>
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded flex items-center gap-1 ${
                            q.isCorrect
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-rose-500/20 text-rose-400"
                          }`}
                        >
                          {q.isCorrect ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" /> Correct (+1)
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5" /> Incorrect
                            </>
                          )}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm sm:text-base font-medium text-slate-100">
                      {q.question}
                    </p>

                    {/* Options list showing user choice & correct answer */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {q.options?.map((opt, optIdx) => {
                        const isUserChoice = q.userAnswer === opt;
                        const isCorrectOpt = q.correctAnswer === opt;

                        let optClass = "bg-slate-950/40 border-slate-800 text-slate-400";
                        if (isCorrectOpt) {
                          optClass = "bg-emerald-950/40 border-emerald-500/60 text-emerald-200 font-semibold";
                        } else if (isUserChoice && !q.isCorrect) {
                          optClass = "bg-rose-950/40 border-rose-500/60 text-rose-200 font-semibold";
                        }

                        return (
                          <div
                            key={optIdx}
                            className={`p-2.5 rounded-lg border flex items-center justify-between ${optClass}`}
                          >
                            <span>{opt}</span>
                            {isCorrectOpt && (
                              <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">
                                Correct Solution
                              </span>
                            )}
                            {isUserChoice && !isCorrectOpt && (
                              <span className="text-[10px] text-rose-400 uppercase font-bold tracking-wider">
                                Your Selection
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3 text-xs text-slate-300">
                        <strong className="text-cyan-400">Explanation: </strong>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // ACTIVE EXAM WORKSPACE (50/50 Desktop Split)
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col h-screen overflow-hidden">
      {/* Top Header Bar */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between flex-shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h1 className="font-bold text-base sm:text-lg text-white hidden sm:block">
              SkillLens Exam Workspace
            </h1>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-semibold">
            Week {session?.weekNumber || 1}
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 hidden md:inline-block">
            {session?.mode === "SOLO" ? "Solo Mode" : "Pair Mode"}
          </span>
        </div>

        {/* Center: Synchronized Timer & View Mode Switcher */}
        <div className="flex items-center gap-4">
          {session?.status === "WAITING_FOR_TEAMMATE" ? (
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-full text-amber-300 text-xs font-semibold animate-pulse">
              <Clock className="w-4 h-4" />
              <span>Join Window: {formatTime(joinSecondsRemaining)}</span>
            </div>
          ) : (
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full font-mono text-xs sm:text-sm font-bold border transition-colors ${
                isTimeWarning
                  ? "bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse"
                  : isTimeCritical
                  ? "bg-amber-500/20 border-amber-500 text-amber-300"
                  : "bg-slate-800/80 border-slate-700 text-cyan-400"
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{formatTime(secondsRemaining)}</span>
            </div>
          )}

          {/* Guaranteed View Mode Controls */}
          <div className="hidden sm:flex items-center bg-slate-950/80 border border-slate-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setViewMode("split")}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                viewMode === "split"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              50/50 Split Screen
            </button>
            <button
              onClick={() => setViewMode("exam")}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                viewMode === "exam"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Exam Focus
            </button>
            <button
              onClick={() => setViewMode("partner")}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                viewMode === "partner"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Partner Monitor
            </button>
          </div>
        </div>

        {/* Right: Teammate Status Indicator & Submit Trigger */}
        <div className="flex items-center gap-3">
          {session?.mode === "PAIRED" && (
            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400">
              <span
                className={`w-2 h-2 rounded-full ${
                  partnerProgress.online ? "bg-emerald-400" : "bg-slate-500"
                }`}
              />
              <span>{partner?.name || "Teammate"}:</span>
              <span className="font-semibold text-slate-200">
                {partnerProgress.submitted
                  ? "Submitted"
                  : partnerProgress.online
                  ? "Active"
                  : "Connecting..."}
              </span>
            </div>
          )}

          <button
            onClick={() => setShowSubmitModal(true)}
            disabled={submitting}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm px-4 py-1.5 rounded-lg transition-colors shadow-sm"
          >
            Submit Exam
          </button>
        </div>
      </header>

      {/* Mobile Tab Switcher (Visible ONLY on small mobile screens < 768px) */}
      <div className="md:hidden flex border-b border-slate-800 bg-slate-900 text-xs font-medium">
        <button
          onClick={() => setMobileTab("exam")}
          className={`flex-1 py-2.5 text-center ${
            mobileTab === "exam"
              ? "text-cyan-400 border-b-2 border-cyan-400 font-bold"
              : "text-slate-400"
          }`}
        >
          My Exam ({answeredTotal}/{questions.length || 10})
        </button>
        <button
          onClick={() => setMobileTab("teammate")}
          className={`flex-1 py-2.5 text-center ${
            mobileTab === "teammate"
              ? "text-cyan-400 border-b-2 border-cyan-400 font-bold"
              : "text-slate-400"
          }`}
        >
          Teammate Monitor
        </button>
        <button
          onClick={() => setMobileTab("notes")}
          className={`flex-1 py-2.5 text-center ${
            mobileTab === "notes"
              ? "text-cyan-400 border-b-2 border-cyan-400 font-bold"
              : "text-slate-400"
          }`}
        >
          Shared Notes
        </button>
      </div>

      {/* Main 50/50 Desktop & Snapped Window Split Workspace */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* ========================================================
            LEFT PANEL: USER'S EXAM (50% Split)
           ======================================================== */}
        <div
          className={`flex flex-col border-r border-slate-800 bg-slate-950/80 overflow-y-auto transition-all duration-300 ${
            viewMode === "split"
              ? "w-full md:w-1/2 flex"
              : viewMode === "exam"
              ? "w-full flex"
              : "hidden"
          } ${mobileTab !== "exam" && viewMode === "split" ? "hidden md:flex" : "flex"}`}
        >
          {/* Top of Left Panel: 10-Question Navigator Grid */}
          <div className="p-4 sm:p-5 border-b border-slate-800/80 bg-slate-900/40">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                10-Question Navigator
              </span>
              <span className="text-xs text-slate-400">
                Answered: <strong className="text-emerald-400">{answeredTotal}</strong> / {questions.length || 10}
              </span>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
              {questions.map((q, idx) => {
                const isAnswered = answers[q.id] !== undefined;
                const isCurrent = idx === currentQIndex;

                let pillClass = "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700";
                if (isCurrent) {
                  pillClass = "bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-sm shadow-cyan-500/20";
                } else if (isAnswered) {
                  pillClass = "bg-emerald-950/60 text-emerald-300 border-emerald-500/40 font-semibold";
                }

                return (
                  <button
                    key={q.id || idx}
                    onClick={() => handleQuestionNavigate(idx)}
                    className={`h-8 rounded-lg text-xs border flex items-center justify-center transition-all ${pillClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Center of Left Panel: Current Question & Options */}
          <div className="flex-1 p-5 sm:p-8 space-y-6 overflow-y-auto">
            {currentQ ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-md">
                      Question {currentQIndex + 1} of {questions.length || 10}
                    </span>
                    <span className="text-xs text-slate-400 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">
                      {currentQ.topic || "Technical Knowledge"}
                    </span>
                  </div>
                  {answers[currentQ.id] !== undefined && (
                    <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Answered
                    </span>
                  )}
                </div>

                <div className="text-base sm:text-lg font-semibold text-slate-100 leading-relaxed">
                  {currentQ.question}
                </div>

                {/* Option Choices */}
                <div className="space-y-3 pt-2">
                  {currentQ.options?.map((opt, optIdx) => {
                    const isSelected = answers[currentQ.id] === opt;

                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectOption(currentQ.id, opt)}
                        className={`w-full p-4 rounded-xl text-left text-sm transition-all border flex items-center justify-between ${
                          isSelected
                            ? "bg-cyan-950/40 border-cyan-500 text-white shadow-md shadow-cyan-500/10"
                            : "bg-slate-900/50 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs ${
                              isSelected
                                ? "border-cyan-400 bg-cyan-400 text-slate-950 font-bold"
                                : "border-slate-700 text-slate-500"
                            }`}
                          >
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{opt}</span>
                        </div>

                        {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-slate-500 text-sm">
                No question available.
              </div>
            )}
          </div>

          {/* Bottom of Left Panel: Navigation Action Bar */}
          <div className="p-4 sm:p-5 border-t border-slate-800/80 bg-slate-900/40 flex items-center justify-between">
            <button
              onClick={() => handleQuestionNavigate(currentQIndex - 1)}
              disabled={currentQIndex === 0}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                currentQIndex === 0
                  ? "bg-slate-900 text-slate-600 cursor-not-allowed"
                  : "bg-slate-800 text-slate-200 hover:bg-slate-700"
              }`}
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            {answers[currentQ?.id] !== undefined && (
              <button
                onClick={() => {
                  const updated = { ...answers };
                  delete updated[currentQ?.id];
                  setAnswers(updated);
                }}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                Clear Answer
              </button>
            )}

            <button
              onClick={() => handleQuestionNavigate(currentQIndex + 1)}
              disabled={currentQIndex >= questions.length - 1}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                currentQIndex >= questions.length - 1
                  ? "bg-slate-900 text-slate-600 cursor-not-allowed"
                  : "bg-cyan-600 text-white hover:bg-cyan-500"
              }`}
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ========================================================
            RIGHT PANEL: TEAMMATE MONITOR + COLLABORATIVE NOTES (50% Split)
           ======================================================== */}
        <div
          className={`flex flex-col bg-slate-950 overflow-hidden transition-all duration-300 ${
            viewMode === "split"
              ? "w-full md:w-1/2 flex"
              : viewMode === "partner"
              ? "w-full flex"
              : "hidden"
          } ${mobileTab === "exam" && viewMode === "split" ? "hidden md:flex" : "flex"}`}
        >
          {/* Top Half of Right Panel: Live Monitor Card */}
          <div
            className={`p-5 sm:p-6 border-b border-slate-800 bg-slate-900/30 flex-shrink-0 ${
              mobileTab === "notes" ? "hidden md:block" : "block"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                {session?.mode === "SOLO" ? "Assessment Telemetry" : "Teammate Real-Time Monitor"}
              </h3>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/50">
                {session?.mode === "SOLO" ? "Proctored Independent" : "Zero Answer Leakage Active"}
              </span>
            </div>

            {session?.status === "WAITING_FOR_TEAMMATE" ? (
              <div className="bg-slate-950/70 border border-amber-500/30 rounded-xl p-4 space-y-3">
                {/* Teammate Identity Bar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow">
                      {partner?.name ? partner.name.charAt(0).toUpperCase() : "P"}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        {partner?.name || "Matched Teammate"}
                      </h4>
                      <p className="text-xs text-slate-400">@{partner?.username || "teammate"} • {partner?.role || "Developer"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-full text-amber-300 text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <span>Waiting for Partner</span>
                  </div>
                </div>

                {/* Join Countdown & Solo Fallback */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-slate-400">Join Window Remaining:</span>
                    <p className="font-mono font-bold text-amber-300 text-sm mt-0.5">{formatTime(joinSecondsRemaining)}</p>
                  </div>
                  <button
                    onClick={handleSwitchToSolo}
                    className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm self-start sm:self-auto"
                  >
                    <Zap className="w-3.5 h-3.5" /> Start Solo Mode Instantly
                  </button>
                </div>

                {/* Initial Progress Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Partner Progress:</span>
                    <span className="font-semibold text-slate-500">0 / 10 answered (0%)</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-slate-600 h-1.5 rounded-full w-0" />
                  </div>
                </div>
              </div>
            ) : session?.mode === "SOLO" ? (
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow">
                      {user?.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Solo Mode Active</h4>
                      <p className="text-xs text-slate-400">Independent Assessment</p>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-semibold">
                    Live Telemetry
                  </span>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Current Position:</span>
                    <span className="font-semibold text-cyan-400">
                      Question #{currentQIndex + 1} of {questions.length || 10}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Answered Questions:</span>
                    <span className="font-semibold text-emerald-400">
                      {answeredTotal} / {questions.length || 10} ({Math.round((answeredTotal / (questions.length || 10)) * 100)}%)
                    </span>
                  </div>

                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mt-1">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          100,
                          (answeredTotal / (questions.length || 10)) * 100
                        )}%`,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>Passing Benchmark: 6/10 (60%)</span>
                    <span className="text-cyan-400 font-mono">{formatTime(secondsRemaining)} remaining</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-4">
                {/* Partner Identity Bar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow">
                      {partner?.name ? partner.name.charAt(0).toUpperCase() : "P"}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        {partner?.name || "Learning Partner"}
                      </h4>
                      <p className="text-xs text-slate-400">@{partner?.username || "partner"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block w-2.5 h-2.5 rounded-full ${
                        partnerProgress.online ? "bg-emerald-400 animate-pulse" : "bg-slate-600"
                      }`}
                    />
                    <span className="text-xs font-medium text-slate-300">
                      {partnerProgress.submitted
                        ? "Exam Finished"
                        : partnerProgress.online
                        ? "Active"
                        : "Connecting..."}
                    </span>
                  </div>
                </div>

                {/* Progress Indicators */}
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Current Position:</span>
                    <span className="font-semibold text-cyan-400">
                      On Question #{partnerProgress.currentQuestion}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Answered Questions:</span>
                    <span className="font-semibold text-emerald-400">
                      {partnerProgress.answeredCount} / {partnerProgress.totalQuestions || 10} (
                      {Math.round(
                        (partnerProgress.answeredCount / (partnerProgress.totalQuestions || 10)) * 100
                      )}
                      %)
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mt-1">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          100,
                          (partnerProgress.answeredCount / (partnerProgress.totalQuestions || 10)) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Half of Right Panel: Live Collaborative Discussion with User A / User B Tagging */}
          <div
            className={`flex-1 flex flex-col p-4 sm:p-5 overflow-hidden ${
              mobileTab === "teammate" ? "hidden md:flex" : "flex"
            }`}
          >
            <div className="flex items-center justify-between mb-2 flex-shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm text-slate-200">
                  {session?.mode === "SOLO" ? "Personal Technical Scratchpad" : "Shared Live Strategy & Notes"}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {isPartnerTyping && (
                  <span className="text-xs text-cyan-400 font-medium animate-pulse">
                    {partnerTypingName} is typing...
                  </span>
                )}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/60 font-mono">
                  {session?.user1Id === user?.id ? "You: User A" : "You: User B"}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mb-2 flex-shrink-0">
              {session?.mode === "SOLO"
                ? "Draft technical thoughts and algorithms. Each entry is recorded with your timestamps."
                : "Collaborative discussion feed. Each line is tagged with User A or User B so you know who wrote what."}
            </p>

            {/* Scrollable Line-by-Line Discussion Feed */}
            <div className="flex-1 overflow-y-auto space-y-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800 min-h-[160px] max-h-[340px]">
              {discussionMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-500 text-xs">
                  <FileText className="w-7 h-7 text-slate-700 mb-2" />
                  <p className="font-medium text-slate-400">No strategy notes yet.</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Type a line below to share strategies tagged as {session?.user1Id === user?.id ? "User A" : "User B"}.
                  </p>
                </div>
              ) : (
                discussionMessages.map((msg, idx) => {
                  const isMe = msg.senderId === user?.id;
                  const isUserA = msg.senderLabel === "User A";

                  return (
                    <div
                      key={msg.id || idx}
                      className={`p-2.5 rounded-lg border text-xs space-y-1 transition-all ${
                        isUserA
                          ? "bg-cyan-950/20 border-cyan-500/30 text-slate-200"
                          : "bg-purple-950/20 border-purple-500/30 text-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              isUserA
                                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                                : "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                            }`}
                          >
                            {msg.senderLabel || (isUserA ? "User A" : "User B")}
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {isMe ? "(You)" : `(${msg.userName || "Partner"})`}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {msg.timestamp
                            ? new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                            : ""}
                        </span>
                      </div>
                      <p className="text-slate-100 text-xs sm:text-sm whitespace-pre-wrap break-words pl-0.5 leading-relaxed font-mono">
                        {msg.text}
                      </p>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Line Post Input Box */}
            <form onSubmit={handleSendChatMessage} className="mt-2.5 flex items-center gap-2 flex-shrink-0">
              <input
                type="text"
                value={chatInput}
                onChange={handleChatInputChange}
                placeholder={`Type a line as ${session?.user1Id === user?.id ? "User A" : "User B"}... (Press Enter to post)`}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500 transition-colors font-mono"
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-md transition-all flex items-center justify-center gap-1 text-xs font-semibold flex-shrink-0"
                title="Post Line"
              >
                <span>Post</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-full bg-emerald-500/10 text-emerald-400">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Submit Exam?</h3>
                <p className="text-xs text-slate-400">
                  You have answered <strong>{answeredTotal} of {questions.length || 10}</strong> questions.
                  {answeredTotal < (questions.length || 10) && (
                    <span className="text-amber-400 block mt-1 font-medium">
                      ⚠️ You have {(questions.length || 10) - answeredTotal} unanswered questions!
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 text-xs text-slate-300">
              Once submitted, your responses will be evaluated against server answer keys and graded immediately.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Continue Exam
              </button>
              <button
                onClick={handleSubmitExam}
                disabled={submitting}
                className="px-5 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-md"
              >
                {submitting ? "Grading..." : "Yes, Submit Now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
