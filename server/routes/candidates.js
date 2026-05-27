const express = require('express');
const router = express.Router();
const {
  searchCandidates,
  getCandidateById,
} = require('../controllers/candidateController');

// Import middleware
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// ============================================
// CANDIDATE ROUTES (For Recruiters)
// ============================================

// GET /api/candidates/search
// Only recruiters can search candidates
router.get('/search', auth, roleCheck('recruiter'), searchCandidates);

// GET /api/candidates/:id
// Only recruiters can view full candidate profiles
router.get('/:id', auth, roleCheck('recruiter'), getCandidateById);

module.exports = router;
