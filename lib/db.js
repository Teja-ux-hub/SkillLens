// lib/db.js
import mongoose from "mongoose";

let connectionPromise = null;

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
    // Set mongoose options globally
    mongoose.set('bufferCommands', false);
    
    // Store the connection promise so concurrent requests wait for the same connection
    connectionPromise = mongoose.connect(MONGO_URI, {
      dbName: "skilllens-db",
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    await connectionPromise;
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    connectionPromise = null;
    throw err;
  }
}
