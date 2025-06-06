// Socket operations
const socketOperations = {
  updateLastSeen: (socket) => {
    if (socket) {
      socket.emit('updateLastSeen');
    }
  },

  setUserOnline: (socket) => {
    if (socket) {
      socket.emit('setOnline');
    }
  },

  setUserOffline: (socket) => {
    if (socket) {
      socket.emit('setOffline');
    }
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
export const isUserOnline = (userId, onlineUsers) => {
  return onlineUsers.includes(userId);
};

// Handle user activity
export const handleUserActivity = (socket) => {
  if (socket) {
    socketOperations.updateLastSeen(socket);
    socketOperations.setUserOnline(socket);
  }
};

// Setup activity listeners
export const setupActivityListeners = (socket) => {
  // Update last seen on user activity
  const activityEvents = [
    'mousedown',
    'keydown',
    'touchstart',
    'mousemove',
    'scroll'
  ];

  const handleActivity = () => handleUserActivity(socket);

  activityEvents.forEach(event => {
    window.addEventListener(event, handleActivity, { passive: true });
  });

  // Set user as offline when window is closed
  window.addEventListener('beforeunload', () => {
    socketOperations.setUserOffline(socket);
  });

  // Set user as online when window is focused
  window.addEventListener('focus', () => {
    socketOperations.setUserOnline(socket);
  });

  // Set user as offline when window is blurred
  window.addEventListener('blur', () => {
    socketOperations.setUserOffline(socket);
  });

  // Cleanup function
  return () => {
    activityEvents.forEach(event => {
      window.removeEventListener(event, handleActivity);
    });
    window.removeEventListener('beforeunload', () => {
      socketOperations.setUserOffline(socket);
    });
    window.removeEventListener('focus', () => {
      socketOperations.setUserOnline(socket);
    });
    window.removeEventListener('blur', () => {
      socketOperations.setUserOffline(socket);
    });
  };
};

// Get user status
export const getUserStatus = (user, onlineUsers) => {
  if (isUserOnline(user._id, onlineUsers)) {
    return 'Online';
  }
  return formatLastSeen(user.lastSeen);
};

// Get user status color
export const getUserStatusColor = (user, onlineUsers) => {
  if (isUserOnline(user._id, onlineUsers)) {
    return 'success';
  }
  return 'text.secondary';
}; 