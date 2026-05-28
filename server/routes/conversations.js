const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const {
  listConversations,
  getOrCreateConversation,
  getMessages,
} = require('../controllers/conversationController');

// GET /api/conversations
router.get('/', auth, listConversations);

// POST /api/conversations
router.post('/', auth, getOrCreateConversation);

// GET /api/conversations/:id/messages
router.get('/:id/messages', auth, getMessages);

module.exports = router;

