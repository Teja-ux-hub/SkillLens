// Updated CareerRoadmaps.js component with DB integration
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import {
  CheckCircle,
  Circle,
  Clock,
  BookOpen,
  ArrowRight,
  Target,
  Trophy,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Calendar,
  Youtube,
  Lock,
  Users,
} from "lucide-react";
import { careerRoadmaps } from "@/data/mockData";
import {
  getOnboardingCache,
  setOnboardingCache,
  getTeammateDetailsCache,
  setTeammateDetailsCache,
  clearTeammateCache,
  getTeammateProgressCache,
  setTeammateProgressCache,
} from "@/lib/client-cache";

const CareerRoadmaps = () => {
  const router = useRouter();
  const { user } = useUser();
  const [selectedRoadmap, setSelectedRoadmap] = useState(null);
  const [expandedWeek, setExpandedWeek] = useState(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [animatingWeek, setAnimatingWeek] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  const [userOnboarding, setUserOnboarding] = useState(null);
  const [teammate, setTeammate] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const [showTeammateModal, setShowTeammateModal] = useState(false);
  const [teammateProgress, setTeammateProgress] = useState(null);
  const [loadingTeammateData, setLoadingTeammateData] = useState(false);

  const [completedWeeks, setCompletedWeeks] = useState(new Set());

  // Check onboarding status and fetch teammate info with cache + live server sync
  useEffect(() => {
    let isMounted = true;

    const checkOnboarding = async () => {
      if (!user?.id) return;

      // 1. FAST PATH (Instant UI): Render cached data immediately if available
      const cachedOnboarding = getOnboardingCache(user.id);
      if (cachedOnboarding) {
        console.log('[ROADMAP] ⚡ Loaded onboarding data instantly from cache:', cachedOnboarding);

        if (!cachedOnboarding.onboardingCompleted) {
          console.log('[ROADMAP] ↪️ Redirecting to onboarding...');
          router.push('/roadmaps/onboarding');
          return;
        }

        setUserOnboarding(cachedOnboarding);

        // Auto-select chosen role
        if (cachedOnboarding.selectedRole) {
          const matchedRoadmap = careerRoadmaps.find(r => r.role === cachedOnboarding.selectedRole);
          if (matchedRoadmap) {
            setSelectedRoadmap(matchedRoadmap);
            console.log('[ROADMAP] 🎯 Auto-selected roadmap from cache:', cachedOnboarding.selectedRole);
          }
        } else {
          setSelectedRoadmap(careerRoadmaps[0]);
        }

        // Fast load teammate info from localStorage if matched
        if (cachedOnboarding.matchingStatus === 'matched') {
          const cachedTeammate = getTeammateDetailsCache(user.id);
          if (cachedTeammate && (!cachedOnboarding.teammateId || cachedTeammate.clerkUserId === cachedOnboarding.teammateId)) {
            console.log('[ROADMAP] ⚡ Loaded teammate details instantly from cache:', cachedTeammate);
            setTeammate(cachedTeammate);
          } else {
            // Teammate not in cache or missing, fetch immediately
            fetchTeammateInfo(true);
          }
        } else if (cachedOnboarding.matchingStatus === 'waiting') {
          setIsPolling(true);
        }

        setIsCheckingOnboarding(false);
        // Note: Do NOT return here! Always verify live DB status with server below to prevent stale cache lockouts.
      }

      // 2. NETWORK REVALIDATION: Always sync with live server DB
      try {
        console.log('[ROADMAP] 🔄 Verifying live onboarding & matching status with server API...');
        const response = await fetch('/api/roadmaps/check-onboarding');
        if (response.ok) {
          const data = await response.json();
          if (!isMounted) return;
          console.log('[ROADMAP] 📊 Live onboarding data from API:', data);

          if (!data.onboardingCompleted) {
            console.log('[ROADMAP] ↪️ Redirecting to onboarding...');
            router.push('/roadmaps/onboarding');
            return;
          }

          // Persist in localStorage and state
          setOnboardingCache(user.id, data);
          setUserOnboarding(data);

          // Auto-select the user's chosen role if they have one
          if (data.selectedRole) {
            const matchedRoadmap = careerRoadmaps.find(r => r.role === data.selectedRole);
            if (matchedRoadmap) {
              setSelectedRoadmap(matchedRoadmap);
              console.log('[ROADMAP] 🎯 Auto-selected roadmap:', data.selectedRole);
            }
          } else {
            setSelectedRoadmap(careerRoadmaps[0]);
          }

          // Handle live matching status
          if (data.matchingStatus === 'matched') {
            setIsPolling(false);
            const cachedTeammate = getTeammateDetailsCache(user.id);
            if (!cachedTeammate || (data.teammateId && cachedTeammate.clerkUserId !== data.teammateId)) {
              console.log('[ROADMAP] 📡 Fetching fresh teammate info for matched user...');
              fetchTeammateInfo(true);
            } else {
              setTeammate(cachedTeammate);
            }
          } else if (data.matchingStatus === 'waiting') {
            console.log('[ROADMAP] ⏳ User is waiting for a match - starting poll');
            setTeammate(null);
            clearTeammateCache(user.id);
            setIsPolling(true);
          } else {
            setTeammate(null);
            clearTeammateCache(user.id);
            setIsPolling(false);
          }
        }
      } catch (error) {
        console.error("[ROADMAP] ❌ Error checking onboarding:", error);
      } finally {
        if (isMounted) {
          setIsCheckingOnboarding(false);
        }
      }
    };

    checkOnboarding();

    return () => {
      isMounted = false;
    };
  }, [user?.id, router]);

  // Fetch teammate information with caching + forceRefresh option
  const fetchTeammateInfo = async (forceRefresh = false) => {
    if (!user?.id) return;

    // Check localStorage cache unless forceRefresh
    if (!forceRefresh) {
      const cachedTeammate = getTeammateDetailsCache(user.id);
      if (cachedTeammate) {
        console.log('[ROADMAP] ⚡ Loaded teammate from localStorage cache:', cachedTeammate);
        setTeammate(cachedTeammate);
        return;
      }
    }

    try {
      console.log('[ROADMAP] 📡 Fetching fresh teammate info from API...');
      const response = await fetch('/api/roadmaps/teammate');
      if (response.ok) {
        const data = await response.json();
        if (data.teammate) {
          console.log('[ROADMAP] ✅ Teammate info loaded and stored in localStorage:', data.teammate);
          setTeammate(data.teammate);
          setTeammateDetailsCache(user.id, data.teammate);

          // Keep userOnboarding in sync with teammateId
          setUserOnboarding(prev => {
            if (prev && (!prev.teammateId || prev.teammateId !== data.teammate.clerkUserId)) {
              const updated = {
                ...prev,
                matchingStatus: 'matched',
                teammateId: data.teammate.clerkUserId
              };
              setOnboardingCache(user.id, updated);
              return updated;
            }
            return prev;
          });
        } else {
          setTeammate(null);
          clearTeammateCache(user.id);
        }
      }
    } catch (error) {
      console.error("[ROADMAP] ❌ Error fetching teammate:", error);
    }
  };

  // Fetch teammate progress summary with 24-hour localStorage caching
  const fetchTeammateProgressWithCache = async (forceRefresh = false) => {
    const teammateIdToFetch = teammate?.clerkUserId || teammate?.userId || userOnboarding?.teammateId;
    console.log('[VIEW SUMMARY] 🔍 Target teammate ID:', teammateIdToFetch);

    if (!teammateIdToFetch) {
      console.error('[VIEW SUMMARY] ❌ No teammate ID available!');
      toast.error('Unable to load teammate data - partner ID missing');
      return;
    }

    setShowTeammateModal(true);

    const cacheKey = `skilllens_teammate_progress_${teammateIdToFetch}`;
    const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

    // Check localStorage cache unless forceRefresh is explicitly requested
    if (!forceRefresh) {
      try {
        const cachedItem = localStorage.getItem(cacheKey);
        if (cachedItem) {
          const parsed = JSON.parse(cachedItem);
          const now = Date.now();
          const age = now - (parsed.timestamp || 0);

          if (age < TWENTY_FOUR_HOURS_MS && parsed.data) {
            console.log('[VIEW SUMMARY] ⚡ Loaded teammate data from 24h localStorage cache');
            setTeammateProgress({
              ...parsed.data,
              isFromCache: true,
              cachedAt: new Date(parsed.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });
            setLoadingTeammateData(false);
            return;
          } else {
            console.log('[VIEW SUMMARY] ⏰ LocalStorage cache expired (>24h). Re-fetching from API...');
          }
        }
      } catch (err) {
        console.warn('[VIEW SUMMARY] ⚠️ Error reading cache from localStorage:', err);
      }
    }

    setLoadingTeammateData(true);

    try {
      const progressUrl = `/api/get-all-progress?userId=${teammateIdToFetch}`;
      const summaryUrl = `/api/get-progress-summary?userId=${teammateIdToFetch}`;

      console.log('[VIEW SUMMARY] 📡 Fetching fresh data from API...');
      const [progressRes, summaryRes] = await Promise.all([
        fetch(progressUrl),
        fetch(summaryUrl)
      ]);

      if (progressRes.ok && summaryRes.ok) {
        const progress = await progressRes.json();
        const summary = await summaryRes.json();

        const combinedData = { ...progress, ...summary };
        const timestamp = Date.now();

        // Save to localStorage with timestamp for 24-hour expiration
        try {
          localStorage.setItem(cacheKey, JSON.stringify({
            timestamp,
            data: combinedData
          }));
          console.log('[VIEW SUMMARY] 💾 Cached fresh teammate progress in localStorage (valid for 24h)');
        } catch (e) {
          console.warn('[VIEW SUMMARY] ⚠️ Could not save to localStorage:', e);
        }

        setTeammateProgress({
          ...combinedData,
          isFromCache: false,
          cachedAt: new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      } else {
        console.error('[VIEW SUMMARY] ❌ API call failed');
        toast.error('Failed to fetch teammate progress');
      }
    } catch (error) {
      console.error('[VIEW SUMMARY] ❌ Error fetching teammate data:', error);
      toast.error('Error loading teammate data');
    } finally {
      setLoadingTeammateData(false);
    }
  };

  // Polling effect - check for matches every 10 seconds
  useEffect(() => {
    if (!isPolling || !user?.id) return;

    console.log('[ROADMAP] 🔄 Starting match polling...');
    
    const pollInterval = setInterval(async () => {
      try {
        console.log('[ROADMAP] 🔍 Polling for match...');
        const response = await fetch('/api/roadmaps/check-match');
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.status === 'matched' && data.teammateId) {
            console.log('[ROADMAP] 🎉 MATCH DETECTED! Partner:', data.teammateId);
            
            // Stop polling immediately
            setIsPolling(false);
            
            // Update onboarding state and cache
            setUserOnboarding(prev => {
              const updated = {
                ...prev,
                matchingStatus: 'matched',
                teammateId: data.teammateId
              };
              setOnboardingCache(user.id, updated);
              return updated;
            });
            
            // Fetch teammate info and store in localStorage
            await fetchTeammateInfo(true);
            
            // Show success toast
            toast.success('You\'ve been matched with a learning partner! 🎉');
          }
        }
      } catch (error) {
        console.error('[ROADMAP] ❌ Polling error:', error);
      }
    }, 10000); // Poll every 10 seconds

    // Cleanup on unmount
    return () => {
      console.log('[ROADMAP] 🛑 Stopping poll interval');
      clearInterval(pollInterval);
    };
  }, [isPolling, user?.id]);

  useEffect(() => {
    const loadCompletedWeeks = async () => {
      if (!user?.id) return;
      
      try {
        const response = await fetch('/api/get-all-progress');
        if (response.ok) {
          const data = await response.json();
          const completedSet = new Set(Object.keys(data.completedWeeks));
          setCompletedWeeks(completedSet);
        }
      } catch (error) {
      }
    };

    loadCompletedWeeks();
  }, [user?.id]);

  const getWeekProgress = (roadmap, weekIndex) => {
    return { completed: completedWeeks.has(`${roadmap}-${weekIndex}`) };
  };

  const toggleWeekCompletion = (roadmap, weekIndex) => {
    const key = `${roadmap}-${weekIndex}`;
    setCompletedWeeks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const getRoadmapProgress = (roadmap, totalWeeks) => {
    let completed = 0;
    for (let i = 0; i < totalWeeks; i++) {
      if (completedWeeks.has(`${roadmap}-${i}`)) {
        completed++;
      }
    }
    return {
      completed,
      total: totalWeeks,
      percentage: Math.round((completed / totalWeeks) * 100),
    };
  };

  // Safety check: ensure selectedRoadmap is set
  const roadmapProgress = selectedRoadmap 
    ? getRoadmapProgress(selectedRoadmap.role, selectedRoadmap.weeks.length)
    : { completed: 0, total: 0, percentage: 0 };
  const progressPercentage = roadmapProgress.percentage;

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Beginner":
        return "text-green-400 bg-green-900/30 border-green-500/20";
      case "Intermediate":
        return "text-yellow-400 bg-yellow-900/30 border-yellow-500/20";
      case "Advanced":
        return "text-red-400 bg-red-900/30 border-red-500/20";
      default:
        return "text-gray-400 bg-gray-800/30 border-gray-600/20";
    }
  };

  const handleToggleCompletion = async (weekIndex) => {
    if (isUpdating) return; 

    try {
      const response = await fetch(
        `/api/get-all-progress?roadmap=${selectedRoadmap.role}&weekId=${
          weekIndex + 1
        }`
      );

      if (response.ok) {
        const data = await response.json();
        const mockScore = data.mockScore;

        if (!mockScore || mockScore < 90) {
          toast.error(
            "You need to score 90% or higher to mark this week as completed!",
            {
              description: mockScore
                ? `Your current score is ${mockScore}%. Take the mock interview again to improve your score.`
                : "You haven't taken the mock interview yet. Complete it first!",
              duration: 4000,
            }
          );
          return; 
        }

        toggleWeekCompletion(selectedRoadmap.role, weekIndex);
      } else {
        toast.error("You need to take the mock interview first!", {
          description:
            "Complete the mock interview to get your score before marking as done.",
          duration: 4000,
        });
        return;
      }
    } catch (error) {
      toast.error("Unable to verify your score. Please try again.", {
        duration: 4000,
      });
      return;
    }

    setAnimatingWeek(weekIndex);
    setTimeout(() => setAnimatingWeek(null), 600);

    const newProgress = getRoadmapProgress(
      selectedRoadmap.role,
      selectedRoadmap.weeks.length
    );
    if (newProgress.percentage === 100 && !showCompletion) {
      setTimeout(() => setShowCompletion(true), 800);
    }
  };

  // Handle accordion expansion
  const toggleWeekExpansion = (weekIndex) => {
    setExpandedWeek(expandedWeek === weekIndex ? null : weekIndex);
  };

  const FireworksPopup = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-red-500 rounded-full animate-ping`}
            style={{
              left: `${Math.random() * 400 - 200}px`,
              top: `${Math.random() * 400 - 200}px`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${1 + Math.random()}s`,
            }}
          />
        ))}
        {[...Array(15)].map((_, i) => (
          <div
            key={i + 20}
            className={`absolute w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-pulse`}
            style={{
              left: `${Math.random() * 300 - 150}px`,
              top: `${Math.random() * 300 - 150}px`,
              animationDelay: `${Math.random() * 1.5}s`,
              animationDuration: `${0.8 + Math.random()}s`,
            }}
          />
        ))}
        <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-green-900 p-8 rounded-2xl shadow-2xl border border-yellow-400/50 text-center transform animate-bounce">
          <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-spin" />
          <h2 className="text-3xl font-bold text-white mb-2">
            Congratulations! 🎉
          </h2>
          <p className="text-yellow-100 text-lg mb-4">
            You've completed the {selectedRoadmap.role} roadmap!
          </p>
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
            <span className="text-2xl font-bold text-yellow-400">
              100% Complete
            </span>
            <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
          </div>
          <button
            onClick={() => setShowCompletion(false)}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-3 rounded-full font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all transform hover:scale-105 shadow-lg"
          >
            Continue Learning! 🚀
          </button>
        </div>
      </div>
    </div>
  );

  // Show loading while checking onboarding or roadmap not loaded
  if (isCheckingOnboarding || !selectedRoadmap) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your roadmaps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Career Roadmaps
          </h1>
          <p className="text-gray-300 text-lg">
            Structured learning paths to achieve your career goals
          </p>
          {user && (
            <p className="text-sm text-gray-400 mt-2">
              Welcome back, {user.firstName || user.username}! Your progress is
              automatically saved.
            </p>
          )}

          {/* Teammate Info Display or Waiting Message */}
          {userOnboarding?.selectedRole && userOnboarding?.learningMode !== 'solo' && (
            <div className="mt-4 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                {userOnboarding.matchingStatus === 'matched' ? (
                  teammate ? (
                    <>
                      <div className="flex-1">
                        <p className="text-sm text-gray-400">Learning Partner</p>
                        <p className="text-white font-semibold text-lg">
                          {teammate.username || `${teammate.firstName || ''} ${teammate.lastName || ''}`.trim() || "Your Partner"}
                        </p>
                        {teammate.email && (
                          <p className="text-xs text-gray-300 mt-0.5">
                            {teammate.email}
                          </p>
                        )}
                        <div className="text-xs text-gray-400 mt-1">
                          {userOnboarding.learningMode === 'pair' 
                            ? `Both learning: ${userOnboarding.selectedRole}`
                            : `You: ${userOnboarding.selectedRole} | Partner: ${teammate.selectedRole || 'Unknown'}`
                          }
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => router.push('/exam/week/1')}
                          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center gap-1.5"
                        >
                          <Sparkles className="w-4 h-4 text-emerald-300" />
                          <span>Pair Exam</span>
                        </button>
                        <button
                          onClick={() => fetchTeammateProgressWithCache(false)}
                          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center gap-1.5"
                        >
                          <span>View Summary</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1">
                      <p className="text-sm text-gray-400">Learning Partner</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        <p className="text-xs text-emerald-400">Connecting to matched partner...</p>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="flex-1">
                    <p className="text-sm text-gray-400">Learning Mode</p>
                    <p className="text-white font-semibold">
                      {userOnboarding.learningMode === 'pair' ? 'Pair Programming' : 'Skill Exchange'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                      <p className="text-xs text-yellow-400">
                        {userOnboarding.learningMode === 'pair' 
                          ? `Looking for someone learning ${userOnboarding.selectedRole}...`
                          : `Looking for someone with a complementary skill...`
                        }
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Roadmap Selection */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700/50 overflow-hidden">
              <div className="p-6 border-b border-gray-700/50 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
                <h2 className="text-xl font-semibold text-white mb-2">
                  Choose Your Path
                </h2>
                <p className="text-gray-300 text-sm">
                  Select a career roadmap to get started
                </p>
              </div>
              <div
                className="p-6 space-y-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
                style={{ maxHeight: "100%", overflowY: "auto" }}
              >
                {careerRoadmaps.map((roadmap, index) => {
                  const roadmapProg = getRoadmapProgress(
                    roadmap.role,
                    roadmap.weeks.length
                  );
                  
                  // Check if this roadmap is locked
                  const isLocked = userOnboarding?.selectedRole && 
                                   userOnboarding.selectedRole !== roadmap.role &&
                                   userOnboarding.learningMode !== 'solo';
                  
                  return (
                    <button
                      key={index}
                      onClick={() => !isLocked && setSelectedRoadmap(roadmap)}
                      disabled={isLocked}
                      className={`w-full p-4 rounded-lg border-2 transition-all duration-300 text-left ${
                        isLocked 
                          ? 'opacity-40 cursor-not-allowed border-gray-700/30 bg-gray-800/20' 
                          : `transform hover:scale-[1.02] ${
                              selectedRoadmap.role === roadmap.role
                                ? "border-blue-500 bg-blue-900/30 shadow-lg shadow-blue-500/20"
                                : "border-gray-600/50 bg-gray-700/30 hover:border-blue-400 hover:bg-blue-900/20 hover:shadow-lg"
                            }`
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-white">
                              {roadmap.role}
                            </h3>
                            {isLocked && (
                              <Lock className="w-4 h-4 text-gray-500" />
                            )}
                          </div>
                          <p className="text-sm text-gray-300 mb-3">
                            {roadmap.description}
                          </p>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-cyan-400" />
                              <span className="text-sm text-gray-300">
                                {roadmap.duration}
                              </span>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(
                                roadmap.difficulty
                              )}`}
                            >
                              {roadmap.difficulty}
                            </span>
                            <span className="text-xs text-blue-400 font-medium">
                              {roadmapProg.percentage}%
                            </span>
                          </div>
                        </div>
                        <ArrowRight
                          className={`w-5 h-5 mt-1 transition-transform duration-300 ${
                            selectedRoadmap.role === roadmap.role
                              ? "rotate-90 text-blue-400"
                              : "text-gray-400"
                          }`}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Roadmap Details */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700/50 overflow-hidden">
              <div className="p-6 border-b border-gray-700/50 bg-gradient-to-r from-blue-900/30 to-purple-900/30">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">
                      {selectedRoadmap.role}
                    </h2>
                    <p className="text-gray-300 text-lg">
                      {selectedRoadmap.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent transition-all duration-500 ${
                        progressPercentage === 100
                          ? "animate-pulse scale-110"
                          : ""
                      }`}
                    >
                      {Math.round(progressPercentage)}%
                    </div>
                    <div className="text-sm text-gray-300">Complete</div>
                    {isUpdating && (
                      <div className="text-xs text-blue-400 animate-pulse mt-1">
                        Saving...
                      </div>
                    )}
                  </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3 shadow-inner">
                  <div
                    className={`bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 h-3 rounded-full transition-all duration-1000 shadow-lg ${
                      progressPercentage === 100
                        ? "animate-pulse shadow-cyan-500/50"
                        : ""
                    }`}
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-gray-300 mt-3">
                  <span className="font-medium">
                    {roadmapProgress.completed} of{" "}
                    {selectedRoadmap.weeks.length} weeks completed
                  </span>
                  <span>{selectedRoadmap.duration} total</span>
                </div>
              </div>

              <div className="p-6">
                <div
                  className="space-y-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
                  style={{ maxHeight: "100%", overflowY: "auto" }}
                >
                  {selectedRoadmap.weeks.map((week, index) => {
                    const weekProgress = getWeekProgress(
                      selectedRoadmap.role,
                      index
                    );
                    const isCompleted = weekProgress.completed;
                    const isExpanded = expandedWeek === index;

                    return (
                      <div
                        key={index}
                        className="border border-gray-700/50 rounded-lg overflow-hidden bg-gray-700/20 shadow-lg"
                      >
                        <div className="flex items-center justify-between p-5">
                          <div className="flex items-center space-x-4 flex-1">
                            {/* Completion Checkbox - ONLY triggers API/store update */}
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleToggleCompletion(index);
                              }}
                              disabled={isUpdating}
                              className={`transition-all duration-300 transform hover:scale-110 z-10 relative flex-shrink-0 ${
                                animatingWeek === index
                                  ? "animate-bounce scale-125"
                                  : ""
                              } ${
                                isUpdating
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                            >
                              {isCompleted ? (
                                <CheckCircle className="w-7 h-7 text-green-400 shadow-lg drop-shadow-md" />
                              ) : (
                                <Circle className="w-7 h-7 text-gray-400 hover:text-blue-400 transition-colors" />
                              )}
                            </button>

                            {/* Accordion Toggle - ONLY expands/collapses */}
                            <div
                              onClick={() => toggleWeekExpansion(index)}
                              className="flex-1 cursor-pointer hover:bg-gray-600/30 transition-colors duration-200 p-2 rounded-lg -m-2"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="font-semibold text-white text-lg">
                                    Week {week.week}: {week.title}
                                  </h3>
                                  <p className="text-sm text-gray-300 mt-1">
                                    {week.description}
                                  </p>
                                  {isCompleted && (
                                    <p className="text-xs text-green-400 mt-1">
                                      ✓ Completed
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      router.push(`/exam/week/${week.week}`);
                                    }}
                                    className="p-2 text-emerald-400 hover:text-emerald-300 transition-all duration-200 rounded-lg hover:bg-emerald-900/30 border border-emerald-500/30 hover:border-emerald-400/50 shadow-sm hover:shadow-emerald-500/20"
                                    title="Take Weekly Pair Exam"
                                  >
                                    <Sparkles className="w-5 h-5" />
                                  </button>
                                  {isExpanded ? (
                                    <ChevronUp className="w-5 h-5 text-gray-400" />
                                  ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-400" />
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Expanded Content - Shows when accordion is open */}
                        {isExpanded && (
                          <div className="px-5 pb-5">
                            <div className="border-t border-gray-600/30 pt-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Skills Section */}
                                <div>
                                  <h4 className="text-white font-semibold mb-3 flex items-center">
                                    <Target className="w-4 h-4 mr-2 text-blue-400" />
                                    Skills to Learn
                                  </h4>
                                  <div className="space-y-2">
                                    {week.skills?.map((skill, skillIndex) => (
                                      <div
                                        key={skillIndex}
                                        className="flex items-center space-x-2"
                                      >
                                        <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0" />
                                        <span className="text-gray-300 text-sm">
                                          {skill}
                                        </span>
                                      </div>
                                    )) || (
                                      <p className="text-gray-400 text-sm">
                                        No skills listed
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {/* Resources Section */}
                                <div>
                                  <h4 className="text-white font-semibold mb-3 flex items-center">
                                    <BookOpen className="w-4 h-4 mr-2 text-green-400" />
                                    Learning Resources
                                  </h4>
                                  <div className="space-y-3">
                                    {week.resources?.map(
                                      (resource, resourceIndex) => (
                                        <div
                                          key={resourceIndex}
                                          className="flex items-center space-x-4"
                                        >
                                          <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0" />
                                          {typeof resource === 'object' && resource.url ? (
                                            <div className="flex items-center space-x-4">
                                              <a
                                                href={resource.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-gray-300 text-sm hover:text-green-400 cursor-pointer transition-colors hover:underline min-w-[120px]"
                                              >
                                                {resource.name}
                                              </a>
                                              {resource.yturl && (
                                                <a
                                                  href={resource.yturl}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="text-red-500 hover:text-red-400 transition-all duration-200 transform hover:scale-125"
                                                  title="Watch Video Tutorial"
                                                >
                                                  <Youtube className="w-5 h-5" />
                                                </a>
                                              )}
                                            </div>
                                          ) : (
                                            <span className="text-gray-300 text-sm">
                                              {typeof resource === 'string' ? resource : resource.name}
                                            </span>
                                          )}
                                        </div>
                                      )
                                    ) || (
                                      <p className="text-gray-400 text-sm">
                                        No resources listed
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {/* Milestone Section */}
                                {week.milestone && (
                                  <div className="md:col-span-2">
                                    <h4 className="text-white font-semibold mb-3 flex items-center">
                                      <Trophy className="w-4 h-4 mr-2 text-yellow-400" />
                                      Week Milestone
                                    </h4>
                                    <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-500/20 rounded-lg p-4">
                                      <p className="text-yellow-100 font-medium">
                                        {week.milestone}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-600/30">
                                <div className="flex items-center space-x-4 text-sm text-gray-400">
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>Week {week.week}</span>
                                  </div>
                                  {isCompleted && (
                                    <div className="flex items-center space-x-1 text-green-400">
                                      <CheckCircle className="w-4 h-4" />
                                      <span>Completed</span>
                                    </div>
                                  )}
                                </div>
                                <button
                                  onClick={() => router.push(`/exam/week/${week.week}`)}
                                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 shadow-lg shadow-emerald-500/20"
                                >
                                  <Sparkles className="w-4 h-4 text-emerald-300" />
                                  <span>Start Pair Exam</span>
                                  <ArrowRight className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            
            </div>
            <button
              onClick={() => router.push('/newones')}
              className="
              w-full       
              py-3 px-6               
              bg-transparent        
              text-neutral-100         
              border border-neutral-700
              rounded-lg
              shadow-md
              transition-all duration-200 ease-out
              hover:bg-neutral-800 hover:shadow-lg hover:-translate-y-0.5
              active:scale-[0.98] active:bg-neutral-950
              focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-neutral-900
            "
            >
              Suggest New Courses Here.........!
            </button>
          </div>
          {/* voting system */}

        </div>
      </div>
      {showCompletion && <FireworksPopup />}
      
      {/* Teammate Modal */}
      {showTeammateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-purple-900/30 to-blue-900/30 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center font-bold text-lg text-white">
                  {((teammateProgress?.userProfile?.firstName || teammate?.firstName || teammate?.username || 'T')[0]).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    {teammateProgress?.userProfile?.firstName && teammateProgress?.userProfile?.lastName
                      ? `${teammateProgress.userProfile.firstName} ${teammateProgress.userProfile.lastName}`
                      : teammate?.username || teammateProgress?.userProfile?.username || 'Teammate Progress'}
                    <span className="text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-0.5 rounded-full font-normal">
                      Partner Progress
                    </span>
                  </h2>
                  <p className="text-sm text-gray-300">
                    {teammate?.email || teammateProgress?.userProfile?.email || 'Learning Partner'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {teammateProgress && (
                  <div className="flex items-center gap-2">
                    {teammateProgress.isFromCache ? (
                      <span className="text-[11px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2.5 py-1 rounded-full font-normal flex items-center gap-1">
                        ⚡ Cached (Refreshes 24h)
                      </span>
                    ) : (
                      <span className="text-[11px] bg-green-500/20 text-green-300 border border-green-500/30 px-2.5 py-1 rounded-full font-normal flex items-center gap-1">
                        🟢 Live Data
                      </span>
                    )}
                    <button
                      onClick={() => fetchTeammateProgressWithCache(true)}
                      title="Force refresh data from API"
                      className="p-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg transition-colors text-xs flex items-center gap-1"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Refresh
                    </button>
                  </div>
                )}
                <button
                  onClick={() => {
                    setShowTeammateModal(false);
                    setTeammateProgress(null);
                  }}
                  className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {loadingTeammateData ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading teammate progress & exam statistics...</p>
                  </div>
                </div>
              ) : teammateProgress ? (
                <div className="space-y-6">
                  {/* Progress Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border border-blue-500/30 rounded-lg p-4">
                      <div className="text-sm text-gray-400 mb-1">Overall Progress</div>
                      <div className="text-3xl font-bold text-blue-400">{teammateProgress.overallProgress || 0}%</div>
                      <div className="w-full bg-gray-700/50 rounded-full h-1.5 mt-2">
                        <div className="bg-blue-400 h-1.5 rounded-full" style={{ width: `${teammateProgress.overallProgress || 0}%` }}></div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-lg p-4">
                      <div className="text-sm text-gray-400 mb-1">Weeks Completed</div>
                      <div className="text-3xl font-bold text-purple-400">{teammateProgress.weeksCompleted || 0} / {teammateProgress.totalWeeks || 8}</div>
                      <p className="text-xs text-purple-300 mt-1">Roadmap Milestones</p>
                    </div>
                    <div className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 border border-amber-500/30 rounded-lg p-4">
                      <div className="text-sm text-gray-400 mb-1">Exams Wrote</div>
                      <div className="text-3xl font-bold text-amber-400">{teammateProgress.assessmentSummary?.totalAttempts || teammateProgress.mockInterviews?.length || 0}</div>
                      <p className="text-xs text-amber-300 mt-1">
                        {teammateProgress.assessmentSummary?.totalCompleted || 0} Passed (≥90%)
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-lg p-4">
                      <div className="text-sm text-gray-400 mb-1">Average / Best Marks</div>
                      <div className="text-2xl font-bold text-green-400">
                        {teammateProgress.assessmentSummary?.averageScore || 0}% <span className="text-xs font-normal text-gray-400">/ {teammateProgress.assessmentSummary?.bestScore || 0}%</span>
                      </div>
                      <p className="text-xs text-green-300 mt-1">
                        Latest Score: {teammateProgress.assessmentSummary?.latestScore !== undefined ? `${teammateProgress.assessmentSummary.latestScore}%` : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Exam & Mock Interview Results */}
                  <div className="bg-gray-700/30 border border-gray-600/50 rounded-lg p-5">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-amber-400" />
                        Teammate Exam & Assessment Marks
                      </span>
                      <span className="text-xs bg-amber-500/10 text-amber-300 border border-amber-500/20 px-3 py-1 rounded-full font-normal">
                        {teammateProgress.assessmentSummary?.totalAttempts || 0} Exams Attempted
                      </span>
                    </h3>

                    {teammateProgress.mockInterviews && teammateProgress.mockInterviews.length > 0 ? (
                      <div className="space-y-3">
                        {teammateProgress.mockInterviews.map((interview, idx) => (
                          <div key={idx} className="bg-gray-800/60 border border-gray-600/40 rounded-lg p-4 transition-all hover:border-gray-500">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <div className="text-white font-semibold text-base">{interview.roadmap} — Week {interview.week} Exam</div>
                                <div className="text-xs text-gray-400">Date: {interview.date}</div>
                              </div>
                              <div className="text-right">
                                <span className={`text-2xl font-extrabold ${
                                  interview.score >= 90 ? 'text-green-400' :
                                  interview.score >= 70 ? 'text-blue-400' :
                                  interview.score >= 50 ? 'text-amber-400' : 'text-red-400'
                                }`}>
                                  {interview.score}%
                                </span>
                                <div className="text-[10px] text-gray-400">
                                  {interview.score >= 90 ? 'Passed ✅' : 'Needs Retake ⚠️'}
                                </div>
                              </div>
                            </div>
                            <div className="text-sm text-gray-300 bg-gray-900/40 p-2.5 rounded border border-gray-700/30 mb-2">
                              {interview.feedback}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {interview.topics?.map((topic, topicIdx) => (
                                <span key={topicIdx} className="px-2 py-0.5 bg-blue-900/30 border border-blue-500/30 rounded text-xs text-blue-300 font-medium">
                                  {topic}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-800/40 border border-gray-700/50 rounded-lg p-6 text-center text-gray-400">
                        No exam records found for this teammate yet.
                      </div>
                    )}
                  </div>

                  {/* Next Steps */}
                  {teammateProgress.nextSteps && teammateProgress.nextSteps.length > 0 && (
                    <div className="bg-gray-700/30 border border-gray-600/50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <ArrowRight className="w-5 h-5 text-purple-400" />
                        Teammate Next Action Items
                      </h3>
                      <div className="space-y-2">
                        {teammateProgress.nextSteps.map((step, idx) => (
                          <div key={idx} className="flex items-center gap-3 text-gray-300 text-sm">
                            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-center text-xs text-gray-400 pt-2">
                    Last updated: {teammateProgress.lastUpdated || 'N/A'}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400 h-64 flex items-center justify-center">
                  No teammate progress data available.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerRoadmaps;
