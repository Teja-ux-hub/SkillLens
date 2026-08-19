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

    const user = await User.findOne({ clerkUserId: userId }).lean();

    if (!user) {
      // New user - needs onboarding
      return NextResponse.json({ onboardingCompleted: false });
    }

    // Check if onboarding is completed
    const onboardingCompleted = user.onboarding?.completed || false;

    return NextResponse.json({ 
      onboardingCompleted,
      learningMode: user.onboarding?.learningMode || null,
      selectedRole: user.onboarding?.selectedRole || null,
      matchingStatus: user.matching?.status || 'none',
      teammateId: user.matching?.teammateId || null
    });

  } catch (error) {
    console.error("Check onboarding error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
