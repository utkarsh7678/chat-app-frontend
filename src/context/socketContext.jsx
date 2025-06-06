import { createContext, useContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import useStore from '../store/useStore';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const socketRef = useRef();
  const { user, token, addMessage, addOnlineUser, removeOnlineUser } = useStore();

  useEffect(() => {
    if (!user || !token) return;

    const socket = io(process.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      auth: {
        token
      }
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    // Message events
    socket.on('message', (message) => {
      addMessage(message);
    });

    socket.on('messageDeleted', (messageId) => {
      // Update message in store
    });

    socket.on('messageEdited', (message) => {
      // Update message in store
    });

    // User events
    socket.on('userOnline', (userId) => {
      addOnlineUser(userId);
    });

    socket.on('userOffline', (userId) => {
      removeOnlineUser(userId);
    });

    socket.on('typing', ({ userId, isTyping }) => {
      // Update typing status in store
    });

    // Group events
    socket.on('groupMessage', (message) => {
      addMessage(message);
    });

    socket.on('groupUserJoined', ({ groupId, user }) => {
      // Update group members in store
    });

    socket.on('groupUserLeft', ({ groupId, userId }) => {
      // Update group members in store
    });

    socket.on('groupUserRoleUpdated', ({ groupId, userId, role }) => {
      // Update group member role in store
    });

    // Cleanup
    return () => {
      socket.disconnect();
    };
  }, [user, token]);

  const sendMessage = (message) => {
    if (!socketRef.current) return;
    socketRef.current.emit('message', message);
  };

  const sendTypingStatus = ({ recipientId, isTyping }) => {
    if (!socketRef.current) return;
    socketRef.current.emit('typing', { recipientId, isTyping });
  };

  const joinGroup = (groupId) => {
    if (!socketRef.current) return;
    socketRef.current.emit('joinGroup', groupId);
  };

  const leaveGroup = (groupId) => {
    if (!socketRef.current) return;
    socketRef.current.emit('leaveGroup', groupId);
  };

  const value = {
    socket: socketRef.current,
    sendMessage,
    sendTypingStatus,
    joinGroup,
    leaveGroup
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
