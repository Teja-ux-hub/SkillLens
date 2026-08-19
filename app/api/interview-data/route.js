import { auth } from '@clerk/nextjs/server';
import dbConnect from "@/lib/db";
import { NextResponse } from 'next/server';
import User from "@/models/UserModel";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    let userId = searchParams.get("userId");

    if (!userId) {
      let authData;
      try {
        authData = auth();
        if (authData && typeof authData.then === 'function') {
          authData = await authData;
        }
      } catch (error) {
        authData = await auth();
      }
      userId = authData?.userId;
    }
    
    if (!userId) {
      return NextResponse.json(
        { message: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    await dbConnect();
    
    // Query by clerkUserId
    const userData = await User.findOne({ clerkUserId: userId });
    
    if (!userData) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Return full user data (frontend will extract needed fields)
    return NextResponse.json(userData);

  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
