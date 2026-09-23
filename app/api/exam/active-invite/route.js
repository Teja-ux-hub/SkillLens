import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/db";
import User from "@/models/UserModel";
import ExamSession from "@/models/ExamSessionModel";

export async function GET(request) {
  try {
    let authData;
    try {
      authData = auth();
      if (authData && typeof authData.then === "function") {
        authData = await authData;
      }
    } catch (err) {
      authData = await auth();
    }

    const { userId } = authData || {};
    if (!userId) {
      return NextResponse.json({ hasInvite: false }, { status: 401 });
    }

    await dbConnect();

    const now = new Date();
    // Find any pending pair exam invitation where this user is user2 and deadline hasn't expired
    const pendingSession = await ExamSession.findOne({
      user2Id: userId,
      status: "WAITING_FOR_TEAMMATE",
      joinDeadline: { $gt: now },
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!pendingSession) {
      return NextResponse.json({ hasInvite: false });
    }

    // Lookup partner (user1) details
    let inviterName = "Your Teammate";
    try {
      const inviterUser = await User.findOne({ clerkUserId: pendingSession.user1Id }).lean();
      if (inviterUser) {
        if (inviterUser.firstName && inviterUser.lastName) {
          inviterName = `${inviterUser.firstName} ${inviterUser.lastName}`;
        } else if (inviterUser.username) {
          inviterName = `@${inviterUser.username}`;
        }
      }

      // If still generic, try Clerk API
      if (inviterName === "Your Teammate" && process.env.CLERK_SECRET_KEY) {
        const { createClerkClient } = await import("@clerk/backend");
        const client = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
        const clerkUser = await client.users.getUser(pendingSession.user1Id);
        if (clerkUser) {
          inviterName =
            (clerkUser.firstName && clerkUser.lastName
              ? `${clerkUser.firstName} ${clerkUser.lastName}`
              : clerkUser.username || clerkUser.emailAddresses?.[0]?.emailAddress) || "Your Teammate";
        }
      }
    } catch (err) {
      console.warn("Could not resolve inviter name:", err.message);
    }

    return NextResponse.json({
      hasInvite: true,
      invite: {
        sessionId: pendingSession.sessionId,
        weekNumber: pendingSession.weekNumber,
        inviterId: pendingSession.user1Id,
        inviterName,
        joinDeadline: pendingSession.joinDeadline,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching active exam invite:", error);
    return NextResponse.json({ hasInvite: false, error: error.message }, { status: 500 });
  }
}
