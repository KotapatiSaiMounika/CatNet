import { Server } from 'socket.io';

let io;

// Map of userId → socketId for tracking online users
const onlineUsers = new Map();

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin:      process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Frontend emits 'register' with userId right after connecting
    socket.on('register', (userId) => {
      if (!userId) return;

      // Join a private room named after the userId
      socket.join(userId);
      onlineUsers.set(userId, socket.id);
      console.log(`👤 User ${userId} joined their room`);
    });

    socket.on('disconnect', () => {
      // Clean up onlineUsers map
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          console.log(`👋 User ${userId} disconnected`);
          break;
        }
      }
    });
  });

  return io;
};

// Used by notification service to emit to a specific user's room
export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

export const isUserOnline = (userId) => onlineUsers.has(userId.toString());