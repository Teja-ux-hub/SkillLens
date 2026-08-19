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

    const { searchParams } = new URL(request.url);
    const roadmap = searchParams.get("roadmap");
    const weekId = searchParams.get("weekId");

    await dbConnect();

    const user = await User.findOne({ clerkUserId: userId });
    if (!user) {
      // If requesting specific week, return null
      if (roadmap && weekId) {
        return NextResponse.json({ mockScore: null, completed: false, date: null });
      }
      // If requesting all progress, return empty
      return NextResponse.json({ completedWeeks: {} });
    }

    // If requesting specific week data
    if (roadmap && weekId) {
      // Check if current roadmap matches and week is <= currentWeek
      if (user.roadmap?.role === roadmap && user.roadmap?.currentWeek >= parseInt(weekId)) {
        const isCurrentWeek = user.roadmap.currentWeek === parseInt(weekId);
        return NextResponse.json({
          mockScore: isCurrentWeek ? (user.assessmentSummary?.latestScore || null) : null,
          completed: user.roadmap.currentWeek > parseInt(weekId),
          date: isCurrentWeek && user.assessmentSummary?.lastAttemptAt 
            ? new Date(user.assessmentSummary.lastAttemptAt).toISOString().split('T')[0]
            : null
        });
      }
      
      return NextResponse.json({ mockScore: null, completed: false, date: null });
    }

    // Return all completed weeks based on current roadmap state
    const completedWeeks = {};
    
    if (user.roadmap?.role && user.roadmap?.currentWeek) {
      for (let i = 0; i < user.roadmap.currentWeek; i++) {
        const key = `${user.roadmap.role}-${i}`;
        completedWeeks[key] = true;
      }
    }

    return NextResponse.json({ completedWeeks });

  } catch (error) {
    console.error("Error fetching progress:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
