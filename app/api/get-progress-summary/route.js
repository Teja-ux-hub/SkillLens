import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/db";
import User from "@/models/UserModel";

export async function GET(request) {
  try {
    let authData;
    try {
      authData = auth();
      if (authData && typeof authData.then === 'function') {
        authData = await authData;
      }
    } catch (error) {
      authData = await auth();
    }
    
    const { userId } = authData || {};
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findOne({ clerkUserId: userId });
    if (!user) {
      return NextResponse.json({
        overallProgress: 0,
        weeksCompleted: 0,
        totalWeeks: 8,
        nextMilestone: 'Week 1: Introduction to UI/UX Design',
        lastUpdated: new Date().toISOString().split('T')[0],
        mockInterviews: [],
        roadmapProgress: {},
        completedWeeks: {},
        nextSteps: []
      });
    }

    // Get progress from new schema structure
    const overallProgress = user.roadmap?.progress || 0;
    const currentWeek = user.roadmap?.currentWeek || 0;
    const totalWeeks = 8; // Standard roadmap length

    // Build mock interviews from assessmentSummary
    const mockInterviews = [];
    if (user.assessmentSummary?.latestScore !== undefined) {
      mockInterviews.push({
        id: `${user.roadmap?.role || 'roadmap'}-latest`,
        date: user.assessmentSummary.lastAttemptAt 
          ? new Date(user.assessmentSummary.lastAttemptAt).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        score: user.assessmentSummary.latestScore,
        roadmap: user.roadmap?.role || 'Current Roadmap',
        week: currentWeek,
        topics: [user.roadmap?.role || 'Roadmap', `Week ${currentWeek}`],
        feedback: user.assessmentSummary.latestScore >= 90 
          ? 'Excellent performance! Keep up the great work.' 
          : user.assessmentSummary.latestScore >= 70 
          ? 'Good job! Consider reviewing areas for improvement.' 
          : user.assessmentSummary.latestScore >= 50 
          ? 'Fair performance. Focus on practicing more.' 
          : 'Needs improvement. Consider additional study and practice.'
      });

      // Add best score if different from latest
      if (user.assessmentSummary.bestScore && user.assessmentSummary.bestScore !== user.assessmentSummary.latestScore) {
        mockInterviews.push({
          id: `${user.roadmap?.role || 'roadmap'}-best`,
          date: new Date().toISOString().split('T')[0],
          score: user.assessmentSummary.bestScore,
          roadmap: user.roadmap?.role || 'Current Roadmap',
          week: currentWeek,
          topics: [user.roadmap?.role || 'Roadmap', 'Best Performance'],
          feedback: 'Your best performance to date!'
        });
      }
    }

    // Build roadmap progress display
    const roadmapProgress = {};
    if (user.roadmap?.role) {
      roadmapProgress[user.roadmap.role] = {
        weeks: {}
      };
      
      // Mark completed weeks based on current progress
      for (let i = 0; i < currentWeek; i++) {
        roadmapProgress[user.roadmap.role].weeks[i] = {
          completed: true,
          mockScore: i === currentWeek - 1 ? user.assessmentSummary?.latestScore : undefined
        };
      }
    }

    // Determine next milestone
    let nextMilestone = 'Week 1: Introduction';
    if (currentWeek < totalWeeks) {
      const nextWeek = currentWeek + 1;
      const milestones = {
        1: 'Week 1: Introduction',
        2: 'Week 2: Fundamentals',
        3: 'Week 3: Core Concepts',
        4: 'Week 4: Intermediate Skills',
        5: 'Week 5: Advanced Topics',
        6: 'Week 6: Specialization',
        7: 'Week 7: Project Work',
        8: 'Week 8: Final Assessment'
      };
      nextMilestone = milestones[nextWeek] || 'Complete Roadmap';
    } else {
      nextMilestone = 'Roadmap Complete!';
    }

    // Generate next steps
    const nextSteps = [];
    if (currentWeek === 0) {
      nextSteps.push(
        'Start with Week 1',
        'Set up your learning environment',
        'Review the course materials and resources'
      );
    } else if (currentWeek < 4) {
      nextSteps.push(
        `Continue with Week ${currentWeek + 1}`,
        'Practice the concepts from previous weeks',
        'Schedule regular study sessions'
      );
    } else if (currentWeek < totalWeeks) {
      nextSteps.push(
        `Advance to Week ${currentWeek + 1}`,
        'Build a portfolio project using learned skills',
        'Connect with other learners'
      );
    } else {
      nextSteps.push(
        'Apply your skills to real projects',
        'Build a comprehensive portfolio',
        'Consider advanced courses'
      );
    }

    return NextResponse.json({
      overallProgress,
      weeksCompleted: currentWeek,
      totalWeeks,
      nextMilestone,
      lastUpdated: user.updatedAt 
        ? new Date(user.updatedAt).toISOString().split('T')[0] 
        : new Date().toISOString().split('T')[0],
      mockInterviews,
      roadmapProgress,
      completedWeeks: {},
      nextSteps
    });

  } catch (error) {
    console.error("Error fetching progress summary:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
