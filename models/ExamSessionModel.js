import mongoose from "mongoose";

const examSessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    weekNumber: {
      type: Number,
      required: true,
      index: true,
    },
    user1Id: {
      type: String,
      required: true,
      index: true,
    },
    user2Id: {
      type: String,
      default: null,
      index: true,
    },
    mode: {
      type: String,
      enum: ["PAIRED", "SOLO"],
      default: "PAIRED",
    },
    status: {
      type: String,
      enum: [
        "WAITING_FOR_TEAMMATE",
        "BOTH_JOINED",
        "SOLO_AVAILABLE",
        "IN_PROGRESS",
        "USER1_SUBMITTED",
        "USER2_SUBMITTED",
        "COMPLETED",
        "EXPIRED",
        "MISSED",
      ],
      default: "WAITING_FOR_TEAMMATE",
      index: true,
    },
    joinDeadline: {
      type: Date,
      required: true,
    },
    startTime: {
      type: Date,
      default: null,
    },
    endTime: {
      type: Date,
      default: null,
    },
    user1JoinedAt: {
      type: Date,
      default: null,
    },
    user2JoinedAt: {
      type: Date,
      default: null,
    },
    user1SubmittedAt: {
      type: Date,
      default: null,
    },
    user2SubmittedAt: {
      type: Date,
      default: null,
    },
    // Selected questions (without answers) stored for consistency across reloads
    selectedQuestions: [
      {
        id: String,
        week: Number,
        topic: String,
        question: String,
        options: [String],
        explanation: String,
      },
    ],
    // Server-only answer key - never returned to client
    answerKey: {
      type: Map,
      of: String,
      default: {},
    },
    isDevBypassed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

examSessionSchema.index({ user1Id: 1, weekNumber: 1 });
examSessionSchema.index({ user2Id: 1, weekNumber: 1 });

const ExamSession =
  mongoose.models.ExamSession ||
  mongoose.model("ExamSession", examSessionSchema);

export default ExamSession;
