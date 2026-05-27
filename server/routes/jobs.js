// ============================================
// JOB ROUTES
// ============================================
// Routes for managing job postings.
// Demonstrates Role-Based Access Control (RBAC).
// ============================================

const express = require('express');
const router = express.Router();
const {
  createJob,
  getAllJobs,
  getJobById,
  getMyJobs,
  updateJob,
  deleteJob,
} = require('../controllers/jobController');

// Import middleware
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// ============================================
// PUBLIC ROUTES (No login required)
// ============================================

// GET /api/jobs
// Anyone (even not logged in) can search and view jobs
router.get('/', getAllJobs);

// GET /api/jobs/recruiter/my-jobs
// Must be registered BEFORE /:id so "recruiter" is not treated as an id
router.get('/recruiter/my-jobs', auth, roleCheck('recruiter'), getMyJobs);

// GET /api/jobs/:id
// Anyone can view a specific job's details
router.get('/:id', getJobById);


// ============================================
// PROTECTED ROUTES (Requires login)
// ============================================

// POST /api/jobs
// Only logged-in recruiters can post jobs
router.post('/', auth, roleCheck('recruiter'), createJob);

// PUT /api/jobs/:id
// Only logged-in recruiters can update jobs
router.put('/:id', auth, roleCheck('recruiter'), updateJob);

// DELETE /api/jobs/:id
// Only logged-in recruiters can delete jobs
router.delete('/:id', auth, roleCheck('recruiter'), deleteJob);

module.exports = router;
