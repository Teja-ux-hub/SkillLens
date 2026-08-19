import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/db";
import User from "@/models/UserModel";
import MatchQueue from "@/models/MatchQueueModel";
import { areRolesCompatible } from "@/lib/role-compatibility";

export async function POST(request) {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`\n[ONBOARDING-${requestId}] ========== NEW ONBOARDING REQUEST ==========`);
  
  try {
    const { userId } = await auth();
    
    if (!userId) {
      console.log(`[ONBOARDING-${requestId}] ❌ Unauthorized request`);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(`[ONBOARDING-${requestId}] 👤 User: ${userId}`);

    const { learningMode, selectedRole } = await request.json();
    console.log(`[ONBOARDING-${requestId}] 📝 Mode: ${learningMode}, Role: ${selectedRole}`);

    // Validate input
    if (!learningMode || !['solo', 'pair', 'exchange'].includes(learningMode)) {
      console.log(`[ONBOARDING-${requestId}] ❌ Invalid learning mode: ${learningMode}`);
      return NextResponse.json({ error: "Invalid learning mode" }, { status: 400 });
    }

    if ((learningMode === 'pair' || learningMode === 'exchange') && !selectedRole) {
      console.log(`[ONBOARDING-${requestId}] ❌ Role required for ${learningMode} mode`);
      return NextResponse.json({ error: "Role selection required for pair/exchange mode" }, { status: 400 });
    }

    await dbConnect();
    console.log(`[ONBOARDING-${requestId}] 🔌 Database connected`);

    // Get current user
    const currentUser = await User.findOne({ clerkUserId: userId }).lean();
    const organizationId = currentUser?.college?.organizationId;
    const userName = currentUser?.firstName && currentUser?.lastName 
      ? `${currentUser.firstName} ${currentUser.lastName}`
      : currentUser?.username || 'Unknown';

    console.log(`[ONBOARDING-${requestId}] 👤 User: ${userName}`);
    console.log(`[ONBOARDING-${requestId}] 🏢 Organization: ${organizationId || 'None'}`);

    let paired = false;
    let partnerName = null;
    let partnerId = null;
    let partnerRole = null;

    // ========== SOLO MODE ==========
    if (learningMode === 'solo') {
      console.log(`[ONBOARDING-${requestId}] 🚶 Solo mode - no matching required`);
      
      await User.updateOne(
        { clerkUserId: userId },
        {
          $set: {
            'onboarding.completed': true,
            'onboarding.learningMode': 'solo',
            'onboarding.selectedRole': selectedRole,
            'onboarding.completedAt': new Date(),
            'matching.status': 'none',
            'matching.teammateId': null,
            'matching.queuedAt': null,
            'matching.matchedAt': null
          }
        },
        { upsert: true }
      );

      console.log(`[ONBOARDING-${requestId}] ✅ Solo mode activated`);
      console.log(`[ONBOARDING-${requestId}] ========== REQUEST COMPLETE ==========\n`);
      
      return NextResponse.json({
        success: true,
        paired: false,
        message: "Solo mode activated"
      });
    }

    // ========== PAIR or EXCHANGE MODE ==========
    console.log(`[ONBOARDING-${requestId}] 🔍 Searching MatchQueue for compatible partner...`);

    let matchQuery = {
      userId: { $ne: userId },
      learningMode: learningMode
    };

    // Add organization filter if exists
    if (organizationId) {
      matchQuery.organizationId = organizationId;
      console.log(`[ONBOARDING-${requestId}] 🏢 Filtering by organization: ${organizationId}`);
    }

    let matchedCandidate = null;

    // ========== PAIR MODE: Same role ==========
    if (learningMode === 'pair') {
      matchQuery.selectedRole = selectedRole;
      console.log(`[ONBOARDING-${requestId}] 👥 Pair mode - searching for: ${selectedRole}`);

      // ATOMIC: Find and remove from queue in one operation
      matchedCandidate = await MatchQueue.findOneAndDelete(matchQuery);

      if (matchedCandidate) {
        console.log(`[ONBOARDING-${requestId}] 🎉 PAIR MATCH FOUND!`);
        console.log(`[ONBOARDING-${requestId}]   Candidate: ${matchedCandidate.userId} (${matchedCandidate.name})`);
      } else {
        console.log(`[ONBOARDING-${requestId}] ℹ️ No pair candidates available`);
      }
    }
    // ========== EXCHANGE MODE: Complementary role ==========
    else if (learningMode === 'exchange') {
      console.log(`[ONBOARDING-${requestId}] 🔄 Exchange mode - searching for complementary roles to: ${selectedRole}`);

      // Get all waiting exchange users
      const candidates = await MatchQueue.find(matchQuery).lean();
      console.log(`[ONBOARDING-${requestId}] 📋 Found ${candidates.length} exchange candidates`);

      // Find first compatible candidate
      for (const candidate of candidates) {
        const isCompatible = areRolesCompatible(selectedRole, candidate.selectedRole);
        console.log(`[ONBOARDING-${requestId}]   - ${candidate.name} (${candidate.selectedRole}): ${isCompatible ? '✅ Compatible' : '❌ Not compatible'}`);

        if (isCompatible) {
          // ATOMIC: Remove candidate from queue
          matchedCandidate = await MatchQueue.findOneAndDelete({ userId: candidate.userId });
          
          if (matchedCandidate) {
            console.log(`[ONBOARDING-${requestId}] 🎉 EXCHANGE MATCH FOUND!`);
            console.log(`[ONBOARDING-${requestId}]   You: ${selectedRole} ↔ Partner: ${matchedCandidate.selectedRole}`);
            break;
          } else {
            console.log(`[ONBOARDING-${requestId}]   ⚠️ Race condition - candidate taken`);
          }
        }
      }

      if (!matchedCandidate) {
        console.log(`[ONBOARDING-${requestId}] ℹ️ No compatible exchange partners available`);
      }
    }

    // ========== PROCESS MATCH RESULT ==========
    if (matchedCandidate) {
      paired = true;
      partnerId = matchedCandidate.userId;
      partnerName = matchedCandidate.name;
      partnerRole = matchedCandidate.selectedRole;

      console.log(`[ONBOARDING-${requestId}] 💑 MATCH SUCCESSFUL!`);
      console.log(`[ONBOARDING-${requestId}]   User A: ${userId} (${userName}) - ${selectedRole}`);
      console.log(`[ONBOARDING-${requestId}]   User B: ${partnerId} (${partnerName}) - ${partnerRole}`);
      console.log(`[ONBOARDING-${requestId}]   Mode: ${learningMode}`);

      // Update BOTH users atomically
      const matchedAt = new Date();

      await User.updateOne(
        { clerkUserId: partnerId },
        {
          $set: {
            'matching.status': 'matched',
            'matching.teammateId': userId,
            'matching.matchedAt': matchedAt
          }
        }
      );

      await User.updateOne(
        { clerkUserId: userId },
        {
          $set: {
            'onboarding.completed': true,
            'onboarding.learningMode': learningMode,
            'onboarding.selectedRole': selectedRole,
            'onboarding.completedAt': new Date(),
            'matching.status': 'matched',
            'matching.teammateId': partnerId,
            'matching.matchedAt': matchedAt,
            'matching.queuedAt': null
          }
        },
        { upsert: true }
      );

      console.log(`[ONBOARDING-${requestId}] ✅ Both users updated with match`);
    } 
    // ========== NO MATCH - ADD TO QUEUE ==========
    else {
      console.log(`[ONBOARDING-${requestId}] ⏳ No match found - adding to MatchQueue`);

      // Add to MatchQueue
      await MatchQueue.create({
        userId: userId,
        learningMode: learningMode,
        selectedRole: selectedRole,
        organizationId: organizationId || null,
        name: userName,
        email: currentUser?.email || null,
        queuedAt: new Date()
      });

      // Update User
      await User.updateOne(
        { clerkUserId: userId },
        {
          $set: {
            'onboarding.completed': true,
            'onboarding.learningMode': learningMode,
            'onboarding.selectedRole': selectedRole,
            'onboarding.completedAt': new Date(),
            'matching.status': 'waiting',
            'matching.teammateId': null,
            'matching.queuedAt': new Date(),
            'matching.matchedAt': null
          }
        },
        { upsert: true }
      );

      console.log(`[ONBOARDING-${requestId}] ✅ Added to queue successfully`);
    }

    console.log(`[ONBOARDING-${requestId}] ========== REQUEST COMPLETE ==========\n`);

    return NextResponse.json({
      success: true,
      paired,
      partnerName,
      partnerRole,
      message: paired 
        ? "Successfully paired!" 
        : "Added to waiting queue"
    });

  } catch (error) {
    console.error(`[ONBOARDING-${requestId}] ❌ ERROR:`, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
