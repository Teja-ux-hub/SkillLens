import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/db";
import User from "@/models/UserModel";

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Get current user
    const currentUser = await User.findOne({ clerkUserId: userId }).lean();

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has a teammate
    const teammateId = currentUser.matching?.teammateId;

    if (!teammateId) {
      return NextResponse.json({ 
        teammate: null,
        message: 'No teammate assigned'
      });
    }

    // Fetch ONLY the teammate (security: can't fetch arbitrary users)
    const teammate = await User.findOne({ clerkUserId: teammateId }).lean();

    if (!teammate) {
      console.warn(`[TEAMMATE-API] ⚠️ Teammate ${teammateId} not found for user ${userId}`);
      return NextResponse.json({ 
        teammate: null,
        message: 'Teammate not found'
      });
    }

    // Return only safe fields
    const safeTeammateData = {
      firstName: teammate.firstName || null,
      lastName: teammate.lastName || null,
      username: teammate.username || null,
      selectedRole: teammate.onboarding?.selectedRole || null,
      learningMode: teammate.onboarding?.learningMode || null,
      githubUsername: teammate.github?.username || null,
      roadmapProgress: teammate.roadmap?.progress || 0
    };

    console.log(`[TEAMMATE-API] ✅ User ${userId} fetched teammate ${teammateId} data`);

    return NextResponse.json({ 
      teammate: safeTeammateData
    });

  } catch (error) {
    console.error("[TEAMMATE-API] ❌ Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
