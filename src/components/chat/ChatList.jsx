import {
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Badge,
  Divider
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import useStore from '../../store/useStore';
import { isUserOnline } from '../../utils/presence';
import { getMessagePreview, formatMessageTime } from '../../utils/messageUtils';
import { getThemeColors } from '../../utils/theme';
import Avatar from '../Avatar';

const ChatList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const colors = getThemeColors();
  
  const { friends, messages } = useStore();

  // Get last message for each friend
  const getLastMessage = (friendId) => {
    const friendMessages = messages.filter(
      m => m.sender._id === friendId || m.recipient._id === friendId
    );
    return friendMessages[friendMessages.length - 1];
  };

  // Sort friends by last message time
  const sortedFriends = [...friends].sort((a, b) => {
    const messageA = getLastMessage(a._id);
    const messageB = getLastMessage(b._id);
    
    if (!messageA) return 1;
    if (!messageB) return -1;
    
    return new Date(messageB.createdAt) - new Date(messageA.createdAt);
  });

  return (
    <List sx={{ width: '100%', bgcolor: colors.background }}>
      {sortedFriends.map((friend, index) => {
        const lastMessage = getLastMessage(friend._id);
        const unreadCount = messages.filter(
          m => m.sender._id === friend._id && !m.readBy?.includes(friend._id)
        ).length;

        return (
          <Box key={friend._id}>
            <ListItem
              disablePadding
              sx={{
                bgcolor: location.pathname === `/chat/${friend._id}` ? colors.surface : 'transparent'
              }}
            >
              <ListItemButton
                onClick={() => navigate(`/chat/${friend._id}`)}
                sx={{
                  py: 1.5,
                  '&:hover': {
                    bgcolor: colors.surface
                  }
                }}
              >
                <ListItemAvatar>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    variant="dot"
                    color={isUserOnline(friend._id) ? 'success' : 'default'}
                  >
                    <Avatar
                      alt={friend.username}
                      src={friend.avatar}
                      sx={{ width: 48, height: 48 }}
                    />
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle1" component="span">
                        {friend.username}
                      </Typography>
                      {lastMessage && (
                        <Typography variant="caption" color="text.secondary">
                          {formatMessageTime(lastMessage.createdAt)}
                        </Typography>
                      )}
                    </Box>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '200px'
                        }}
                      >
                        {lastMessage ? getMessagePreview(lastMessage) : 'No messages yet'}
                      </Typography>
                      {unreadCount > 0 && (
                        <Badge
                          badgeContent={unreadCount}
                          color="primary"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Box>
                  }
                />
              </ListItemButton>
            </ListItem>
            {index < sortedFriends.length - 1 && <Divider />}
          </Box>
        );
      })}
    </List>
  );
};

export default ChatList; 