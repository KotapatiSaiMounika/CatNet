import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Dynamic import so the socket.io-client bundle is only loaded when needed.
// The package must be installed: npm install socket.io-client
let socketImport: Promise<typeof import('socket.io-client')> | null = null;
function getSocketClient() {
  if (!socketImport) {
    socketImport = import('socket.io-client');
  }
  return socketImport;
}

export function useSocket(
  onNotification?: (notification: unknown) => void
) {
  const { user } = useAuth();
  const socketRef = useRef<import('socket.io-client').Socket | null>(null);

  useEffect(() => {
    if (!user?._id) return;

    let mounted = true;

    getSocketClient().then(({ io }) => {
      if (!mounted) return;

      const socket = io(SOCKET_URL, {
        withCredentials: true,
        transports: ['websocket', 'polling'],
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        // Register this socket to the user's room so the server can
        // target real-time events (notifications) to this user.
        socket.emit('register', user._id);
      });

      if (onNotification) {
        socket.on('notification', onNotification);
      }

      socket.on('connect_error', (err) => {
        console.warn('[Socket] connection error:', err.message);
      });
    });

    return () => {
      mounted = false;
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  return socketRef;
}