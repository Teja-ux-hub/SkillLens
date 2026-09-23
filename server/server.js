import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const app = express();
const PORT = process.env.PORT || process.env.SOCKET_PORT || 3001;
const CLIENT_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

app.use(cors({ origin: "*" }));
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  pingTimeout: 30000,
  pingInterval: 10000,
});

// Connect to MongoDB for direct real-time persistence
const MONGO_URI = process.env.MONGO_URI;
if (MONGO_URI) {
  mongoose
    .connect(MONGO_URI, { dbName: "skilllens-db" })
    .then(() => console.log("✅ Socket Server connected to MongoDB"))
    .catch((err) => console.error("❌ Socket Server MongoDB Error:", err));
} else {
  console.warn("⚠️ MONGO_URI not found in env for Socket Server");
}

// Minimal in-memory discussion debounce cache
const discussionDebounceTimers = new Map();

// Helper to save discussion to MongoDB debounced
async function saveDiscussionToDB(sessionId, content, lastEditedBy) {
  try {
    if (mongoose.connection.readyState !== 1) return;
    const ExamDiscussion =
      mongoose.models.ExamDiscussion ||
      mongoose.model(
        "ExamDiscussion",
        new mongoose.Schema(
          {
            sessionId: { type: String, required: true, unique: true, index: true },
            content: { type: String, default: "" },
            lastEditedBy: { type: String, default: null },
          },
          { timestamps: true }
        )
      );

    await ExamDiscussion.findOneAndUpdate(
      { sessionId },
      { content, lastEditedBy, updatedAt: new Date() },
      { upsert: true, new: true }
    );
  } catch (err) {
    console.error(`[DISCUSSION-SAVE] Error saving session ${sessionId}:`, err);
  }
}

// Socket Connection Handler
io.on("connection", (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // Register user personal notification room
  socket.on("user:register", ({ userId }) => {
    if (!userId) return;
    const userRoom = `user:${userId}`;
    socket.join(userRoom);
    socket.userId = userId;
    console.log(`👤 User ${userId} registered to ${userRoom}`);
  });

  // Partner invitation: User A invites User B to exam
  socket.on("exam:invite-partner", ({ sessionId, weekNumber, inviterId, inviterName, partnerId }) => {
    console.log(`📨 Invite from ${inviterName} (${inviterId}) to ${partnerId} for Session ${sessionId}`);
    io.to(`user:${partnerId}`).emit("exam:invitation-received", {
      sessionId,
      weekNumber,
      inviterId,
      inviterName: inviterName || "Your teammate",
      timestamp: Date.now(),
    });
  });

  // Join Exam Session Room
  socket.on("exam:join-room", ({ sessionId, userId, userName }) => {
    if (!sessionId) return;
    const sessionRoom = `session:${sessionId}`;
    socket.join(sessionRoom);
    socket.sessionId = sessionId;
    socket.userId = userId;
    socket.userName = userName || "Partner";

    console.log(`🎓 User ${userId} (${socket.userName}) joined exam room ${sessionRoom}`);

    // Notify others in room that partner is online / joined
    socket.to(sessionRoom).emit("exam:partner-status", {
      online: true,
      userId,
      userName: socket.userName,
    });

    // Check room size - if 2+ users connected, both partners are in the room!
    const numUsers = io.sockets.adapter.rooms.get(sessionRoom)?.size || 1;
    console.log(`👥 Session ${sessionRoom} now has ${numUsers} participant(s)`);
    if (numUsers >= 2) {
      // Notify both that partner is online
      io.to(sessionRoom).emit("exam:partner-status", {
        online: true,
        userId,
        userName: socket.userName,
      });
      // Activate session
      io.to(sessionRoom).emit("exam:session-active", {
        sessionId,
        status: "IN_PROGRESS",
      });
    }
  });

  // Leave Exam Session Room
  socket.on("exam:leave-room", ({ sessionId }) => {
    if (!sessionId) return;
    const sessionRoom = `session:${sessionId}`;
    socket.leave(sessionRoom);
    socket.to(sessionRoom).emit("exam:partner-status", {
      online: false,
      userId: socket.userId,
    });
  });

  // Live Exam Progress Update (Question Index & Answered Count)
  // NEVER reveals selected answers or choices
  socket.on("exam:progress-change", ({ sessionId, currentQuestion, answeredCount, totalQuestions }) => {
    if (!sessionId) return;
    const sessionRoom = `session:${sessionId}`;
    socket.to(sessionRoom).emit("exam:partner-progress", {
      currentQuestion: currentQuestion || 1,
      answeredCount: answeredCount || 0,
      totalQuestions: totalQuestions || 20,
      updatedAt: Date.now(),
    });
  });

  // Real-Time Shared Collaborative Discussion Updates
  socket.on("exam:discussion-change", ({ sessionId, content, userId, cursorPosition }) => {
    if (!sessionId) return;
    const sessionRoom = `session:${sessionId}`;

    // Broadcast instant update to partner in the room
    socket.to(sessionRoom).emit("exam:discussion-updated", {
      content,
      senderId: userId,
      cursorPosition: cursorPosition || null,
      updatedAt: Date.now(),
    });

    // Debounce persistence to MongoDB (1.5 seconds)
    if (discussionDebounceTimers.has(sessionId)) {
      clearTimeout(discussionDebounceTimers.get(sessionId));
    }

    const timer = setTimeout(() => {
      saveDiscussionToDB(sessionId, content, userId);
      discussionDebounceTimers.delete(sessionId);
    }, 1500);

    discussionDebounceTimers.set(sessionId, timer);
  });

  // Real-Time Shared Collaborative Discussion Messages (User A / User B tagged)
  socket.on("exam:discussion-message", async ({ sessionId, message }) => {
    if (!sessionId || !message) return;
    const sessionRoom = `session:${sessionId}`;
    console.log(`💬 [Discussion] ${message.senderLabel} (${message.userName}): ${message.text}`);

    // Broadcast instant update to all users in the room
    io.to(sessionRoom).emit("exam:discussion-message", message);

    // Save to MongoDB
    try {
      if (mongoose.connection.readyState === 1) {
        const ExamDiscussion =
          mongoose.models.ExamDiscussion ||
          mongoose.model("ExamDiscussion");
        await ExamDiscussion.findOneAndUpdate(
          { sessionId },
          {
            $push: { messages: message },
            lastEditedBy: message.senderId,
            updatedAt: new Date(),
          },
          { upsert: true, new: true }
        );
      }
    } catch (err) {
      console.error("[DISCUSSION-MESSAGE-SAVE] Error:", err.message);
    }
  });

  // Real-Time Typing Indicator for Shared Discussion
  socket.on("exam:typing", ({ sessionId, userId, userName, isTyping }) => {
    if (!sessionId) return;
    const sessionRoom = `session:${sessionId}`;
    socket.to(sessionRoom).emit("exam:partner-typing", {
      userId,
      userName: userName || "Your partner",
      isTyping: !!isTyping,
    });
  });

  // Exam Submission Notification
  socket.on("exam:submit-notify", ({ sessionId, userId, userName, score, percentage }) => {
    if (!sessionId) return;
    const sessionRoom = `session:${sessionId}`;
    console.log(`🏁 User ${userName} (${userId}) submitted exam in session ${sessionId}`);

    socket.to(sessionRoom).emit("exam:partner-submitted", {
      userId,
      userName: userName || "Your partner",
      submittedAt: Date.now(),
      score,
      percentage,
    });
  });

  // Handle Disconnect
  socket.on("disconnect", () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
    if (socket.sessionId) {
      const sessionRoom = `session:${socket.sessionId}`;
      socket.to(sessionRoom).emit("exam:partner-status", {
        online: false,
        userId: socket.userId,
        userName: socket.userName,
      });
    }
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "SkillLens Real-Time Socket Server",
    connections: io.engine.clientsCount,
    timestamp: new Date().toISOString(),
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 SkillLens Socket.IO Server running on port ${PORT}`);
  console.log(`🔗 Accepting connections from ${CLIENT_URL}`);
});
