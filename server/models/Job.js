// ============================================
// JOB MODEL (Database Schema)
// ============================================
// This defines what a Job posting looks like in our database.
//
// BASED ON YOUR EXCALIDRAW "JOB TABLE":
// recruiter_name, company, recruiter_email, job_title, location,
// job_type, salary, job_description, min_requirements, additional_details
//
// We store the recruiter as a "reference" (ObjectId) to the User model
// instead of duplicating their name/email/company. This way, if a
// recruiter updates their name, all their jobs reflect the change.
//
// YOUR DIAGRAM: POST /post-job → incoming req → create unique job id (UUID),
//               job post timestamp → Store job details in Job Table/Collection
// MongoDB automatically creates a unique _id for each document,
// so we don't need UUID — but we'll add one anyway since your diagram shows it.
// ============================================

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const jobSchema = new mongoose.Schema(
  {
    // Unique job ID (your diagram mentions UUID)
    jobId: {
      type: String,
      default: uuidv4, // auto-generates a unique ID like "550e8400-e29b-41d4-a716-446655440000"
      unique: true,
    },

    // --- WHO posted this job ---
    // "ref: 'User'" means this field stores the _id of a User document
    // This is called a "reference" or "foreign key" in SQL terms
    // We can later use .populate() to get the full user details
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // --- Job Details (matching your Excalidraw Job Table columns) ---

    // "job_title" in your diagram
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },

    // "company" — we also get this from the recruiter's profile,
    // but storing it here too for quick access
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },

    // "job_description" in your diagram
    description: {
      type: String,
      required: [true, 'Job description is required'],
    },

    // "min_requirements" in your diagram
    requirements: {
      type: String,
      required: [true, 'Minimum requirements are required'],
    },

    // "location" in your diagram — e.g., "Bangalore, India (Hybrid)"
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },

    // "job_type" in your diagram — Internship, Full-time, Part-time, Contract
    jobType: {
      type: String,
      enum: ['full-time', 'part-time', 'internship', 'contract', 'remote'],
      required: [true, 'Job type is required'],
    },

    // "salary" in your diagram — e.g., "₹50,000/month" or "₹22-28 LPA"
    salary: {
      type: String,
      trim: true,
    },

    // "additional_details" in your diagram
    // e.g., "Deadline: June 15; 3 interview rounds; Relocation support"
    additionalDetails: {
      type: String,
      trim: true,
    },

    // Skills required — stored as an array for easy filtering
    // e.g., ["Python", "Node.js", "React", "DSA"]
    skills: [
      {
        type: String,
        trim: true,
      },
    ],

    // --- Job Status ---
    // "open" = accepting applications, "closed" = no longer accepting
    // Your diagram mentions "expires_in: 30" — we use a deadline date instead
    status: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open',
    },

    // When the job posting expires
    // Your diagram: "expires_in: 30" (30 days)
    deadline: {
      type: Date,
    },

    // Number of positions available
    openings: {
      type: Number,
      default: 1,
    },
  },
  {
    // timestamps adds createdAt (your "job post timestamp") and updatedAt
    timestamps: true,
  }
);

// ============================================
// TEXT INDEX — enables keyword searching
// ============================================
// This tells MongoDB: "make these fields searchable by keywords"
// When a candidate searches "backend engineer python", MongoDB will
// search through title, description, requirements, skills, and company
//
// YOUR DIAGRAM: Candidate POV → keyword → Backend/Search DB Query
// ============================================
jobSchema.index({
  title: 'text',
  description: 'text',
  requirements: 'text',
  company: 'text',
  skills: 'text',
});

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
