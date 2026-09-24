import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

async function clearAllDatabases() {
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) {
    console.error("❌ MONGO_URI not found in .env");
    process.exit(1);
  }

  console.log("🔌 Connecting to MongoDB cluster...");
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected successfully to MongoDB!\n");

  const admin = mongoose.connection.getClient().db().admin();
  const dbs = await admin.listDatabases();

  const results = [];

  for (const dbInfo of dbs.databases) {
    const dbName = dbInfo.name;
    // Skip internal system databases
    if (["admin", "local", "config"].includes(dbName)) {
      continue;
    }

    console.log(`🧹 Processing database: "${dbName}"...`);
    const db = mongoose.connection.getClient().db(dbName);
    const collections = await db.listCollections().toArray();

    if (collections.length === 0) {
      console.log(`   (No collections in "${dbName}")`);
      continue;
    }

    for (const col of collections) {
      const colName = col.name;
      const countBefore = await db.collection(colName).countDocuments();
      const deleteResult = await db.collection(colName).deleteMany({});
      const countAfter = await db.collection(colName).countDocuments();

      results.push({
        database: dbName,
        collection: colName,
        deleted: deleteResult.deletedCount,
        countBefore,
        countAfter
      });

      console.log(`   🗑️  [${dbName}] "${colName}": deleted ${deleteResult.deletedCount} documents (Remaining: ${countAfter})`);
    }
  }

  await mongoose.disconnect();
  console.log("\n🔌 Disconnected from MongoDB.");

  console.log("\n==========================================");
  console.log("       DATABASE PURGE AUDIT SUMMARY       ");
  console.log("==========================================");
  console.table(results);
  
  const totalDeleted = results.reduce((acc, r) => acc + r.deleted, 0);
  const totalRemaining = results.reduce((acc, r) => acc + r.countAfter, 0);

  console.log(`\n🎉 Total records deleted across all databases: ${totalDeleted}`);
  console.log(`✅ Total records remaining: ${totalRemaining}`);
  
  if (totalRemaining === 0) {
    console.log("✨ ALL DATABASES AND COLLECTIONS ARE NOW 100% EMPTY!");
  } else {
    console.warn("⚠️ Warning: Some records could not be deleted.");
  }
}

clearAllDatabases().catch(err => {
  console.error("❌ Error purging database:", err);
  process.exit(1);
});
