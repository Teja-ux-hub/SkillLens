import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/db";
import User from "@/models/UserModel";

export async function POST(request) {
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

    const { roadmap, weekId, mockScore } = await request.json();
    if (!roadmap || weekId === undefined || mockScore === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await dbConnect();

    // Find user by clerkUserId
    let user = await User.findOne({ clerkUserId: userId });
    if (!user) {
      user = new User({ 
        clerkUserId: userId,
        role: { student: true, hod: false, director: false },
        status: 'active'
      });
    }

    // Update roadmap current state
    user.roadmap = user.roadmap || {};
    user.roadmap.role = roadmap;
    user.roadmap.currentWeek = weekId;
    user.roadmap.currentStage = `Week ${weekId}`;
    user.roadmap.lastActivityAt = new Date();
    
    // Calculate progress (assuming 8 weeks per roadmap)
    const totalWeeks = 8;
    user.roadmap.progress = Math.round((weekId / totalWeeks) * 100);
    
    // Update assessment summary
    user.assessmentSummary = user.assessmentSummary || {
      totalAttempts: 0,
      totalCompleted: 0,
      averageScore: 0
    };
    
    user.assessmentSummary.totalAttempts += 1;
    user.assessmentSummary.latestScore = mockScore;
    
    if (mockScore >= 90) {
      user.assessmentSummary.totalCompleted += 1;
    }
    
    // Update best score
    if (!user.assessmentSummary.bestScore || mockScore > user.assessmentSummary.bestScore) {
      user.assessmentSummary.bestScore = mockScore;
    }
    
    // Recalculate average score (running average)
    const currentTotal = user.assessmentSummary.averageScore * (user.assessmentSummary.totalAttempts - 1);
    user.assessmentSummary.averageScore = Math.round((currentTotal + mockScore) / user.assessmentSummary.totalAttempts);
    
    user.assessmentSummary.lastAttemptAt = new Date();
    
    user.markModified('roadmap');
    user.markModified('assessmentSummary');

    await user.save();

    console.log(`✅ Saved mock score ${mockScore} for ${roadmap} week ${weekId}`);

    return NextResponse.json({
      success: true,
      mockScore,
      assessmentSummary: user.assessmentSummary,
      roadmap: user.roadmap,
      message: 'Mock score saved successfully'
    });
   
  } catch (error) {
    console.error("❌ Error saving mock score:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
