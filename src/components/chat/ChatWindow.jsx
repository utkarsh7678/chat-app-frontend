import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Timer as TimerIcon,
  EmojiEmotions as EmojiIcon
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import useStore from '../../store/useStore';
import { useSocket } from '../../context/socketContext';
import { getThemeColors } from '../../utils/theme';
import {
  formatMessageTime,
  formatMessageDate,
  formatMessageContent,
  validateMessage,
  getMessageType,
  getMessageStatus,
  getMessageStatusIcon,
  getMessageStatusColor,
  isMessageEdited,
  isSelfDestructing,
  getSelfDestructTimeRemaining
} from '../../utils/messageUtils';
import { prepareFileForUpload } from '../../utils/fileHandler';
import { messages as messageApi } from '../../services/api';
import MessageList from './MessageList';
import Avatar from '../Avatar';

const ChatWindow = () => {
  const { userId } = useParams();
  const colors = getThemeColors();
  const fileInputRef = useRef();
  const messageEndRef = useRef();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selfDestructTime, setSelfDestructTime] = useState(null);

  const { user, messages, addMessage } = useStore();
  const { socket, sendMessage, sendTypingStatus } = useSocket();

  const friend = useStore(state => 
    state.friends.find(f => f._id === userId)
  );

  const chatMessages = messages.filter(
    m => (m.sender._id === userId && m.recipient._id === user._id) ||
         (m.sender._id === user._id && m.recipient._id === userId)
  );

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  useEffect(() => {
    // Mark messages as read
    const unreadMessages = chatMessages.filter(
      m => m.sender._id === userId && !m.readBy?.includes(user._id)
    );

    if (unreadMessages.length > 0) {
      unreadMessages.forEach(message => {
        socket?.emit('markAsRead', message._id);
      });
    }
  }, [chatMessages, userId, user._id, socket]);

  const handleMessageChange = (e) => {
    setMessage(e.target.value);

    // Send typing status
    if (!isTyping) {
      setIsTyping(true);
      sendTypingStatus({ recipientId: userId, isTyping: true });
    }

    // Clear typing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Set new typing timeout
    const timeout = setTimeout(() => {
      setIsTyping(false);
      sendTypingStatus({ recipientId: userId, isTyping: false });
    }, 2000);

    setTypingTimeout(timeout);
  };

  const handleSendMessage = async () => {
    const validation = validateMessage(message);
    if (!validation.isValid) {
      // Show error
      return;
    }

    try {
      const messageData = {
        recipientId: userId,
        content: message,
        selfDestruct: selfDestructTime
      };

      const response = await messageApi.sendMessage(messageData);
      addMessage(response.data);
      sendMessage(response.data);
      setMessage('');
      setSelfDestructTime(null);
    } catch (error) {
      console.error('Error sending message:', error);
      // Show error
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await messageApi.uploadAttachment(formData);
      const messageData = {
        recipientId: userId,
        content: '',
        attachment: response.data
      };

      const messageResponse = await messageApi.sendMessage(messageData);
      addMessage(messageResponse.data);
      sendMessage(messageResponse.data);
    } catch (error) {
      console.error('Error uploading file:', error);
      // Show error
    } finally {
      setLoading(false);
      e.target.value = null;
    }
  };

  const handleMessageMenuOpen = (event, message) => {
    setAnchorEl(event.currentTarget);
    setSelectedMessage(message);
  };

  const handleMessageMenuClose = () => {
    setAnchorEl(null);
    setSelectedMessage(null);
  };

  const handleDeleteMessage = async () => {
    if (!selectedMessage) return;

    try {
      await messageApi.deleteMessage(selectedMessage._id);
      // Update message in store
      handleMessageMenuClose();
    } catch (error) {
      console.error('Error deleting message:', error);
      // Show error
    }
  };

  const handleEditMessage = () => {
    if (!selectedMessage) return;
    setMessage(selectedMessage.content);
    handleMessageMenuClose();
  };

  const handleSelfDestructClick = (minutes) => {
    if (minutes === null) {
      setSelfDestructTime(null);
    } else {
      const time = new Date();
      time.setMinutes(time.getMinutes() + minutes);
      setSelfDestructTime(time);
    }
    handleMessageMenuClose();
  };

  if (!friend) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          bgcolor: colors.background
        }}
      >
        <Typography variant="h6" color="text.secondary">
          Select a chat to start messaging
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: colors.background
      }}
    >
      {/* Chat Header */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          bgcolor: colors.surface,
          borderBottom: `1px solid ${colors.divider}`
        }}
      >
        <Avatar
          alt={friend.username}
          src={friend.avatar}
          sx={{ width: 48, height: 48 }}
        />
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6">{friend.username}</Typography>
          <Typography variant="body2" color="text.secondary">
            {friend.status || 'No status'}
          </Typography>
        </Box>
      </Paper>

      {/* Messages */}
      <Box
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <MessageList
          messages={chatMessages}
          onMessageMenuOpen={handleMessageMenuOpen}
        />
        <div ref={messageEndRef} />
      </Box>

      {/* Message Input */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          bgcolor: colors.surface,
          borderTop: `1px solid ${colors.divider}`
        }}
      >
        <Box sx={{ display: 'flex', gap: 1 }}>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
          <IconButton
            color="primary"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : <AttachFileIcon />}
          </IconButton>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={message}
            onChange={handleMessageChange}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            variant="outlined"
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: colors.background
              }
            }}
          />
          <IconButton
            color="primary"
            onClick={handleSendMessage}
            disabled={!message.trim() || loading}
          >
            <SendIcon />
          </IconButton>
        </Box>
        {selfDestructTime && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
            Message will self-destruct in {getSelfDestructTimeRemaining({ selfDestruct: selfDestructTime })}
          </Typography>
        )}
      </Paper>

      {/* Message Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMessageMenuClose}
      >
        {selectedMessage?.sender._id === user._id && (
          <>
            <MenuItem onClick={handleEditMessage}>
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Edit</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleDeleteMessage}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Delete</ListItemText>
            </MenuItem>
          </>
        )}
        <MenuItem onClick={() => handleSelfDestructClick(1)}>
          <ListItemIcon>
            <TimerIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Self-destruct in 1 minute</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleSelfDestructClick(5)}>
          <ListItemIcon>
            <TimerIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Self-destruct in 5 minutes</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleSelfDestructClick(30)}>
          <ListItemIcon>
            <TimerIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Self-destruct in 30 minutes</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleSelfDestructClick(null)}>
          <ListItemIcon>
            <TimerIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>No self-destruct</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ChatWindow; 