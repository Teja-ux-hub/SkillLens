import mongoose from "mongoose";

/**
 * MatchQueue Schema - Separate collection for waiting users
 * Makes matching fast and simple
 */
const matchQueueSchema = new mongoose.Schema({
  // User identification
  userId: {
    type: String,
    required: true,
    unique: true,  // One user can only be in queue once
    index: true
  },

  // Matching preferences
  learningMode: {
    type: String,
    enum: ['pair', 'exchange'],
    required: true,
    index: true
  },

  selectedRole: {
    type: String,
    required: true,
    index: true
  },

  // Organization for filtering
  organizationId: {
    type: String,
    default: null,
    index: true
  },

  // User info for quick display (cached)
  name: String,
  email: String,

  // Timestamps
  queuedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Compound index for fast matching queries
matchQueueSchema.index({ learningMode: 1, selectedRole: 1 });
matchQueueSchema.index({ learningMode: 1, organizationId: 1 });

// Prevent duplicate model registration
const MatchQueue = mongoose.models.MatchQueue || mongoose.model("MatchQueue", matchQueueSchema);

export default MatchQueue;
