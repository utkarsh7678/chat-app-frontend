import { format, isToday, isYesterday, isThisYear } from 'date-fns';

// Get file icon based on type
const getFileIcon = (type) => {
  if (!type) return 'insert_drive_file';

  if (type.startsWith('image/')) {
    return 'image';
  } else if (type.startsWith('video/')) {
    return 'videocam';
  } else if (type.startsWith('audio/')) {
    return 'audiotrack';
  } else if (type === 'application/pdf') {
    return 'picture_as_pdf';
  } else if (type.includes('word') || type.includes('document')) {
    return 'description';
  } else if (type.includes('excel') || type.includes('spreadsheet')) {
    return 'table_chart';
  } else if (type.includes('powerpoint') || type.includes('presentation')) {
    return 'slideshow';
  } else if (type === 'text/plain') {
    return 'article';
  } else if (type === 'text/csv') {
    return 'table_view';
  } else if (type.includes('zip') || type.includes('compressed')) {
    return 'folder_zip';
  }

  return 'insert_drive_file';
};

// Format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Format message timestamp
export const formatMessageTime = (message) => {
  return format(new Date(message.createdAt), 'HH:mm');
};

// Format message date
export const formatMessageDate = (message) => {
  const date = new Date(message.createdAt);
  
  if (isToday(date)) {
    return 'Today';
  } else if (isYesterday(date)) {
    return 'Yesterday';
  } else if (isThisYear(date)) {
    return format(date, 'MMM d');
  } else {
    return format(date, 'MMM d, yyyy');
  }
};

// Format message content
export const formatMessageContent = (message) => {
  if (message.attachment) {
    const size = formatFileSize(message.attachment.size);
    return {
      type: 'file',
      name: message.attachment.name,
      url: message.attachment.url,
      size
    };
  }
  return message.content;
};

// Validate message content
export const validateMessage = (content) => {
  if (!content || !content.trim()) {
    return {
      isValid: false,
      error: 'Message cannot be empty'
    };
  }

  if (content.length > 5000) {
    return {
      isValid: false,
      error: 'Message is too long (max 5000 characters)'
    };
  }

  return {
    isValid: true
  };
};

// Get message type
export const getMessageType = (message) => {
  if (message.attachment) {
    return 'file';
  }
  return 'text';
};

// Get message preview
export const getMessagePreview = (message) => {
  const type = getMessageType(message);
  
  switch (type) {
    case 'image':
      return '📷 Image';
    case 'video':
      return '🎥 Video';
    case 'audio':
      return '🎵 Audio';
    case 'file':
      return `${getFileIcon(message.attachment.type)} ${message.attachment.name}`;
    default:
      return message.content;
  }
};

// Check if message is self-destructing
export const isSelfDestructing = (message) => {
  return message.selfDestruct && message.selfDestruct > new Date();
};

// Get self-destruct time remaining
export const getSelfDestructTimeRemaining = (message) => {
  if (!isSelfDestructing(message)) {
    return null;
  }

  const now = new Date();
  const destructTime = new Date(message.selfDestruct);
  const diff = destructTime - now;

  // Less than a minute
  if (diff < 60000) {
    const seconds = Math.floor(diff / 1000);
    return `${seconds} second${seconds > 1 ? 's' : ''}`;
  }

  // Less than an hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  }

  // Less than a day
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }

  // More than a day
  const days = Math.floor(diff / 86400000);
  return `${days} day${days > 1 ? 's' : ''}`;
};

// Check if message is edited
export const isMessageEdited = (message) => {
  return message.editedAt && message.editedAt > message.createdAt;
};

// Get message status
export const getMessageStatus = (message) => {
  if (message.readBy?.length > 0) {
    return 'read';
  } else if (message.delivered) {
    return 'delivered';
  } else {
    return 'sent';
  }
};

// Get message status icon
export const getMessageStatusIcon = (status) => {
  switch (status) {
    case 'read':
      return '✓✓';
    case 'delivered':
      return '✓✓';
    case 'sent':
      return '✓';
    default:
      return '';
  }
};

// Get message status color
export const getMessageStatusColor = (status) => {
  switch (status) {
    case 'read':
      return 'primary';
    case 'delivered':
      return 'text.secondary';
    case 'sent':
      return 'text.secondary';
    default:
      return 'text.secondary';
  }
}; 