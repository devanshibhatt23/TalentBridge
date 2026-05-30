// ============================================
// AUTH ROUTES
// ============================================
// Routes define the URLs (endpoints) that the frontend can call.
// They connect a specific URL to a specific controller function.
// ============================================

const express = require('express');
const multer = require('multer');
const router = express.Router();
const { register, login, getMe, updateProfile, uploadAvatar } = require('../controllers/authController');
const auth = require('../middleware/auth');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only images are allowed.'));
    }
    cb(null, true);
  },
});

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

// PUT /api/auth/profile
// Route to update user profile
router.put('/profile', auth, updateProfile);

// PUT /api/auth/avatar
// Route to update user profile image
router.put('/avatar', auth, upload.single('avatar'), uploadAvatar);

module.exports = router;
