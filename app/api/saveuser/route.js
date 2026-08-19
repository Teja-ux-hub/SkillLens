import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import User from "@/models/UserModel";
import dbConnect from "@/lib/db";

export async function POST() {
  await dbConnect();

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

  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  // Check if user already exists using clerkUserId
  const existing = await User.findOne({ clerkUserId: userId });
  
  if (!existing) {
    // Create new user with proper defaults
    await User.create({
      clerkUserId: userId,
      role: {
        student: true,
        hod: false,
        director: false
      },
      roadmap: {
        progress: 0
      },
      assessmentSummary: {
        totalAttempts: 0,
        totalCompleted: 0,
        averageScore: 0
      },
      status: 'active'
    });
  }

  return NextResponse.json({ saved: true });
}
