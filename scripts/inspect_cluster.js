import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

async function inspect() {
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) {
    console.error("No MONGO_URI found in .env");
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB!");

  const admin = mongoose.connection.getClient().db().admin();
  const dbs = await admin.listDatabases();
  console.log("\n--- Databases in cluster ---");
  for (const dbInfo of dbs.databases) {
    console.log(`\n📁 Database: "${dbInfo.name}" (sizeOnDisk: ${dbInfo.sizeOnDisk} bytes)`);
    if (!["admin", "local", "config"].includes(dbInfo.name)) {
      const db = mongoose.connection.getClient().db(dbInfo.name);
      const collections = await db.listCollections().toArray();
      if (collections.length === 0) {
        console.log("   (No collections)");
      }
      for (const col of collections) {
        const count = await db.collection(col.name).countDocuments();
        console.log(`   📄 Collection: "${col.name}" -> ${count} documents`);
      }
    }
  }

  await mongoose.disconnect();
  console.log("\nDone inspecting.");
}

inspect().catch(err => {
  console.error("Inspect error:", err);
  process.exit(1);
});
