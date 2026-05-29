const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const { searchUsers } = require('../controllers/userController');

// GET /api/users/search
router.get('/search', auth, searchUsers);

module.exports = router;
