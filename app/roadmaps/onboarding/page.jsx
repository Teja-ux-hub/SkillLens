"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { 
  User, 
  Users, 
  Shuffle,
  ArrowRight,
  Sparkles,
  Target,
  Rocket
} from "lucide-react";
import { toast } from "sonner";
import { careerRoadmaps } from "@/data/mockData";

export default function RoadmapOnboarding() {
  const router = useRouter();
  const { user } = useUser();
  const [selectedMode, setSelectedMode] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);

  // Extract role names from careerRoadmaps
  const availableRoles = careerRoadmaps.map(roadmap => ({
    value: roadmap.role,
    label: roadmap.role.charAt(0).toUpperCase() + roadmap.role.slice(1).replace(/([A-Z])/g, ' $1').trim()
  }));

  const learningModes = [
    {
      id: "solo",
      title: "Solo Journey",
      description: "Learn at your own pace independently",
      icon: User,
      color: "from-blue-500 to-cyan-500",
      features: ["Full access to all roadmaps", "Progress at your speed", "Complete flexibility"]
    },
    {
      id: "pair",
      title: "Pair Programming",
      description: "Team up with one learning partner",
      icon: Users,
      color: "from-purple-500 to-pink-500",
      features: ["Learn together with a partner", "Share progress and goals", "Collaborative learning"]
    },
    {
      id: "exchange",
      title: "Skill Exchange",
      description: "Exchange knowledge and grow together",
      icon: Shuffle,
      color: "from-orange-500 to-red-500",
      features: ["Teach and learn from peers", "Build strong connections", "Diverse perspectives"]
    }
  ];

  const handleModeSelect = (modeId) => {
    setSelectedMode(modeId);
    
    if (modeId === "solo") {
      // Solo mode: no role selection needed
      setShowRoleSelector(false);
    } else {
      // Pair/Exchange: show role selector
      setShowRoleSelector(true);
    }
  };

  const handleSubmit = async () => {
    if (!selectedMode) {
      toast.error("Please select a learning mode");
      return;
    }

    if ((selectedMode === "pair" || selectedMode === "exchange") && !selectedRole) {
      toast.error("Please select a role to learn");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/roadmaps/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          learningMode: selectedMode,
          selectedRole: selectedMode === "solo" ? null : selectedRole
        })
      });

      const data = await response.json();

      if (response.ok) {
        if (selectedMode === "solo") {
          toast.success("Welcome to your Solo Journey! 🚀");
          router.push("/roadmaps");
        } else {
          // Pair or Exchange mode
          if (data.paired) {
            toast.success(`Paired successfully with ${data.partnerName}! 🎉`);
          } else {
            toast.info("You're in the waiting queue. We'll notify you when we find a match!");
          }
          router.push("/roadmaps");
        }
      } else {
        toast.error(data.error || "Failed to save your choice");
      }
    } catch (error) {
      console.error("Onboarding error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-6 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 text-sm font-medium">Welcome to SkillLens</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Choose Your Learning Path
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Select how you'd like to learn and grow. You can always change this later.
          </p>
        </div>

        {/* Mode Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {learningModes.map((mode) => {
            const Icon = mode.icon;
            const isSelected = selectedMode === mode.id;

            return (
              <button
                key={mode.id}
                onClick={() => handleModeSelect(mode.id)}
                className={`
                  relative p-6 rounded-2xl border-2 transition-all duration-300 text-left
                  ${isSelected 
                    ? 'border-blue-500 bg-blue-500/10 scale-105 shadow-2xl shadow-blue-500/20' 
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800/70'
                  }
                `}
              >
                {/* Selected Badge */}
                {isSelected && (
                  <div className="absolute -top-3 -right-3 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    Selected
                  </div>
                )}

                {/* Icon */}
                <div className={`
                  w-14 h-14 rounded-xl bg-gradient-to-br ${mode.color} 
                  flex items-center justify-center mb-4
                `}>
                  <Icon className="w-7 h-7 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-2">{mode.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{mode.description}</p>

                {/* Features */}
                <ul className="space-y-2">
                  {mode.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        {/* Role Selector (for Pair/Exchange modes) */}
        {showRoleSelector && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 mb-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Select Your Learning Role</h3>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Choose which role you want to focus on. We'll match you with someone learning the same path.
            </p>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">-- Select a role --</option>
              {availableRoles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={!selectedMode || isSubmitting}
            className="
              group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 
              text-white font-semibold rounded-xl
              disabled:opacity-50 disabled:cursor-not-allowed
              hover:from-blue-700 hover:to-purple-700
              transition-all duration-300 transform hover:scale-105
              shadow-lg hover:shadow-2xl
              flex items-center gap-3
            "
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Rocket className="w-5 h-5" />
                Start My Journey
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
