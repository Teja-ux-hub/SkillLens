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
} from "lucide-react";
import { careerRoadmaps } from "@/data/mockData";

const CareerRoadmaps = () => {
  const router = useRouter();
  const { user } = useUser();
  const [selectedRoadmap, setSelectedRoadmap] = useState(careerRoadmaps[0]);
  const [expandedWeek, setExpandedWeek] = useState(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [animatingWeek, setAnimatingWeek] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const [completedWeeks, setCompletedWeeks] = useState(new Set());

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

  const roadmapProgress = getRoadmapProgress(
    selectedRoadmap.role,
    selectedRoadmap.weeks.length
  );
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

  const handleWeekNavigation = (week) => {
    router.push(`/mock/week/${week.week}?roadmap=${selectedRoadmap.role}`);
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
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedRoadmap(roadmap)}
                      className={`w-full p-4 rounded-lg border-2 transition-all duration-300 text-left transform hover:scale-[1.02] ${
                        selectedRoadmap.role === roadmap.role
                          ? "border-blue-500 bg-blue-900/30 shadow-lg shadow-blue-500/20"
                          : "border-gray-600/50 bg-gray-700/30 hover:border-blue-400 hover:bg-blue-900/20 hover:shadow-lg"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-white mb-1">
                            {roadmap.role}
                          </h3>
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
                                      handleWeekNavigation(week);
                                    }}
                                    className="p-2 text-blue-400 hover:text-blue-300 transition-all duration-200 rounded-lg hover:bg-blue-900/30 border border-blue-500/30 hover:border-blue-400/50 shadow-sm hover:shadow-blue-500/20"
                                    title="Take Mock Interview"
                                  >
                                    <ExternalLink className="w-5 h-5" />
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
                                  onClick={() => handleWeekNavigation(week)}
                                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
                                >
                                  <span>Start Learning</span>
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
    </div>
  );
};

export default CareerRoadmaps;
