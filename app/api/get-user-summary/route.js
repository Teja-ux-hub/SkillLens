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

    // Check if querying for a specific user (e.g., teammate)
    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('userId') || userId;

    const user = await User.findOne({ clerkUserId: targetUserId });
    if (!user) {
      return NextResponse.json({ 
        summary: null, 
        githubUsername: null,
        firstName: null,
        lastName: null,
        username: null
      });
    }

    return NextResponse.json({
      summary: user.github?.summary || null,
      githubUsername: user.github?.username || null,
      firstName: user.firstName || null,
      lastName: user.lastName || null,
      username: user.username || null,
      email: user.email || null,
      onboarding: user.onboarding || null,
    });
  } catch (error) {
    console.error("Error fetching user summary:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
