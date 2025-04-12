import React, { createContext, useState, useEffect, useContext } from 'react';
import io from 'socket.io-client';

// Create a Context for Socket.IO
const SocketContext = createContext();

// Initialize Socket.IO connection (replace with your backend URL)
const socket = io('https://realtime-chat-api-z27k.onrender.com');

// Create a provider component
export const SocketProvider = ({ children }) => {
  const [socketConnected, setSocketConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);

  useEffect(() => {
    // When socket connects
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setSocketConnected(true);
    });

    // Get list of active users
    socket.on('userList', (users) => {
      setActiveUsers(users);
    });

    // Handle socket disconnection
    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setSocketConnected(false);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('userList');
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, socketConnected, activeUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

// Create a custom hook to use the SocketContext
export const useSocket = () => {
  return useContext(SocketContext);
};
