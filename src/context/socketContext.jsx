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
  const user = useStore((state) => state.user);
  const token = useStore((state) => state.token);
  const addMessage = useStore((state) => state.addMessage);
  const addOnlineUser = useStore((state) => state.addOnlineUser);
  const removeOnlineUser = useStore((state) => state.removeOnlineUser);

  useEffect(() => {
    // Clean up existing socket if user/token is removed
    if (!user || !token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    // Don't create a new socket if one already exists
    if (socketRef.current) return;

    // Use the environment variable for socket URL
    const socketUrl = import.meta.env.VITE_SOCKET_URL;
    console.log('Socket URL:', socketUrl);
    console.log('All env variables:', import.meta.env); // Debug log

    if (!socketUrl) {
      console.warn('VITE_SOCKET_URL is not defined, skipping socket connection');
      return;
    }

    try {
      const socket = io(socketUrl, {
        auth: {
          token
        },
        withCredentials: true,
        timeout: 10000, // 10 second timeout
        forceNew: true
      });

      socketRef.current = socket;

      // Connection events
      socket.on('connect', () => {
        console.log('Socket connected successfully');
      });

      socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });

      socket.on('error', (error) => {
        console.error('Socket error:', error);
      });

      // Message events
      socket.on('message', (message) => {
        console.log('Received message:', message);
        addMessage(message);
      });

      socket.on('messageDeleted', (messageId) => {
        console.log('Message deleted:', messageId);
        // Update message in store
      });

      socket.on('messageEdited', (message) => {
        console.log('Message edited:', message);
        // Update message in store
      });

      // User events
      socket.on('userOnline', (userId) => {
        console.log('User online:', userId);
        addOnlineUser(userId);
      });

      socket.on('userOffline', (userId) => {
        console.log('User offline:', userId);
        removeOnlineUser(userId);
      });

      socket.on('typing', ({ userId, isTyping }) => {
        console.log('Typing event:', { userId, isTyping });
        // Update typing status in store
      });

      // Group events
      socket.on('groupMessage', (message) => {
        console.log('Group message:', message);
        addMessage(message);
      });

      socket.on('groupUserJoined', ({ groupId, user }) => {
        console.log('User joined group:', { groupId, user });
        // Update group members in store
      });

      socket.on('groupUserLeft', ({ groupId, userId }) => {
        console.log('User left group:', { groupId, userId });
        // Update group members in store
      });

      socket.on('groupUserRoleUpdated', ({ groupId, userId, role }) => {
        console.log('User role updated:', { groupId, userId, role });
        // Update group member role in store
      });

    } catch (error) {
      console.error('Error creating socket connection:', error);
    }

    // Cleanup
    return () => {
      if (socketRef.current) {
        console.log('Cleaning up socket connection');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user, token, addMessage, addOnlineUser, removeOnlineUser]);

  const sendMessage = (message) => {
    if (!socketRef.current) {
      console.warn('Socket not connected, cannot send message');
      return;
    }
    console.log('Sending message:', message);
    socketRef.current.emit('message', message);
  };

  const sendTypingStatus = ({ recipientId, isTyping }) => {
    if (!socketRef.current) {
      console.warn('Socket not connected, cannot send typing status');
      return;
    }
    console.log('Sending typing status:', { recipientId, isTyping });
    socketRef.current.emit('typing', { recipientId, isTyping });
  };

  const joinGroup = (groupId) => {
    if (!socketRef.current) {
      console.warn('Socket not connected, cannot join group');
      return;
    }
    console.log('Joining group:', groupId);
    socketRef.current.emit('joinGroup', groupId);
  };

  const leaveGroup = (groupId) => {
    if (!socketRef.current) {
      console.warn('Socket not connected, cannot leave group');
      return;
    }
    console.log('Leaving group:', groupId);
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
