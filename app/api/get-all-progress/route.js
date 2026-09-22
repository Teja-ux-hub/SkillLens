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
    const paramUserId = searchParams.get("userId");
    const targetUserId = (paramUserId && paramUserId !== 'undefined' && paramUserId !== 'null') 
      ? paramUserId 
      : userId;

    console.log(`[GET-ALL-PROGRESS] 🔐 Authenticated user: ${userId}`);
    console.log(`[GET-ALL-PROGRESS] 🎯 Target user ID: ${targetUserId}`);
    console.log(`[GET-ALL-PROGRESS] ${targetUserId === userId ? '⚠️ FETCHING OWN DATA ⚠️' : '✅ FETCHING TEAMMATE DATA ✅'}`);
    console.log(`[GET-ALL-PROGRESS] 📋 Query params - roadmap: ${roadmap}, weekId: ${weekId}`);

    await dbConnect();

    const user = await User.findOne({ clerkUserId: targetUserId });
    
    console.log(`[GET-ALL-PROGRESS] 📊 User found: ${user ? 'Yes' : 'No'}`);
    if (user) {
      console.log(`[GET-ALL-PROGRESS] 🛤️ User roadmap role: ${user.roadmap?.role}`);
      console.log(`[GET-ALL-PROGRESS] 📅 User current week: ${user.roadmap?.currentWeek}`);
      console.log(`[GET-ALL-PROGRESS] 📈 User roadmap progress: ${user.roadmap?.progress}%`);
    }
    
    if (!user) {
      console.log('[GET-ALL-PROGRESS] ❌ User not found, returning null/empty data');
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
        const weekData = {
          mockScore: isCurrentWeek ? (user.assessmentSummary?.latestScore || null) : null,
          completed: user.roadmap.currentWeek > parseInt(weekId),
          date: isCurrentWeek && user.assessmentSummary?.lastAttemptAt 
            ? new Date(user.assessmentSummary.lastAttemptAt).toISOString().split('T')[0]
            : null
        };
        console.log(`[GET-ALL-PROGRESS] 📦 Returning week ${weekId} data:`, weekData);
        return NextResponse.json(weekData);
      }
      
      console.log(`[GET-ALL-PROGRESS] ❌ Week ${weekId} not found or not in roadmap ${roadmap}`);
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

    console.log(`[GET-ALL-PROGRESS] 📦 Returning completed weeks:`, completedWeeks);
    return NextResponse.json({ completedWeeks });

  } catch (error) {
    console.error("[GET-ALL-PROGRESS] ❌ Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
