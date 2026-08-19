import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  // Identity
  clerkUserId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  username: String,
  email: String,
  firstName: String,
  lastName: String,
  profile: {
    avatarUrl: String,
    bio: String
  },

  // Roles (application-level only, NOT for authorization)
  role: {
    student: { type: Boolean, default: true, index: true },
    hod: { type: Boolean, default: false, index: true },
    director: { type: Boolean, default: false, index: true }
  },

  // College/Organization
  college: {
    organizationId: { type: String, index: true },
    departmentId: { type: String, index: true },
    year: Number,
    branch: String,
    rollNumber: String
  },

  // Skills array
  skills: [{
    name: String,
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced']
    },
    score: {
      type: Number,
      min: 0,
      max: 100
    }
  }],

  // GitHub integration
  github: {
    username: String,
    profileUrl: String,
    summary: Object, // Compact profile summary
    stats: {
      commits: Number,
      pullRequests: Number,
      reviews: Number,
      issues: Number,
      lastSyncedAt: Date
    }
  },

  // Current roadmap state (NOT static content)
  roadmap: {
    role: String, // Current roadmap role/path
    currentWeek: Number,
    currentStage: String,
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    lastActivityAt: Date
  },

  // Assessment aggregate summary (NOT individual attempts)
  assessmentSummary: {
    totalAttempts: { type: Number, default: 0 },
    totalCompleted: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0, min: 0, max: 100 },
    latestScore: Number,
    bestScore: Number,
    lastAttemptAt: Date
  },

  // Team and project references (IDs only)
  currentTeamId: { type: String, index: true },
  currentTeamRole: String,
  currentProjectId: { type: String, index: true },

  // Engineering readiness metrics
  engineeringSummary: {
    readinessScore: {
      type: Number,
      min: 0,
      max: 100
    },
    latestProjectScore: Number,
    lastEvaluatedAt: Date
  },

  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active',
    index: true
  },

  // Roadmap Onboarding
  onboarding: {
    completed: { type: Boolean, default: false },
    learningMode: { 
      type: String, 
      enum: ['solo', 'pair', 'exchange', null],
      default: null 
    },
    selectedRole: { type: String, default: null },
    completedAt: { type: Date, default: null }
  },

  // Matchmaking system for pair/exchange modes
  matching: {
    status: {
      type: String,
      enum: ['none', 'waiting', 'matched'],
      default: 'none',
      index: true
    },
    teammateId: {
      type: String,
      default: null,
      index: true
    },
    queuedAt: {
      type: Date,
      default: null
    },
    matchedAt: {
      type: Date,
      default: null
    }
  }
}, {
  timestamps: true // Automatically manages createdAt and updatedAt
});

// Compound index for HOD queries
userSchema.index({
  'college.organizationId': 1,
  'college.departmentId': 1,
  'role.student': 1
});

// Compound index for matchmaking queries
userSchema.index({
  'matching.status': 1,
  'onboarding.learningMode': 1,
  'onboarding.selectedRole': 1
});

// Index for organization-based matching
userSchema.index({
  'matching.status': 1,
  'college.organizationId': 1
});

// Prevent duplicate model registration
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;