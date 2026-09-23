import mongoose from "mongoose";

const examAttemptSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    weekNumber: {
      type: Number,
      required: true,
      index: true,
    },
    mode: {
      type: String,
      enum: ["PAIRED", "SOLO"],
      default: "PAIRED",
    },
    answers: {
      type: Map,
      of: String,
      default: {},
    },
    score: {
      type: Number,
      required: true,
      default: 0,
    },
    totalQuestions: {
      type: Number,
      required: true,
      default: 20,
    },
    percentage: {
      type: Number,
      required: true,
      default: 0,
    },
    correct: {
      type: Number,
      required: true,
      default: 0,
    },
    wrong: {
      type: Number,
      required: true,
      default: 0,
    },
    passed: {
      type: Boolean,
      default: false,
    },
    completionTimeSeconds: {
      type: Number,
      default: 0,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

examAttemptSchema.index({ userId: 1, weekNumber: 1 });
examAttemptSchema.index({ sessionId: 1, userId: 1 }, { unique: true });

const ExamAttempt =
  mongoose.models.ExamAttempt ||
  mongoose.model("ExamAttempt", examAttemptSchema);

export default ExamAttempt;
