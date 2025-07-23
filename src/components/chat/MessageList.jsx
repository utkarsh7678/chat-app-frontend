import { useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Timer as TimerIcon
} from '@mui/icons-material';
import { useSocket } from '../../context/socketContext';
import { getThemeColors } from '../../utils/theme';
import {
  formatMessageTime,
  formatMessageDate,
  formatMessageContent,
  getMessageType,
  getMessageStatus,
  getMessageStatusIcon,
  getMessageStatusColor,
  isMessageEdited,
  isSelfDestructing,
  getSelfDestructTimeRemaining
} from '../../utils/messageUtils';
import Avatar from '../Avatar';

const MessageList = ({ messages, onMessageMenuOpen }) => {
  const colors = getThemeColors();
  const messagesEndRef = useRef();
  const { socket } = useSocket();

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const renderMessage = (message, index) => {
    const isOwnMessage = message.sender._id === socket?.id;
    const showAvatar = index === 0 || messages[index - 1]?.sender._id !== message.sender._id;
    const showDate = index === 0 || !isSameDay(messages[index - 1]?.createdAt, message.createdAt);

    return (
      <Box
        key={message._id}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: isOwnMessage ? 'flex-end' : 'flex-start',
          mb: 2
        }}
      >
        {showDate && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ alignSelf: 'center', my: 1 }}
          >
            {formatMessageDate(message.createdAt)}
          </Typography>
        )}

        <Box
          sx={{
            display: 'flex',
            gap: 1,
            maxWidth: '70%'
          }}
        >
          {!isOwnMessage && showAvatar && (
            <Avatar
              src={message.sender.avatar}
              alt={message.sender.username}
              sx={{ width: 32, height: 32 }}
            />
          )}

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: isOwnMessage ? 'flex-end' : 'flex-start'
            }}
          >
            {!isOwnMessage && showAvatar && (
              <Typography variant="caption" color="text.secondary">
                {message.sender.username}
              </Typography>
            )}

            <Box
              sx={{
                position: 'relative',
                bgcolor: isOwnMessage ? colors.primary : colors.surface,
                color: isOwnMessage ? 'white' : 'text.primary',
                p: 1.5,
                borderRadius: 2,
                '&:hover .message-actions': {
                  opacity: 1
                }
              }}
            >
              {formatMessageContent(message)}

              <Box
                className="message-actions"
                sx={{
                  position: 'absolute',
                  top: -20,
                  right: 0,
                  opacity: 0,
                  transition: 'opacity 0.2s',
                  bgcolor: colors.surface,
                  borderRadius: 1,
                  boxShadow: 1
                }}
              >
                <IconButton
                  size="small"
                  onClick={(e) => onMessageMenuOpen(e, message)}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                mt: 0.5
              }}
            >
              <Typography variant="caption" color="text.secondary">
                {formatMessageTime(message.createdAt)}
              </Typography>

              {isMessageEdited(message) && (
                <Typography variant="caption" color="text.secondary">
                  (edited)
                </Typography>
              )}

              {isOwnMessage && (
                <Tooltip title={getMessageStatus(message)}>
                  <Box
                    component="span"
                    sx={{
                      color: getMessageStatusColor(message),
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {getMessageStatusIcon(message)}
                  </Box>
                </Tooltip>
              )}

              {isSelfDestructing(message) && (
                <Tooltip title={`Self-destructing in ${getSelfDestructTimeRemaining(message)}`}>
                  <Box
                    component="span"
                    sx={{
                      color: 'error.main',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <TimerIcon fontSize="small" />
                  </Box>
                </Tooltip>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Box
      sx={{
        flex: 1,
        overflow: 'auto',
        p: 2,
        bgcolor: colors.background
      }}
    >
      {messages.map((message, index) => renderMessage(message, index))}
      <div ref={messagesEndRef} />
    </Box>
  );
};

const isSameDay = (date1, date2) => {
  if (!date1 || !date2) return false;
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

export default MessageList; 