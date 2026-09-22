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

    // Get target user ID from query params (for viewing teammate progress)
    const { searchParams } = new URL(request.url);
    const paramUserId = searchParams.get('userId');
    const targetUserId = (paramUserId && paramUserId !== 'undefined' && paramUserId !== 'null') 
      ? paramUserId 
      : userId;

    console.log(`[GET-PROGRESS-SUMMARY] 🔐 Authenticated user: ${userId}`);
    console.log(`[GET-PROGRESS-SUMMARY] 🎯 Target user ID: ${targetUserId}`);
    console.log(`[GET-PROGRESS-SUMMARY] ${targetUserId === userId ? '⚠️ FETCHING OWN DATA ⚠️' : '✅ FETCHING TEAMMATE DATA ✅'}`);

    // Fetch required fields for target user
    const user = await User.findOne({ clerkUserId: targetUserId })
      .select('roadmap.progress roadmap.currentWeek roadmap.role assessmentSummary updatedAt firstName lastName username email')
      .lean();

    console.log(`[GET-PROGRESS-SUMMARY] 📊 User found: ${user ? 'Yes' : 'No'}`);
    if (user) {
      console.log(`[GET-PROGRESS-SUMMARY] 📈 User progress: ${user.roadmap?.progress}%`);
      console.log(`[GET-PROGRESS-SUMMARY] 📅 User current week: ${user.roadmap?.currentWeek}`);
      console.log(`[GET-PROGRESS-SUMMARY] 🛤️ User roadmap role: ${user.roadmap?.role}`);
    }

    if (!user) {
      console.log('[GET-PROGRESS-SUMMARY] ❌ User not found, returning default data');
      return NextResponse.json({
        overallProgress: 0,
        weeksCompleted: 0,
        totalWeeks: 8,
        nextMilestone: 'Week 1: Introduction to UI/UX Design',
        lastUpdated: new Date().toISOString().split('T')[0],
        mockInterviews: [],
        roadmapProgress: {},
        completedWeeks: {},
        nextSteps: [],
        assessmentSummary: {
          totalAttempts: 0,
          totalCompleted: 0,
          averageScore: 0,
          latestScore: 0,
          bestScore: 0,
          lastAttemptAt: null
        }
      });
    }

    const overallProgress = user.roadmap?.progress || 0;
    const currentWeek = user.roadmap?.currentWeek || 0;
    const totalWeeks = 8;

    console.log(`[GET-PROGRESS-SUMMARY] 💯 Calculated overallProgress: ${overallProgress}`);
    console.log(`[GET-PROGRESS-SUMMARY] 📆 Calculated weeksCompleted: ${currentWeek}`);

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
          ? 'Excellent performance!' 
          : user.assessmentSummary.latestScore >= 70 
          ? 'Good job!' 
          : user.assessmentSummary.latestScore >= 50 
          ? 'Fair performance.' 
          : 'Needs improvement.'
      });

      if (user.assessmentSummary.bestScore && user.assessmentSummary.bestScore !== user.assessmentSummary.latestScore) {
        mockInterviews.push({
          id: `${user.roadmap?.role || 'roadmap'}-best`,
          date: new Date().toISOString().split('T')[0],
          score: user.assessmentSummary.bestScore,
          roadmap: user.roadmap?.role || 'Current Roadmap',
          week: currentWeek,
          topics: [user.roadmap?.role || 'Roadmap', 'Best Performance'],
          feedback: 'Best performance to date!'
        });
      }
    }

    const roadmapProgress = {};
    if (user.roadmap?.role) {
      roadmapProgress[user.roadmap.role] = { weeks: {} };
      for (let i = 0; i < currentWeek; i++) {
        roadmapProgress[user.roadmap.role].weeks[i] = {
          completed: true,
          mockScore: i === currentWeek - 1 ? user.assessmentSummary?.latestScore : undefined
        };
      }
    }

    let nextMilestone = 'Week 1: Introduction';
    if (currentWeek < totalWeeks) {
      const milestones = {
        1: 'Week 1: Introduction', 2: 'Week 2: Fundamentals', 3: 'Week 3: Core Concepts',
        4: 'Week 4: Intermediate Skills', 5: 'Week 5: Advanced Topics', 6: 'Week 6: Specialization',
        7: 'Week 7: Project Work', 8: 'Week 8: Final Assessment'
      };
      nextMilestone = milestones[currentWeek + 1] || 'Complete Roadmap';
    } else {
      nextMilestone = 'Roadmap Complete!';
    }

    const nextSteps = currentWeek === 0 
      ? ['Start with Week 1', 'Set up learning environment', 'Review course materials']
      : currentWeek < 4
      ? [`Continue with Week ${currentWeek + 1}`, 'Practice previous weeks', 'Schedule study sessions']
      : currentWeek < totalWeeks
      ? [`Advance to Week ${currentWeek + 1}`, 'Build portfolio project', 'Connect with learners']
      : ['Apply skills to real projects', 'Build comprehensive portfolio', 'Consider advanced courses'];

    const responseData = {
      overallProgress,
      weeksCompleted: currentWeek,
      totalWeeks,
      nextMilestone,
      lastUpdated: user.updatedAt ? new Date(user.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      mockInterviews,
      roadmapProgress,
      completedWeeks: {},
      nextSteps,
      assessmentSummary: {
        totalAttempts: user.assessmentSummary?.totalAttempts || 0,
        totalCompleted: user.assessmentSummary?.totalCompleted || 0,
        averageScore: user.assessmentSummary?.averageScore || 0,
        latestScore: user.assessmentSummary?.latestScore || 0,
        bestScore: user.assessmentSummary?.bestScore || 0,
        lastAttemptAt: user.assessmentSummary?.lastAttemptAt || null
      },
      userProfile: {
        firstName: user.firstName || null,
        lastName: user.lastName || null,
        username: user.username || null,
        email: user.email || null,
        role: user.roadmap?.role || null
      }
    };

    console.log('[GET-PROGRESS-SUMMARY] 📦 Returning response:', JSON.stringify(responseData, null, 2));

    return NextResponse.json(responseData, {
      headers: { 'Cache-Control': 'private, max-age=60' }
    });

  } catch (error) {
    console.error("[GET-PROGRESS-SUMMARY] ❌ Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
