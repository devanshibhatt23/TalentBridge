// ============================================
// AUTH ROUTES
// ============================================
// Routes define the URLs (endpoints) that the frontend can call.
// They connect a specific URL to a specific controller function.
// ============================================

const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const auth = require('../middleware/auth');

// POST /api/auth/register
// Route for user registration
router.post('/register', register);

// POST /api/auth/login
// Route for user login
router.post('/login', login);

// GET /api/auth/me
// Route to get the currently logged-in user's profile
// Notice we pass the 'auth' middleware BEFORE 'getMe'
// This ensures only logged-in users can access this route
router.get('/me', auth, getMe);

module.exports = router;
