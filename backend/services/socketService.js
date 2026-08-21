import { Server } from 'socket.io';

let io;
const userSockets = new Map(); // userId -> socketId

export const initSocket = (server) => {
  const allowedOrigins = (process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:5173,http://localhost:3050')
    .split(',').map((origin) => origin.trim().replace(/\/+$/, '')).filter(Boolean);

  const wildcardToRegex = (pattern) => {
    const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`^${escaped.replace(/\\\*/g, '.*')}$`);
  };

  const exactOrigins = new Set();
  const wildcardOrigins = [];

  allowedOrigins.forEach((allowedOrigin) => {
    if (allowedOrigin.includes('*')) {
      wildcardOrigins.push(wildcardToRegex(allowedOrigin));
    } else {
      exactOrigins.add(allowedOrigin);
    }
  });

  const isLocalDevOrigin = (origin) => /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);

  const isAllowedOrigin = (origin) => {
    const normalizedOrigin = origin.trim().replace(/\/+$/, '');
    if (exactOrigins.has(normalizedOrigin)) return true;
    if (isLocalDevOrigin(normalizedOrigin)) return true;
    return wildcardOrigins.some((pattern) => pattern.test(normalizedOrigin));
  };

  io = new Server(server, {
    cors: {
      origin: (origin, callback) => (!origin || isAllowedOrigin(origin)
        ? callback(null, true)
        : callback(new Error('Origin is not allowed by CORS'))),
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    socket.on('register', (userId) => {
      if (userId) {
        userSockets.set(userId.toString(), socket.id);
      }
    });

    // WebRTC Signaling Events
    socket.on('join-room', ({ roomId, userId, userName }) => {
      socket.join(roomId);
      // Broadcast to other users in the room
      socket.to(roomId).emit('user-joined', { socketId: socket.id, userId, userName });
    });

    socket.on('chat-message', ({ roomId, message }) => {
      socket.to(roomId).emit('chat-message', message);
    });

    socket.on('offer', ({ targetSocketId, offer }) => {
      io.to(targetSocketId).emit('offer', { senderSocketId: socket.id, offer });
    });

    socket.on('answer', ({ targetSocketId, answer }) => {
      io.to(targetSocketId).emit('answer', { senderSocketId: socket.id, answer });
    });

    socket.on('ice-candidate', ({ targetSocketId, candidate }) => {
      io.to(targetSocketId).emit('ice-candidate', { senderSocketId: socket.id, candidate });
    });

    socket.on('leave-room', ({ roomId }) => {
      socket.leave(roomId);
      socket.to(roomId).emit('user-left', { socketId: socket.id });
    });

    socket.on('disconnect', () => {
      for (const [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          userSockets.delete(userId);
          break;
        }
      }
      // Notify all rooms the socket was in
      io.emit('user-left', { socketId: socket.id });
    });
  });

  return io;
};

export const getIO = () => io;

export const sendRealTimeNotification = (userId, notification) => {
  if (!io || !userId) return;
  const socketId = userSockets.get(userId.toString());
  if (socketId) {
    io.to(socketId).emit('notification', notification);
  }
};

export const sendRealTimeChatMessage = (receiverId, senderId, messageObj) => {
  if (!io || !receiverId) return;
  const socketId = userSockets.get(receiverId.toString());
  if (socketId) {
    io.to(socketId).emit('chat-message-receive', { senderId, messageObj });
  }
};

export const broadcastGroupMessage = (senderId, messageObj) => {
  if (!io) return;
  io.emit('group-message-receive', { senderId, messageObj });
};
