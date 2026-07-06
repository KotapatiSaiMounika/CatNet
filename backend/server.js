import dotenv from 'dotenv';
dotenv.config();

import dns from 'dns';
// On some networks (broken/blocked IPv6 routing — common on certain campus
// and home networks), Node tries IPv6 addresses first and hangs on every
// attempt before ever falling back to IPv4, causing intermittent
// ETIMEDOUT errors on outbound requests (e.g. to Cloudinary). Preferring
// IPv4 first avoids that dead-end entirely.
dns.setDefaultResultOrder('ipv4first');

import http from 'http';
import app from './app.js';
import connectDB from './config/db.js';
import { initSocket } from './socket/socket.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  // Create HTTP server manually so Socket.io can share it
  const httpServer = http.createServer(app);

  // Attach Socket.io
  initSocket(httpServer);

  httpServer.listen(PORT, () => {
    console.log(`CatNet backend running at http://localhost:${PORT}`);
    console.log(`Socket.io ready`);
    console.log(`   Environment: ${process.env.NODE_ENV}`);
  });
};

startServer();