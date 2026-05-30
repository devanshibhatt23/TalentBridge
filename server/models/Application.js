// ============================================
// APPLICATION MODEL (Database Schema)
// ============================================
// This tracks when a Candidate applies to a Job.
//
// KEY FEATURE: THE AUDIT TRAIL
// Every time the status changes (Applied → Screening → Interviewing → Offered),
// we log it in the statusHistory array. This prevents "The Concurrency Collision"
// (two recruiters changing status at the same time).
//
// We use a "version" field (__v in Mongoose) for optimistic concurrency control:
// Before updating, we check if someone else already modified the document.
// ============================================

const mongoose = require('mongoose');

// All possible statuses an application can have
const APPLICATION_STATUSES = [
  'applied',       // Candidate just applied
  'screening',     // Recruiter is reviewing the application
  'interviewing',  // Candidate is in the interview process
  'offered',       // Offer has been extended
  'hired',         // Candidate accepted the offer
  'rejected',      // Application was rejected
  'withdrawn',     // Candidate withdrew their application
];

const applicationSchema = new mongoose.Schema(
  {
    // Which job this application is for
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job', // references the Job model
      required: true,
    },

    // Which candidate applied
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // references the User model
      required: true,
    },

    // Current status of the application
    status: {
      type: String,
      enum: APPLICATION_STATUSES,
      default: 'applied',
    },

    // AI generated match score (0-100)
    matchScore: {
      type: Number,
      min: 0,
      max: 100,
    },

    // ============================================
    // THE AUDIT TRAIL
    // ============================================
    // Every status change is recorded here.
    // Example:
    // [
    //   { status: 'applied', changedAt: '2026-05-26', changedBy: 'candidateId', note: 'Applied to position' },
    //   { status: 'screening', changedAt: '2026-05-27', changedBy: 'recruiterId', note: 'Reviewing resume' },
    //   { status: 'interviewing', changedAt: '2026-05-28', changedBy: 'recruiterId', note: 'Scheduled for round 1' },
    // ]
    // This creates a complete HISTORY — you can always see who changed what and when.
    // ============================================
    statusHistory: [
      {
        status: {
          type: String,
          enum: APPLICATION_STATUSES,
          required: true,
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        note: {
          type: String, // optional note like "Great performance in round 1"
          trim: true,
        },
      },
    ],

    // Cover letter or additional message from the candidate
    coverLetter: {
      type: String,
      trim: true,
    },

    // Resume upload stored as PDF data in MongoDB
    resume: {
      filename: { type: String, trim: true },
      contentType: { type: String },
      size: { type: Number },
      data: { type: Buffer },
      uploadedAt: { type: Date, default: Date.now },
    },
  },
  {
    timestamps: true,
    // Enable optimistic concurrency control using the __v (version) field
    // This prevents "The Concurrency Collision"
    optimisticConcurrency: true,
  }
);

// ============================================
// COMPOUND INDEX — prevents duplicate applications
// ============================================
// A candidate can only apply to the same job ONCE.
// This tells MongoDB: "The combination of (job + candidate) must be unique"
// ============================================
applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;
