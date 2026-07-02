import { io, type Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? "http://localhost:5000";

let socket: Socket | null = null;

/**
 * Lazily creates (or returns) the singleton socket connection.
 * Call connectSocket() after a successful login/me fetch,
 * and disconnectSocket() on logout.
 */
export function connectSocket(): Socket {
  if (socket?.connected) return socket;

  // The server authenticates the connection using the httpOnly JWT cookie
  // and joins the caller to their own notification room automatically —
  // no userId is sent from the client.
  socket = io(SOCKET_URL, {
    withCredentials: true,
    autoConnect: true,
  });

  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}

export function getSocket(): Socket | null {
  return socket;
}