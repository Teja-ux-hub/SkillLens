import mongoose from "mongoose";

const weeklyHistorySchema = new mongoose.Schema(
  {
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
    sessionId: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      required: true,
      default: 0,
    },
    percentage: {
      type: Number,
      required: true,
      default: 0,
    },
    completionStatus: {
      type: String,
      enum: ["PASSED", "FAILED", "MISSED"],
      default: "FAILED",
    },
    mode: {
      type: String,
      enum: ["PAIRED", "SOLO"],
      default: "PAIRED",
    },
    partnerId: {
      type: String,
      default: null,
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

weeklyHistorySchema.index({ userId: 1, weekNumber: 1 });

const WeeklyHistory =
  mongoose.models.WeeklyHistory ||
  mongoose.model("WeeklyHistory", weeklyHistorySchema);

export default WeeklyHistory;
