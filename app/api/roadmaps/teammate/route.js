import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
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

    // Fetch email from Clerk
    let teammateEmail = null;
    try {
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(teammateId);
      teammateEmail = clerkUser.emailAddresses?.[0]?.emailAddress || null;
    } catch (error) {
      console.warn(`[TEAMMATE-API] ⚠️ Could not fetch Clerk data for teammate ${teammateId}:`, error.message);
    }

    // Return only safe fields
    const safeTeammateData = {
      clerkUserId: teammateId, // Teammate's Clerk user ID
      userId: teammateId, // Add userId field for consistency
      firstName: teammate.firstName || null,
      lastName: teammate.lastName || null,
      username: teammate.username || null,
      email: teammateEmail,
      selectedRole: teammate.onboarding?.selectedRole || null,
      learningMode: teammate.onboarding?.learningMode || null,
      githubUsername: teammate.github?.username || null,
      roadmapProgress: teammate.roadmap?.progress || 0,
      assessmentSummary: teammate.assessmentSummary || null
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
