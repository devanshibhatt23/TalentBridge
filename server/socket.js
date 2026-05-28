const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const { Conversation, MESSAGE_TYPES } = require('./models/Conversation');
const User = require('./models/User');

let ioInstance = null;

function userRoom(userId) {
  return `user:${userId}`;
}

function conversationRoom(conversationId) {
  return `conversation:${conversationId}`;
}

async function authFromSocket(socket) {
  const token = socket.handshake.auth?.token;
  if (!token) throw new Error('Missing token');

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.userId);
  if (!user) throw new Error('User not found');
  return user;
}

function initSocket(httpServer, { corsOrigin } = {}) {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: corsOrigin || true,
      credentials: true,
    },
  });

  ioInstance.use(async (socket, next) => {
    try {
      const user = await authFromSocket(socket);
      socket.user = user;
      next();
    } catch (err) {
      next(err);
    }
  });

  ioInstance.on('connection', (socket) => {
    const meId = socket.user._id.toString();

    socket.join(userRoom(meId));

    socket.on('conversation:join', async ({ conversationId }) => {
      if (!conversationId) return;

      const convo = await Conversation.findById(conversationId).select('participants');
      if (!convo) return;

      const isParticipant = convo.participants.some((p) => p.toString() === meId);
      if (!isParticipant) return;

      socket.join(conversationRoom(conversationId));
    });

    socket.on('conversation:leave', ({ conversationId }) => {
      if (!conversationId) return;
      socket.leave(conversationRoom(conversationId));
    });

    socket.on('message:send', async (payload, ack) => {
      try {
        const { conversationId, content, messageType } = payload || {};
        if (!conversationId || !content?.trim()) {
          if (ack) ack({ ok: false, error: 'conversationId and content are required.' });
          return;
        }

        const type = MESSAGE_TYPES.includes(messageType) ? messageType : 'text';

        const convo = await Conversation.findById(conversationId).select('participants messages');
        if (!convo) {
          if (ack) ack({ ok: false, error: 'Conversation not found.' });
          return;
        }

        const isParticipant = convo.participants.some((p) => p.toString() === meId);
        if (!isParticipant) {
          if (ack) ack({ ok: false, error: 'Not a participant.' });
          return;
        }

        const msg = {
          sender: socket.user._id,
          content: content.trim(),
          messageType: type,
        };

        convo.messages.push(msg);
        convo.lastMessageAt = new Date();
        await convo.save();

        const saved = convo.messages[convo.messages.length - 1];
        const messageDto = {
          id: saved._id,
          conversationId: convo._id,
          sender: {
            id: socket.user._id,
            name: socket.user.name,
            email: socket.user.email,
            role: socket.user.role,
            company: socket.user.company,
          },
          content: saved.content,
          messageType: saved.messageType,
          createdAt: saved.createdAt,
        };

        ioInstance.to(conversationRoom(conversationId)).emit('message:new', messageDto);
        convo.participants.forEach((p) => {
          ioInstance.to(userRoom(p.toString())).emit('conversation:updated', {
            conversationId: convo._id,
            lastMessage: {
              id: messageDto.id,
              senderId: messageDto.sender.id,
              content: messageDto.content,
              messageType: messageDto.messageType,
              createdAt: messageDto.createdAt,
            },
            lastMessageAt: convo.lastMessageAt,
          });
        });

        if (ack) ack({ ok: true, message: messageDto });
      } catch (err) {
        console.error('message:send error', err);
        if (ack) ack({ ok: false, error: 'Failed to send message.' });
      }
    });
  });

  return ioInstance;
}

function getIO() {
  if (!ioInstance) throw new Error('Socket.io not initialized');
  return ioInstance;
}

module.exports = { initSocket, getIO, userRoom, conversationRoom };

