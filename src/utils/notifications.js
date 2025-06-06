// Request notification permission
export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Notification permission error:', error);
    return false;
  }
};

// Show notification
export const showNotification = (title, options = {}) => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return;
  }

  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return notification;
  }
};

// Add notification to store
export const addNotification = (notification, store) => {
  store.addNotification(notification);
};

// Mark notification as read
export const markNotificationAsRead = (notificationId, store) => {
  store.markNotificationAsRead(notificationId);
};

// Clear all notifications
export const clearNotifications = (store) => {
  store.clearNotifications();
};

// Handle new message notification
export const handleNewMessageNotification = (message, store) => {
  const { user } = store;

  // Don't show notification if user is in the same chat
  if (store.activeChat?.id === message.sender._id) {
    return;
  }

  // Add notification to store
  addNotification({
    id: Date.now(),
    type: 'message',
    title: 'New Message',
    message: `New message from ${message.sender.username}`,
    read: false,
    data: message
  }, store);

  // Show browser notification
  showNotification(`New message from ${message.sender.username}`, {
    body: message.content,
    tag: `message-${message._id}`,
    requireInteraction: true
  });
};

// Handle new group message notification
export const handleNewGroupMessageNotification = (message, store) => {
  const { user } = store;

  // Don't show notification if user is in the same group
  if (store.activeChat?.id === message.group._id) {
    return;
  }

  // Add notification to store
  addNotification({
    id: Date.now(),
    type: 'group_message',
    title: 'New Group Message',
    message: `New message in ${message.group.name}`,
    read: false,
    data: message
  }, store);

  // Show browser notification
  showNotification(`New message in ${message.group.name}`, {
    body: `${message.sender.username}: ${message.content}`,
    tag: `group-message-${message._id}`,
    requireInteraction: true
  });
};

// Handle friend request notification
export const handleFriendRequestNotification = (request, store) => {
  // Add notification to store
  addNotification({
    id: Date.now(),
    type: 'friend_request',
    title: 'New Friend Request',
    message: `${request.sender.username} sent you a friend request`,
    read: false,
    data: request
  }, store);

  // Show browser notification
  showNotification('New Friend Request', {
    body: `${request.sender.username} sent you a friend request`,
    tag: `friend-request-${request._id}`,
    requireInteraction: true
  });
};

// Handle group invite notification
export const handleGroupInviteNotification = (invite, store) => {
  // Add notification to store
  addNotification({
    id: Date.now(),
    type: 'group_invite',
    title: 'Group Invitation',
    message: `You've been invited to join ${invite.group.name}`,
    read: false,
    data: invite
  }, store);

  // Show browser notification
  showNotification('Group Invitation', {
    body: `You've been invited to join ${invite.group.name}`,
    tag: `group-invite-${invite._id}`,
    requireInteraction: true
  });
}; 