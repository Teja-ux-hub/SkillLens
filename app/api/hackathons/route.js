import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/db";
import Hackathon from "@/models/HackathonModel";

export async function GET(request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Get only active hackathons (registration deadline not passed)
    const hackathons = await Hackathon.find({
      registrationDeadline: { $gte: new Date() }
    })
      .sort({ registrationDeadline: 1 })
      .lean();
    
    return NextResponse.json({ hackathons });
  } catch (error) {
    console.error("Error fetching hackathons:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
