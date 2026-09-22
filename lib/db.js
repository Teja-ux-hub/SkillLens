// lib/db.js
import mongoose from "mongoose";

let connectionPromise = null;
const MAX_RETRIES = 3;

async function connectWithRetry(uri, attempt = 1) {
  try {
    return await mongoose.connect(uri, {
      dbName: "skilllens-db",
      bufferCommands: false,
      maxPoolSize: 20,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 10000, // Increased to 10s
      socketTimeoutMS: 45000,
      maxIdleTimeMS: 300000,
      retryWrites: true,
      retryReads: true,
    });
  } catch (err) {
    if (attempt < MAX_RETRIES && (err.code === 'ESERVFAIL' || err.code === 'ENOTFOUND' || err.code === 'ETIMEDOUT')) {
      console.log(`⚠️ MongoDB retry ${attempt}/${MAX_RETRIES} (${err.code})`);
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      return connectWithRetry(uri, attempt + 1);
    }
    throw err;
  }
}

export default async function dbConnect() {
  // If already connected, return immediately
  if (mongoose.connection.readyState === 1) {
    return;
  }

  // If connection is in progress, wait for it
  if (connectionPromise) {
    await connectionPromise;
    return;
  }

  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) {
    throw new Error("Please define the MONGO_URI environment variable");
  }

  try {
    mongoose.set('bufferCommands', false);
    connectionPromise = connectWithRetry(MONGO_URI);
    await connectionPromise;
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection failed after retries:", err);
    connectionPromise = null;
    throw err;
  }
}

