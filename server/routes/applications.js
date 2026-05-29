const express = require('express');
const multer = require('multer');
const router = express.Router();
const {
  applyToJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  downloadResume,
} = require('../controllers/applicationController');

// Import middleware
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF resumes are allowed.'));
    }
    cb(null, true);
  },
});

// ============================================
// CANDIDATE ROUTES
// ============================================

// POST /api/applications
// Only logged-in candidates can apply for jobs
router.post('/', auth, roleCheck('candidate'), upload.single('resume'), applyToJob);

// GET /api/applications/my-applications
// Logged-in candidates can view their applications
router.get('/my-applications', auth, roleCheck('candidate'), getMyApplications);

// GET /api/applications/:id/resume
// Authenticated recruiter or candidate can download the resume
router.get('/:id/resume', auth, downloadResume);


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
