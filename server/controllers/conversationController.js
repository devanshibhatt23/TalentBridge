const mongoose = require('mongoose');
const { Conversation, MESSAGE_TYPES } = require('../models/Conversation');

function normalizeUser(u) {
  if (!u) return null;
  return {
    id: u._id,
    name: u.name,
    email: u.email,
    role: u.role,
    company: u.company,
  };
}

function toConversationListItem(conversation, meId) {
  const other =
    conversation.participants.find((p) => p._id.toString() !== meId.toString()) ||
    conversation.participants[0];

  const last = conversation.messages?.length
    ? conversation.messages[conversation.messages.length - 1]
    : null;

  return {
    id: conversation._id,
    otherUser: normalizeUser(other),
    lastMessage: last
      ? {
          id: last._id,
          senderId: last.sender?.toString?.() || last.sender,
          content: last.content,
          messageType: last.messageType,
          createdAt: last.createdAt,
        }
      : null,
    lastMessageAt: conversation.lastMessageAt,
    updatedAt: conversation.updatedAt,
  };
}

// GET /api/conversations
const listConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .populate('participants', 'name email role company')
      .sort({ lastMessageAt: -1, updatedAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        conversations: conversations.map((c) => toConversationListItem(c, req.user._id)),
      },
    });
  } catch (error) {
    console.error('List conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching conversations.',
      error: error.message,
    });
  }
};

// POST /api/conversations
// Body: { participantId }
const getOrCreateConversation = async (req, res) => {
  try {
    const { participantId } = req.body;
    if (!participantId || !mongoose.Types.ObjectId.isValid(participantId)) {
      return res.status(400).json({
        success: false,
        message: 'participantId is required.',
      });
    }

    const meId = req.user._id.toString();
    if (participantId.toString() === meId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot create a conversation with yourself.',
      });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, participantId] },
      $expr: { $eq: [{ $size: '$participants' }, 2] },
    }).populate('participants', 'name email role company');

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, participantId],
        messages: [],
        lastMessageAt: new Date(),
      });
      conversation = await Conversation.findById(conversation._id).populate(
        'participants',
        'name email role company',
      );
    }

    res.status(200).json({
      success: true,
      data: { conversation: toConversationListItem(conversation, req.user._id) },
    });
  } catch (error) {
    console.error('Get/create conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating conversation.',
      error: error.message,
    });
  }
};

// GET /api/conversations/:id/messages
const getMessages = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid conversation id.',
      });
    }

    const conversation = await Conversation.findById(id)
      .select('participants messages lastMessageAt updatedAt')
      .populate('participants', 'name email role company')
      .populate('messages.sender', 'name email role company');

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    const isParticipant = conversation.participants.some(
      (p) => p._id.toString() === req.user._id.toString(),
    );
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this conversation.',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        conversation: {
          id: conversation._id,
          participants: conversation.participants.map(normalizeUser),
          lastMessageAt: conversation.lastMessageAt,
        },
        messages: conversation.messages.map((m) => ({
          id: m._id,
          sender: normalizeUser(m.sender),
          content: m.content,
          messageType: m.messageType,
          createdAt: m.createdAt,
        })),
        allowedMessageTypes: MESSAGE_TYPES,
      },
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching messages.',
      error: error.message,
    });
  }
};

module.exports = {
  listConversations,
  getOrCreateConversation,
  getMessages,
};

