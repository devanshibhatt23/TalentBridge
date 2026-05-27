// ============================================
// USER MODEL (Database Schema)
// ============================================
// This defines the STRUCTURE of a User in our database.
//
// Think of a "schema" like a form template:
// - It says what fields exist (name, email, password, role...)
// - What type each field is (String, Number, Date...)
// - Which fields are required vs optional
// - Any validation rules (email must be unique, etc.)
//
// WHAT HAPPENS WITH PASSWORDS:
// We NEVER store the actual password. Before saving, we "hash" it:
// "myPassword123" → "$2a$10$X7jK..." (scrambled, can't be reversed)
// When someone logs in, we hash their input and compare the hashes.
// ============================================

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // --- Basic Info ---
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true, // removes extra spaces: "  John  " → "John"
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true, // no two users can have the same email
      lowercase: true, // "John@Gmail.COM" → "john@gmail.com"
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },

    phone: {
      type: String,
      trim: true,
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // IMPORTANT: password won't be returned in queries by default
    },

    // --- Role-Based Access Control (RBAC) ---
    // This is what your diagram calls "Role Based Access Control (RBAC)"
    // A user is either a "recruiter" or a "candidate"
    role: {
      type: String,
      enum: ['recruiter', 'candidate'], // only these two values are allowed
      required: [true, 'Role is required'],
    },

    // --- Recruiter-specific fields ---
    company: {
      type: String,
      trim: true,
      // Only required if role is 'recruiter' — we'll validate this in the controller
    },

    // --- Candidate-specific fields (profile) ---
    profile: {
      headline: { type: String, trim: true }, // e.g., "Software Engineer Intern"
      skills: [{ type: String }], // e.g., ["Python", "Node.js", "React"]
      experience: { type: String, trim: true }, // e.g., "2 years backend development"
      education: { type: String, trim: true }, // e.g., "B.Tech CSE from IIT Delhi"
      location: { type: String, trim: true }, // e.g., "Bangalore, India"
      resumeUrl: { type: String }, // path to uploaded resume file
      bio: { type: String, trim: true }, // short description about the candidate
    },
  },
  {
    // --- Schema Options ---
    // timestamps: true automatically adds "createdAt" and "updatedAt" fields
    // So we know when each user was created and last modified
    timestamps: true,
  }
);

// ============================================
// PRE-SAVE HOOK — Runs BEFORE saving to database
// ============================================
// This is like a "before save" trigger.
// Every time we save a user, this function runs first.
// If the password was changed, we hash it.
//
// YOUR DIAGRAM: "password → salt (random word jo add hoga), hashing"
// That's exactly what bcrypt.genSalt() and bcrypt.hash() do!
// ============================================
userSchema.pre('save', async function () {
  // Only hash the password if it was modified (or is new)
  // If we're just updating the user's name, we skip this
  if (!this.isModified('password')) {
    return;
  }

  // Generate a "salt" — a random string added to the password before hashing
  // The number 10 is the "cost factor" — higher = more secure but slower
  const salt = await bcrypt.genSalt(10);

  // Hash the password with the salt
  // "myPassword123" + salt → "$2a$10$X7jK..." (irreversible)
  this.password = await bcrypt.hash(this.password, salt);
});

// ============================================
// INSTANCE METHOD — comparePassword
// ============================================
// This is a custom function we add to every User object.
// It compares a plain-text password with the stored hash.
//
// YOUR DIAGRAM: "Table pe search karo with unique email,
//                check the hashed pw with stored pw"
// ============================================
userSchema.methods.comparePassword = async function (candidatePassword) {
  // bcrypt.compare() hashes the input and compares with stored hash
  // Returns true if they match, false otherwise
  return await bcrypt.compare(candidatePassword, this.password);
};

// Create the model from the schema
// "User" will create a "users" collection in MongoDB
const User = mongoose.model('User', userSchema);

module.exports = User;
