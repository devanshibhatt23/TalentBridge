const express = require('express');
const router = express.Router();
const {
  applyToJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
} = require('../controllers/applicationController');

// Import middleware
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// ============================================
// CANDIDATE ROUTES
// ============================================

// POST /api/applications
// Only logged-in candidates can apply for jobs
router.post('/', auth, roleCheck('candidate'), applyToJob);

// GET /api/applications/my-applications
// Logged-in candidates can view their applications
router.get('/my-applications', auth, roleCheck('candidate'), getMyApplications);


// ============================================
// RECRUITER ROUTES
// ============================================

// GET /api/applications/job/:jobId
// Recruiters can view all applications for a specific job they posted
router.get('/job/:jobId', auth, roleCheck('recruiter'), getJobApplications);

// PUT /api/applications/:id/status
// Recruiters can update the status of an application
router.put('/:id/status', auth, roleCheck('recruiter'), updateApplicationStatus);

module.exports = router;
