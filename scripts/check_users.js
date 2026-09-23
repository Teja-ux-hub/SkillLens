import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

async function check() {
  const MONGO_URI = process.env.MONGO_URI;
  await mongoose.connect(MONGO_URI, { dbName: "skilllens-db" });
  console.log("Connected to MongoDB");

  const users = await mongoose.connection.collection("users").find({}).toArray();
  console.log(`Found ${users.length} users:`);
  users.forEach((u) => {
    console.log(`- clerkUserId: ${u.clerkUserId}, name: ${u.firstName} ${u.lastName} (@${u.username}), role: ${u.onboarding?.selectedRole}, matching: ${JSON.stringify(u.matching)}`);
  });

  const sessions = await mongoose.connection.collection("examsessions").find({}).sort({ createdAt: -1 }).limit(3).toArray();
  console.log(`\nLast ${sessions.length} exam sessions:`);
  sessions.forEach((s) => {
    console.log(`- SessionId: ${s.sessionId}, mode: ${s.mode}, status: ${s.status}, user1: ${s.user1Id}, user2: ${s.user2Id}, questions: ${s.selectedQuestions?.length}`);
  });

  process.exit(0);
}

check().catch(console.error);
