import { Server } from 'socket.io';

let io;
const userSockets = new Map(); // userId -> socketId

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    socket.on('register', (userId) => {
      if (userId) {
        userSockets.set(userId.toString(), socket.id);
      }
    });

    socket.on('disconnect', () => {
      for (const [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          userSockets.delete(userId);
          break;
        }
      }
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
