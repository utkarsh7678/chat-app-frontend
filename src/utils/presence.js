import useStore from '../store/useStore';
import { useSocket } from '../context/socketContext';

// Update user's last seen timestamp
export const updateLastSeen = () => {
  const store = useStore.getState();
  const { socket } = useSocket();

  if (socket) {
    socket.emit('updateLastSeen');
  }
};

// Set user as online
export const setUserOnline = () => {
  const store = useStore.getState();
  const { socket } = useSocket();

  if (socket) {
    socket.emit('setOnline');
  }
};

// Set user as offline
export const setUserOffline = () => {
  const store = useStore.getState();
  const { socket } = useSocket();

  if (socket) {
    socket.emit('setOffline');
  }
};

// Format last seen timestamp
export const formatLastSeen = (timestamp) => {
  if (!timestamp) return 'Offline';

  const now = new Date();
  const lastSeen = new Date(timestamp);
  const diff = now - lastSeen;

  // Less than a minute
  if (diff < 60000) {
    return 'Just now';
  }

  // Less than an hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }

  // Less than a day
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }

  // Less than a week
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }

  // More than a week
  return lastSeen.toLocaleDateString();
};

// Check if user is online
export const isUserOnline = (userId) => {
  const store = useStore.getState();
  return store.onlineUsers.includes(userId);
};

// Handle user activity
export const handleUserActivity = () => {
  updateLastSeen();
  setUserOnline();
};

// Setup activity listeners
export const setupActivityListeners = () => {
  // Update last seen on user activity
  const activityEvents = [
    'mousedown',
    'keydown',
    'touchstart',
    'mousemove',
    'scroll'
  ];

  activityEvents.forEach(event => {
    window.addEventListener(event, handleUserActivity, { passive: true });
  });

  // Set user as offline when window is closed
  window.addEventListener('beforeunload', setUserOffline);

  // Set user as online when window is focused
  window.addEventListener('focus', setUserOnline);

  // Set user as offline when window is blurred
  window.addEventListener('blur', setUserOffline);

  // Cleanup function
  return () => {
    activityEvents.forEach(event => {
      window.removeEventListener(event, handleUserActivity);
    });
    window.removeEventListener('beforeunload', setUserOffline);
    window.removeEventListener('focus', setUserOnline);
    window.removeEventListener('blur', setUserOffline);
  };
};

// Get user status
export const getUserStatus = (user) => {
  if (isUserOnline(user._id)) {
    return 'Online';
  }
  return formatLastSeen(user.lastSeen);
};

// Get user status color
export const getUserStatusColor = (user) => {
  if (isUserOnline(user._id)) {
    return 'success';
  }
  return 'text.secondary';
}; 