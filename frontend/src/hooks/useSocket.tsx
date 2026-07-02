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

      // The server authenticates the connection via the httpOnly JWT
      // cookie and joins this socket to the user's own room automatically.

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