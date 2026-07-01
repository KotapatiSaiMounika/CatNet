import { io, type Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? "http://localhost:5000";

let socket: Socket | null = null;

/**
 * Lazily creates (or returns) the singleton socket connection.
 * Call connectSocket(userId) after a successful login/me fetch,
 * and disconnectSocket() on logout.
 */
export function connectSocket(userId: string): Socket {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    withCredentials: true,
    autoConnect: true,
  });

  socket.on("connect", () => {
    socket?.emit("register", userId);
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