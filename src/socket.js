// context/socketContext.js
import { createContext, useContext } from "react";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_URL, {
  transports: ["websocket"],
  withCredentials: true,
});

const SocketContext = createContext(socket);

export const SocketProvider = ({ children }) => (
  <SocketContext.Provider value={socket}>
    {children}
  </SocketContext.Provider>
);

export const useSocket = () => useContext(SocketContext);
