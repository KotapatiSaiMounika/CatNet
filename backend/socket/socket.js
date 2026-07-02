import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import User from '../models/User.js';

let io;

// Map of userId → socketId for tracking online users
const onlineUsers = new Map();

// Socket.io auth middleware — verifies the same httpOnly JWT cookie used
// by the REST API. A client can no longer join an arbitrary user's room
// by just emitting a chosen userId; the room is derived from a verified token.
const socketAuth = async (socket, next) => {
  try {
    const rawCookie = socket.handshake.headers.cookie;
    if (!rawCookie) return next(new Error('Not authenticated.'));

    const parsed = cookie.parse(rawCookie);
    const token = parsed.token;
    if (!token) return next(new Error('Not authenticated.'));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('_id');
    if (!user) return next(new Error('User no longer exists.'));

    socket.userId = user._id.toString();
    next();
  } catch {
    next(new Error('Authentication failed.'));
  }
};

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin:      process.env.CLIENT_URL || 'http://localhost:8080',
      credentials: true,
    },
  });

  io.use(socketAuth);

  io.on('connection', (socket) => {
    // socket.userId comes from the verified JWT, never from client input.
    const userId = socket.userId;
    console.log(`🔌 Socket connected: ${socket.id} (user ${userId})`);

    socket.join(userId);
    onlineUsers.set(userId, socket.id);

    socket.on('disconnect', () => {
      if (onlineUsers.get(userId) === socket.id) {
        onlineUsers.delete(userId);
        console.log(`👋 User ${userId} disconnected`);
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