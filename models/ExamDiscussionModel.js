import mongoose from "mongoose";

const examDiscussionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    content: {
      type: String,
      default: "",
    },
    messages: [
      {
        id: { type: String, default: "" },
        senderId: { type: String, default: "" },
        senderLabel: { type: String, default: "User A" }, // "User A" or "User B"
        userName: { type: String, default: "" },
        text: { type: String, default: "" },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    lastEditedBy: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const ExamDiscussion =
  mongoose.models.ExamDiscussion ||
  mongoose.model("ExamDiscussion", examDiscussionSchema);

export default ExamDiscussion;
