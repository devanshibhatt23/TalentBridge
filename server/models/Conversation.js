const mongoose = require('mongoose');

const MESSAGE_TYPES = ['text', 'oa_link', 'interview_link'];

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      trim: true,
      required: true,
    },
    messageType: {
      type: String,
      enum: MESSAGE_TYPES,
      default: 'text',
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    messages: [messageSchema],
    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true },
);

conversationSchema.index({ participants: 1 });

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = { Conversation, MESSAGE_TYPES };

