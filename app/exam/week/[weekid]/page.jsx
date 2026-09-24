"use client";

import React, { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import {
  Clock,
  Users,
  Trophy,
  ArrowRight,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sparkles,
  Calendar,
  Lock,
  Play,
  RotateCcw,
  Zap,
  Info,
  ChevronLeft,
} from "lucide-react";
import { getSocket } from "@/lib/socket";
import { getTeammateDetailsCache, setTeammateDetailsCache } from "@/lib/client-cache";

export default function ExamLobbyPage({ params }) {
  const unwrappedParams = use(params);
  const weekId = parseInt(unwrappedParams.weekid) || 1;
  const router = useRouter();
  const routerRef = useRef(router);
  useEffect(() => {
    routerRef.current = router;
  }, [router]);
  const { user, isLoaded } = useUser();

  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [availability, setAvailability] = useState({
    isOpen: true,
    message: "",
    currentTime: "",
  });
  const [historyData, setHistoryData] = useState(null);
  const [bypassWindow, setBypassWindow] = useState(false);
  const [activeSession, setActiveSession] = useState(null);

  // Load availability & history
  useEffect(() => {
    if (!isLoaded || !user?.id) return;

    const fetchLobbyData = async () => {
      try {
        setLoading(true);

        // 1. Check Exam Window Availability
        const availRes = await fetch("/api/exam/availability");
        if (availRes.ok) {
          const availJson = await availRes.json();
          const openStatus = Boolean(availJson.isOpen ?? availJson.available ?? false);
          setAvailability({
            ...availJson,
            isOpen: openStatus,
            available: openStatus,
            currentTime: availJson.windowDetails?.currentServerTime || new Date().toLocaleTimeString(),
          });
        }

        // 2. Fetch 10-Week History & Teammate Info
        const histRes = await fetch("/api/exam/history");
        if (histRes.ok) {
          const histJson = await histRes.json();
          setHistoryData(histJson);
          if (histJson.teammate && user?.id) {
            setTeammateDetailsCache(user.id, histJson.teammate);
          }
        }
      } catch (err) {
        console.error("Error loading exam lobby:", err);
        toast.error("Could not load exam details.");
      } finally {
        setLoading(false);
      }
    };

    fetchLobbyData();
  }, [user?.id, isLoaded, weekId]);

  // Socket listener for instant partner invitations
  useEffect(() => {
    if (!user?.id) return;
    const socket = getSocket();
    if (!socket) return;

    socket.emit("user:register", { userId: user.id });

    const handleInviteReceived = (data) => {
      toast.info(
        `📬 ${data.inviterName} invited you to Week ${data.weekNumber} Pair Exam!`,
        {
          action: {
            label: "Join Exam",
            onClick: () => routerRef.current.push(`/exam/session/${data.sessionId}`),
          },
          duration: 15000,
        }
      );
    };

    socket.on("exam:invitation-received", handleInviteReceived);

    return () => {
      socket.off("exam:invitation-received", handleInviteReceived);
    };
  }, [user?.id]);

  // Start Exam Handler
  const handleStartExam = async (mode = "PAIRED") => {
    if (!user?.id) return;

    try {
      setStarting(true);
      const res = await fetch("/api/exam/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekNumber: weekId,
          requestedMode: mode,
          forceWindow: Boolean(bypassWindow),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.progressionLocked) {
          toast.error(data.error || `Week ${weekId} is locked.`);
        } else if (data.windowClosed) {
          toast.error(data.error || "Weekly exam is available only between 12 PM and 12 AM.");
        } else {
          toast.error(data.error || "Failed to start exam session.");
        }
        setStarting(false);
        return;
      }

      const sessionId = data.session?.sessionId;
      if (!sessionId) {
        toast.error("Invalid session created.");
        setStarting(false);
        return;
      }

      // If Paired, notify partner via Socket.IO
      if (mode === "PAIRED" && data.teammateId) {
        const socket = getSocket();
        if (socket) {
          const sendInvite = () => {
            socket.emit("exam:invite-partner", {
              sessionId,
              weekNumber: weekId,
              inviterId: user.id,
              inviterName: user.fullName || user.username || "Your Partner",
              partnerId: data.teammateId,
            });
            console.log("📨 Dispatched exam:invite-partner to", data.teammateId);
          };

          if (socket.connected) {
            sendInvite();
          } else {
            socket.once("connect", sendInvite);
            socket.connect();
          }
        }
      }

      toast.success(
        mode === "PAIRED"
          ? "Exam session created! Redirecting to workspace..."
          : "Solo exam started! 90-minute timer running."
      );

      router.push(`/exam/session/${sessionId}`);
    } catch (err) {
      console.error("Error initiating exam:", err);
      toast.error("Network error while starting exam.");
      setStarting(false);
    }
  };

  const teammate = historyData?.teammate || getTeammateDetailsCache(user?.id);
  const currentWeekHistory = historyData?.weeks?.find((w) => w.weekNumber === weekId);
  const isWeekLocked = Boolean(currentWeekHistory?.isLocked && !bypassWindow);
  const isWindowOpen = Boolean(availability?.isOpen || availability?.available || bypassWindow);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto space-y-8">
        {/* Back Link & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            onClick={() => router.push("/roadmaps")}
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Roadmaps
          </button>

          {/* Dev Bypass Window Switch */}
          <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-900/80 border border-slate-800 rounded-full px-3 py-1 text-xs">
            <span className="text-slate-400">Dev Testing Window Bypass:</span>
            <button
              onClick={() => setBypassWindow(!bypassWindow)}
              className={`font-semibold px-2 py-0.5 rounded-full transition-colors ${
                bypassWindow
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              {bypassWindow ? "Active (Always Open & Unlocked)" : "Inactive (12PM - 12AM & Progression Enforced)"}
            </button>
          </div>
        </div>

        {/* Hero Card */}
        <div className="bg-slate-900/60 border border-slate-800 backdrop-blur-xl rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-500" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                Week {weekId} Assessment
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Simultaneous Pair Mock Exam
              </h1>
              <p className="text-slate-400 max-w-xl text-sm sm:text-base leading-relaxed">
                Take a synchronized 10-question, 90-minute technical evaluation alongside your matched partner.
                Track real-time progress counters, brainstorm strategy in the shared live notes, and prove mastery.
              </p>
            </div>

            {/* Quick Rules Badge Card */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 sm:p-5 flex flex-col gap-2.5 min-w-[240px]">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>Duration: <strong>90 Minutes</strong></span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Questions: <strong>10 MCQs</strong></span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                <Shield className="w-4 h-4 text-indigo-400" />
                <span>Passing Grade: <strong>80% (8/10)</strong></span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Mode: <strong>Simultaneous Pair</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* 12-Hour Availability Banner */}
        <div
          className={`border rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${
            isWindowOpen
              ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-200"
              : "bg-amber-950/20 border-amber-500/30 text-amber-200"
          }`}
        >
          <div className="flex items-start gap-3.5">
            <div
              className={`p-2 rounded-lg mt-0.5 ${
                isWindowOpen ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
              }`}
            >
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-base text-white">
                  {isWindowOpen ? "Exam Window is OPEN" : "Exam Window is CLOSED"}
                </h3>
                <span
                  className={`inline-block w-2.5 h-2.5 rounded-full ${
                    isWindowOpen ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                  }`}
                />
              </div>
              <p className="text-sm text-slate-300 mt-1">
                {availability.message || "Weekly mock exam is only available between 12:00 PM and 12:00 AM."}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Current Time: {availability.currentTime || new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>

          {!isWindowOpen && (
            <div className="sm:text-right">
              <span className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-lg inline-block font-medium">
                Window opens at 12:00 PM
              </span>
            </div>
          )}
        </div>

        {/* Progression Lock Banner (>= 80% on previous week & 6-day cooldown) */}
        {isWeekLocked && (
          <div className="bg-amber-950/30 border-2 border-amber-500/50 rounded-2xl p-5 text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 mt-0.5">
                <Lock className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">
                    Week {weekId} Assessment is Locked
                  </h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                    {currentWeekHistory?.lockReason === "COOLDOWN_ACTIVE" ? "6-Day Cooldown" : "Prerequisite Score Needed"}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300">
                  {currentWeekHistory?.lockMessage || `You must score at least 80% (8/10) on Week ${weekId - 1} and wait 6 days before taking Week ${weekId}.`}
                </p>
                {currentWeekHistory?.unlockDate && (
                  <p className="text-xs text-amber-300 font-mono font-medium pt-1">
                    🗓️ Unlocks on: <strong>{new Date(currentWeekHistory.unlockDate).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</strong> ({currentWeekHistory.daysRemaining} days remaining)
                  </p>
                )}
              </div>
            </div>

            {currentWeekHistory?.lockReason === "SCORE_NOT_MET" && (
              <button
                onClick={() => router.push(`/exam/week/${weekId - 1}`)}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-colors self-start sm:self-auto flex items-center gap-1.5 shadow"
              >
                <span>Take Week {weekId - 1} Exam</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Teammate & Mode Selection Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Matched Partner Information */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-400" />
                  Matched Teammate
                </h3>
                <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
                  Pair Mode Active
                </span>
              </div>

              {teammate ? (
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                      {teammate.name ? teammate.name.charAt(0).toUpperCase() : "T"}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-base">{teammate.name}</h4>
                      <p className="text-xs text-slate-400">@{teammate.username || "teammate"}</p>
                      <p className="text-xs text-indigo-300 mt-0.5">Role: {teammate.role || "Developer"}</p>
                    </div>
                  </div>

                  <div className="border-t border-slate-800 pt-3 flex items-center justify-between text-xs text-slate-400">
                    <span>Missed Exams: <strong>{teammate.missedExams || 0}</strong></span>
                    <span className="text-emerald-400 font-medium">Ready for Week {weekId}</span>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-6 text-center space-y-2">
                  <Users className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-sm text-slate-300 font-medium">No Matched Teammate Yet</p>
                  <p className="text-xs text-slate-500">
                    You can start in Solo Mode or pair with a partner via the Roadmap Onboarding page.
                  </p>
                </div>
              )}
            </div>

            {/* Launch Paired Exam Button */}
            <button
              onClick={() => handleStartExam("PAIRED")}
              disabled={!isWindowOpen || starting || !teammate || isWeekLocked}
              className={`w-full py-3.5 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg ${
                isWindowOpen && teammate && !starting && !isWeekLocked
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/20 hover:scale-[1.02]"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50"
              }`}
            >
              {isWeekLocked ? <Lock className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              <span>
                {isWeekLocked
                  ? "Week Locked (Prerequisites Not Met)"
                  : starting
                  ? "Starting Session..."
                  : "Start Pair Exam with Partner"}
              </span>
            </button>
          </div>

          {/* Card 2: Solo Mode Fallback / 1-Hour Join Window Notice */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  Solo Mode Fallback
                </h3>
                <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                  Independent
                </span>
              </div>

              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-3 text-xs text-slate-300 leading-relaxed">
                <div className="flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <p>
                    <strong>1-Hour Join Window:</strong> If you start a pair exam, your teammate has 60 minutes to join.
                    If they fail to show up, the session automatically unlocks a <strong>Solo Fallback</strong> with a full 90-minute timer.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <Shield className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p>
                    <strong>Reliability Metrics:</strong> Teammates who miss scheduled pair exams are tracked. Multiple misses result in a warning flag and matchmaking cooldown.
                  </p>
                </div>
              </div>
            </div>

            {/* Launch Solo Exam Button */}
            <button
              onClick={() => handleStartExam("SOLO")}
              disabled={!isWindowOpen || starting || isWeekLocked}
              className={`w-full py-3.5 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg ${
                isWindowOpen && !starting && !isWeekLocked
                  ? "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:scale-[1.02]"
                  : "bg-slate-900 text-slate-600 cursor-not-allowed border border-slate-800"
              }`}
            >
              {isWeekLocked ? (
                <Lock className="w-4 h-4 text-amber-400" />
              ) : (
                <Zap className="w-4 h-4 text-amber-400" />
              )}
              <span>
                {isWeekLocked
                  ? "Week Locked (Prerequisites Not Met)"
                  : starting
                  ? "Starting..."
                  : "Start in Solo Mode Now"}
              </span>
            </button>
          </div>
        </div>

        {/* 10-Week Journey & History Roadmap Grid */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cyan-400" />
                10-Week Mock Exam Journey
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Track your progress through all 10 weekly milestones of your engineering roadmap.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Passed (≥80%)
              </span>
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" /> Failed (&lt;80%)
              </span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <Lock className="w-3.5 h-3.5 text-amber-400" /> Locked
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-600" /> Pending
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {historyData?.weeks?.map((w) => {
              const isCurrent = w.weekNumber === weekId;
              const isPassed = w.isPassed ?? (w.status === "PASSED" || (w.percentage !== null && w.percentage >= 80));
              const isFailed = w.attempted && !isPassed;
              const isLocked = Boolean(w.isLocked && !bypassWindow);

              return (
                <div
                  key={w.weekNumber}
                  onClick={() => router.push(`/exam/week/${w.weekNumber}`)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left relative overflow-hidden ${
                    isCurrent
                      ? "bg-slate-800/80 border-cyan-500/60 shadow-lg shadow-cyan-500/10"
                      : isPassed
                      ? "bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/60"
                      : isFailed
                      ? "bg-rose-950/20 border-rose-500/30 hover:border-rose-500/60"
                      : isLocked
                      ? "bg-amber-950/10 border-amber-500/20 hover:border-amber-500/40 opacity-80"
                      : "bg-slate-950/40 border-slate-800/80 hover:border-slate-700"
                  }`}
                >
                  {isCurrent && (
                    <div className="absolute top-0 right-0 w-2 h-2 bg-cyan-400 rounded-bl-md" />
                  )}

                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-200">
                      Week {w.weekNumber}
                    </span>
                    {isPassed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : isFailed ? (
                      <XCircle className="w-4 h-4 text-rose-400" />
                    ) : isLocked ? (
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-slate-700" />
                    )}
                  </div>

                  <div className="text-xs text-slate-400">
                    {w.attempted ? (
                      <span className={`font-semibold ${isPassed ? "text-emerald-300" : "text-rose-300"}`}>
                        {w.score}/10 ({w.percentage}%)
                      </span>
                    ) : isLocked ? (
                      <span className="text-amber-400/90 font-medium">
                        {w.lockReason === "COOLDOWN_ACTIVE" ? `${w.daysRemaining}d Cooldown` : "Locked (≥80%)"}
                      </span>
                    ) : (
                      <span className="text-slate-500">Not Attempted</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
