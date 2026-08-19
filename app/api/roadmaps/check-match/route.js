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
      return NextResponse.json({ 
        status: 'none',
        message: 'User not found'
      }, { status: 404 });
    }

    const response = {
      status: user.matching?.status || 'none',
      teammateId: user.matching?.teammateId || null,
      learningMode: user.onboarding?.learningMode || null,
      selectedRole: user.onboarding?.selectedRole || null,
      matchedAt: user.matching?.matchedAt || null,
      queuedAt: user.matching?.queuedAt || null
    };

    // Log ONLY when newly matched (client will detect change)
    if (response.status === 'matched' && response.teammateId) {
      console.log(`[CHECK-MATCH] ✅ User ${userId} matched with ${response.teammateId}`);
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error("[CHECK-MATCH] ❌ Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
