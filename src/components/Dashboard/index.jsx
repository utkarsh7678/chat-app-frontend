import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme, styled } from '@mui/material/styles';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Avatar,
  IconButton,
  Badge,
  TextField,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Tabs,
  Tab,
  useMediaQuery,
  CircularProgress
} from '@mui/material';
import {
  Chat as ChatIcon,
  Group as GroupIcon,
  PersonAdd as PersonAddIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Notifications as NotificationsIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Circle as CircleIcon,
  People as PeopleIcon,
  EmojiPeople as EmojiPeopleIcon,
  GroupAdd as GroupAddIcon
} from '@mui/icons-material';
import { useStore } from '../../store/useStore';
import { isUserOnline } from '../../utils/presence';

// Styled Components
const DashboardContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  backgroundColor: theme.palette.background.default,
  padding: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
  },
}));

const Header = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  '& h4': {
    fontWeight: 700,
    background: theme.palette.mode === 'light' 
      ? 'linear-gradient(45deg, #1976d2 30%, #21CBF3 90%)' 
      : 'linear-gradient(45deg, #90caf9 30%, #4fc3f7 90%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    display: 'inline-block',
  },
}));

const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  borderRadius: theme.shape.borderRadius * 2,
  background: theme.palette.background.paper,
  boxShadow: theme.shadows[2],
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[6],
  },
}));

const OnlineBadge = styled('span')(({ theme }) => ({
  width: 10,
  height: 10,
  backgroundColor: '#44b700',
  borderRadius: '50%',
  position: 'absolute',
  bottom: 0,
  right: 0,
  border: `2px solid ${theme.palette.background.paper}`,
}));

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { 
    user, 
    friends, 
    groups, 
    notifications, 
    onlineUsers,
    friendRequests
  } = useStore();

  const unreadNotifications = notifications.filter(n => !n.read).length;
  const unreadFriendRequests = friendRequests.filter(r => !r.read).length;

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  const handleStartChat = (userId) => {
    navigate(`/chat/${userId}`);
  };

  const handleViewGroup = (groupId) => {
    navigate(`/group/${groupId}`);
  };

  return (
    <DashboardContainer>
      <Header>
        <Typography variant="h4">Dashboard</Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
          Welcome back, {user?.username || 'User'}! Here's what's happening.
        </Typography>
      </Header>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard>
            <Box display="flex" alignItems="center">
              <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
                <PeopleIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" color="text.primary">
                  {friends.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Friends
                </Typography>
              </Box>
            </Box>
          </StatCard>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard>
            <Box display="flex" alignItems="center">
              <Avatar sx={{ bgcolor: 'success.light', mr: 2 }}>
                <GroupIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" color="text.primary">
                  {groups.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Groups
                </Typography>
              </Box>
            </Box>
          </StatCard>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard>
            <Box display="flex" alignItems="center">
              <Avatar sx={{ bgcolor: 'warning.light', mr: 2 }}>
                <Badge badgeContent={unreadNotifications} color="error">
                  <NotificationsIcon />
                </Badge>
              </Avatar>
              <Box>
                <Typography variant="h6" color="text.primary">
                  {notifications.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Notifications
                </Typography>
              </Box>
            </Box>
          </StatCard>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard>
            <Box display="flex" alignItems="center">
              <Avatar sx={{ bgcolor: 'info.light', mr: 2 }}>
                <EmojiPeopleIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" color="text.primary">
                  {onlineUsers.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Online Friends
                </Typography>
              </Box>
            </Box>
          </StatCard>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" fontWeight={600}>
                Recent Activity
              </Typography>
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange}
                variant={isMobile ? 'scrollable' : 'standard'}
                scrollButtons="auto"
                allowScrollButtonsMobile
              >
                <Tab label="Friends" icon={<PeopleIcon />} iconPosition="start" />
                <Tab label="Groups" icon={<GroupIcon />} iconPosition="start" />
                <Tab label="Requests" icon={<PersonAddIcon />} iconPosition="start" />
              </Tabs>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {activeTab === 0 && (
              <List>
                {friends.slice(0, 5).map((friend) => (
                  <React.Fragment key={friend._id}>
                    <ListItem 
                      button 
                      onClick={() => handleStartChat(friend._id)}
                      sx={{ borderRadius: 2, '&:hover': { bgcolor: 'action.hover' } }}
                    >
                      <ListItemAvatar>
                        <Badge
                          overlap="circular"
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                          variant="dot"
                          color={isUserOnline(onlineUsers, friend._id) ? 'success' : 'default'}
                        >
                          <Avatar src={friend.avatar} alt={friend.username} />
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={friend.username}
                        primaryTypographyProps={{ fontWeight: 500 }}
                        secondary={isUserOnline(onlineUsers, friend._id) ? 'Online' : 'Offline'}
                      />
                      <ListItemSecondaryAction>
                        <IconButton edge="end" size="small">
                          <ChatIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
                {friends.length === 0 && (
                  <Box textAlign="center" py={4}>
                    <PeopleIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                    <Typography color="text.secondary">
                      No friends yet. Start by adding some!
                    </Typography>
                  </Box>
                )}
              </List>
            )}

            {activeTab === 1 && (
              <List>
                {groups.slice(0, 5).map((group) => (
                  <React.Fragment key={group._id}>
                    <ListItem 
                      button 
                      onClick={() => handleViewGroup(group._id)}
                      sx={{ borderRadius: 2, '&:hover': { bgcolor: 'action.hover' } }}
                    >
                      <ListItemAvatar>
                        <Avatar src={group.avatar}>
                          <GroupIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={group.name}
                        primaryTypographyProps={{ fontWeight: 500 }}
                        secondary={`${group.members?.length || 0} members`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton edge="end" size="small">
                          <MoreVertIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
                {groups.length === 0 && (
                  <Box textAlign="center" py={4}>
                    <GroupIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                    <Typography color="text.secondary">
                      No groups yet. Create one to get started!
                    </Typography>
                  </Box>
                )}
              </List>
            )}

            {activeTab === 2 && (
              <List>
                {friendRequests.slice(0, 5).map((request) => (
                  <React.Fragment key={request._id}>
                    <ListItem sx={{ borderRadius: 2 }}>
                      <ListItemAvatar>
                        <Avatar src={request.sender?.avatar} alt={request.sender?.username} />
                      </ListItemAvatar>
                      <ListItemText 
                        primary={request.sender?.username}
                        primaryTypographyProps={{ fontWeight: 500 }}
                        secondary="Wants to be your friend"
                      />
                      <Box>
                        <Button 
                          size="small" 
                          variant="contained" 
                          color="primary"
                          sx={{ mr: 1, textTransform: 'none' }}
                        >
                          Accept
                        </Button>
                        <Button 
                          size="small" 
                          variant="outlined" 
                          color="error"
                          sx={{ textTransform: 'none' }}
                        >
                          Decline
                        </Button>
                      </Box>
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
                {friendRequests.length === 0 && (
                  <Box textAlign="center" py={4}>
                    <PersonAddIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                    <Typography color="text.secondary">
                      No pending friend requests
                    </Typography>
                  </Box>
                )}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={4}>
          {/* Search */}
          <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
            <form onSubmit={handleSearch}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search messages, people..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  sx: { borderRadius: 2 }
                }}
              />
            </form>
          </Paper>

          {/* Quick Actions */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} mb={2}>
              Quick Actions
            </Typography>
            <Button 
              fullWidth 
              variant="contained" 
              color="primary"
              startIcon={<AddIcon />}
              sx={{ mb: 2, textTransform: 'none', borderRadius: 2 }}
            >
              New Chat
            </Button>
            <Button 
              fullWidth 
              variant="outlined" 
              color="primary"
              startIcon={<GroupAddIcon />}
              sx={{ mb: 2, textTransform: 'none', borderRadius: 2 }}
            >
              Create Group
            </Button>
            <Button 
              fullWidth 
              variant="outlined" 
              color="primary"
              startIcon={<PersonAddIcon />}
              sx={{ textTransform: 'none', borderRadius: 2 }}
            >
              Add Friend
            </Button>
          </Paper>

          {/* Online Friends */}
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} mb={2}>
              Online Friends
            </Typography>
            <List>
              {friends
                .filter(friend => isUserOnline(onlineUsers, friend._id))
                .slice(0, 5)
                .map((friend) => (
                  <ListItem key={friend._id} disableGutters>
                    <ListItemAvatar>
                      <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        variant="dot"
                        color="success"
                      >
                        <Avatar src={friend.avatar} alt={friend.username} />
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={friend.username}
                      primaryTypographyProps={{ fontWeight: 500 }}
                    />
                  </ListItem>
                ))}
              {friends.filter(friend => isUserOnline(onlineUsers, friend._id)).length === 0 && (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                  No friends online
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </DashboardContainer>
  );
};

export default Dashboard;
