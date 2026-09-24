"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { Sparkles, Users, ArrowRight, X, Clock, Play } from "lucide-react";
import { getSocket } from "@/lib/socket";

export default function ExamNotificationListener() {
  const router = useRouter();
  const routerRef = useRef(router);
  useEffect(() => {
    routerRef.current = router;
  }, [router]);

  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  const { user, isLoaded } = useUser();
  const [activeInvite, setActiveInvite] = useState(null);
  const [dismissedSessionId, setDismissedSessionId] = useState(null);
  const toastFiredRef = useRef(false);

  // Helper to check for pending active invites via API
  const checkForActiveInvite = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await fetch("/api/exam/active-invite");
      if (res.ok) {
        const data = await res.json();
        if (data.hasInvite && data.invite?.sessionId !== dismissedSessionId) {
          // If we're already on that session page, don't show prompt
          if (pathnameRef.current?.includes(data.invite.sessionId)) {
            setActiveInvite(prev => prev === null ? prev : null);
            return;
          }

          setActiveInvite(prev => {
            if (prev?.sessionId === data.invite.sessionId) return prev;
            return data.invite;
          });

          if (!toastFiredRef.current) {
            toastFiredRef.current = true;
            toast.custom(
              (t) => (
                <div className="bg-slate-900 border-2 border-emerald-500 rounded-2xl p-4 shadow-2xl shadow-emerald-500/30 text-slate-100 flex flex-col gap-3 min-w-[320px] max-w-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
                        <Sparkles className="w-4 h-4 animate-spin" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Live Pair Exam Waiting!</h4>
                        <p className="text-xs text-slate-400">
                          <strong className="text-emerald-400">{data.invite.inviterName}</strong> invited you to Week {data.invite.weekNumber} Pair Exam
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        toast.dismiss(t);
                        setDismissedSessionId(data.invite.sessionId);
                        setActiveInvite(null);
                      }}
                      className="text-slate-500 hover:text-white text-xs p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => {
                        toast.dismiss(t);
                        setActiveInvite(null);
                        routerRef.current.push(`/exam/session/${data.invite.sessionId}`);
                      }}
                      className="flex-1 py-2 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30"
                    >
                      <span>Join Workspace Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ),
              { duration: 25000 }
            );
          }
        }
      }
    } catch (err) {
      console.warn("Error checking active invite:", err);
    }
  }, [user?.id, dismissedSessionId]);

  // 1. Initial check & periodic poll
  useEffect(() => {
    if (!isLoaded || !user?.id) return;

    checkForActiveInvite();
    const interval = setInterval(checkForActiveInvite, 15000); // Check every 15s
    return () => clearInterval(interval);
  }, [isLoaded, user?.id, checkForActiveInvite]);

  // 2. Real-Time Socket Connection & Invite Listener
  useEffect(() => {
    if (!isLoaded || !user?.id) return;

    const socket = getSocket();
    if (!socket) return;

    const registerUser = () => {
      socket.emit("user:register", { userId: user.id });
      console.log(`🔌 Registered user ${user.id} to Socket.IO notification room`);
    };

    if (socket.connected) {
      registerUser();
    }
    socket.on("connect", registerUser);

    const handleInvitation = (data) => {
      console.log("📬 Live exam invitation received via Socket.IO:", data);
      if (pathnameRef.current?.includes(data.sessionId)) return;

      setActiveInvite(prev => {
        if (prev?.sessionId === data.sessionId) return prev;
        return data;
      });

      toast.custom(
        (t) => (
          <div className="bg-slate-900 border-2 border-emerald-500 rounded-2xl p-4 shadow-2xl shadow-emerald-500/30 text-slate-100 flex flex-col gap-3 min-w-[320px]">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
                  <Sparkles className="w-4 h-4 animate-spin" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Live Pair Exam Waiting!</h4>
                  <p className="text-xs text-slate-400">
                    <strong className="text-emerald-400">{data.inviterName}</strong> invited you to Week {data.weekNumber} Pair Exam
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  toast.dismiss(t);
                  setDismissedSessionId(data.sessionId);
                  setActiveInvite(null);
                }}
                className="text-slate-500 hover:text-white text-xs p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  toast.dismiss(t);
                  setActiveInvite(null);
                  routerRef.current.push(`/exam/session/${data.sessionId}`);
                }}
                className="flex-1 py-2 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30"
              >
                <span>Join Workspace Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ),
        { duration: 30000 }
      );
    };

    socket.on("exam:invitation-received", handleInvitation);

    return () => {
      socket.off("connect", registerUser);
      socket.off("exam:invitation-received", handleInvitation);
    };
  }, [user?.id, isLoaded]);

  // Don't render banner if on the session page or no active invite
  if (!activeInvite || pathname?.includes(activeInvite.sessionId)) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
      <div className="bg-slate-900/95 backdrop-blur-md border-2 border-emerald-500 rounded-2xl p-4 shadow-2xl shadow-emerald-500/30 max-w-sm w-full text-slate-100 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Users className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
                Partner Waiting
              </span>
              <h4 className="text-sm font-bold text-white">
                {activeInvite.inviterName} started an exam!
              </h4>
              <p className="text-xs text-slate-400">
                Week {activeInvite.weekNumber} Simultaneous Pair Mock Exam
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setDismissedSessionId(activeInvite.sessionId);
              setActiveInvite(null);
            }}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={() => {
            const sid = activeInvite.sessionId;
            setActiveInvite(null);
            router.push(`/exam/session/${sid}`);
          }}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 hover:scale-[1.01]"
        >
          <span>Enter Exam Room with Partner</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
