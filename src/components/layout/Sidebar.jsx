import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  useMediaQuery,
  useTheme,
  Typography,
  Badge,
  IconButton,
  Collapse,
  Tooltip,
  Avatar as MuiAvatar,
  styled
} from '@mui/material';
import {
  Chat as ChatIcon,
  Group as GroupIcon,
  People as PeopleIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Dashboard as DashboardIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Star as StarIcon,
  Mail as MailIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import useStore from '../../store/useStore';
import { getThemeColors } from '../../utils/theme';
import { isUserOnline } from '../../utils/presence';

const drawerWidth = 260;

const StyledDrawer = styled(Drawer)(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: 'border-box',
    borderRight: 'none',
    background: theme.palette.background.paper,
    boxShadow: theme.shadows[3],
  },
  '& .MuiListItemButton-root': {
    borderRadius: theme.spacing(1),
    margin: theme.spacing(0.5, 1.5, 0.5, 1.5),
    '&.Mui-selected': {
      backgroundColor: theme.palette.primary.light,
      color: theme.palette.primary.main,
      '&:hover': {
        backgroundColor: theme.palette.primary.light,
      },
    },
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  '& .MuiListItemIcon-root': {
    minWidth: 40,
    color: 'inherit',
  },
}));

const Sidebar = ({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const colors = getThemeColors();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { friends, groups, friendRequests, onlineUsers, logout } = useStore();
  const [searchOpen, setSearchOpen] = useState(false);
  const [expanded, setExpanded] = useState({
    friends: true,
    groups: true,
  });

  const unreadFriendRequests = friendRequests.filter(r => !r.read).length;
  const unreadMessages = 0; // You can implement this based on your message store

  const handleExpandClick = (section) => {
    setExpanded(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { 
      text: 'Dashboard', 
      icon: <DashboardIcon />, 
      path: '/dashboard',
      active: location.pathname === '/dashboard'
    },
    { 
      text: 'Chats', 
      icon: <ChatIcon />, 
      path: '/chats',
      badge: unreadMessages > 0 ? unreadMessages : null,
      active: location.pathname.startsWith('/chat')
    },
    { 
      text: 'Friends', 
      icon: <PeopleIcon />, 
      path: '/friends',
      badge: unreadFriendRequests > 0 ? unreadFriendRequests : null,
      active: location.pathname === '/friends'
    },
    { 
      text: 'Groups', 
      icon: <GroupIcon />, 
      path: '/groups',
      active: location.pathname.startsWith('/group')
    },
  ];

  const bottomMenuItems = [
    { 
      text: 'Settings', 
      icon: <SettingsIcon />, 
      path: '/settings',
      active: location.pathname === '/settings'
    },
    { 
      text: 'Logout', 
      icon: <LogoutIcon />, 
      onClick: handleLogout
    },
  ];

  return (
    <StyledDrawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        height: '100%',
        p: 2,
        pt: 3,
      }}>
        {/* Logo/Brand */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3,
          px: 1,
        }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700,
              background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            ChatApp
          </Typography>
        </Box>

        {/* Search */}
        <Box sx={{ px: 1.5, mb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: 'action.hover',
              borderRadius: 2,
              px: 2,
              py: 1,
            }}
          >
            <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
            <input
              type="text"
              placeholder="Search..."
              style={{
                border: 'none',
                background: 'transparent',
                width: '100%',
                outline: 'none',
                color: theme.palette.text.primary,
                '::placeholder': {
                  color: theme.palette.text.secondary,
                },
              }}
            />
          </Box>
        </Box>

        {/* Main Menu */}
        <List sx={{ flexGrow: 1, overflowY: 'auto' }}>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={item.active}
                onClick={() => handleNavigation(item.path)}
              >
                <ListItemIcon sx={{ color: 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{
                    variant: 'body2',
                    fontWeight: item.active ? 600 : 'normal',
                  }}
                />
                {item.badge && (
                  <Box
                    sx={{
                      bgcolor: 'error.main',
                      color: 'white',
                      borderRadius: '50%',
                      width: 20,
                      height: 20,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                    }}
                  >
                    {item.badge}
                  </Box>
                )}
              </ListItemButton>
            </ListItem>
          ))}

          {/* Friends Section */}
          <Box>
            <ListItemButton onClick={() => handleExpandClick('friends')}>
              <ListItemText 
                primary="Friends" 
                primaryTypographyProps={{
                  variant: 'subtitle2',
                  fontWeight: 600,
                  color: 'text.secondary',
                }}
              />
              {expanded.friends ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItemButton>
            <Collapse in={expanded.friends} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {friends.map((friend) => (
                  <ListItem key={friend._id} disablePadding>
                    <ListItemButton
                      sx={{ pl: 4 }}
                      onClick={() => handleNavigation(`/chat/${friend._id}`)}
                    >
                      <Box sx={{ position: 'relative', mr: 2 }}>
                        <MuiAvatar 
                          src={friend.avatar} 
                          alt={friend.username}
                          sx={{ width: 28, height: 28 }}
                        />
                        {isUserOnline(onlineUsers, friend._id) && (
                          <Box
                            sx={{
                              position: 'absolute',
                              bottom: 0,
                              right: 0,
                              width: 10,
                              height: 10,
                              bgcolor: '#44b700',
                              borderRadius: '50%',
                              border: `2px solid ${theme.palette.background.paper}`,
                            }}
                          />
                        )}
                      </Box>
                      <ListItemText 
                        primary={friend.username} 
                        primaryTypographyProps={{
                          variant: 'body2',
                          noWrap: true,
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
                {friends.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ pl: 4, py: 1 }}>
                    No friends yet
                  </Typography>
                )}
              </List>
            </Collapse>
          </Box>

          {/* Groups Section */}
          <Box>
            <ListItemButton onClick={() => handleExpandClick('groups')}>
              <ListItemText 
                primary="Groups" 
                primaryTypographyProps={{
                  variant: 'subtitle2',
                  fontWeight: 600,
                  color: 'text.secondary',
                }}
              />
              {expanded.groups ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItemButton>
            <Collapse in={expanded.groups} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {groups.map((group) => (
                  <ListItem key={group._id} disablePadding>
                    <ListItemButton
                      sx={{ pl: 4 }}
                      onClick={() => handleNavigation(`/group/${group._id}`)}
                    >
                      <Box sx={{ position: 'relative', mr: 2 }}>
                        <MuiAvatar 
                          src={group.avatar} 
                          alt={group.name}
                          sx={{ width: 28, height: 28 }}
                        >
                          {group.name[0]?.toUpperCase()}
                        </MuiAvatar>
                      </Box>
                      <ListItemText 
                        primary={group.name}
                        primaryTypographyProps={{
                          variant: 'body2',
                          noWrap: true,
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
                {groups.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ pl: 4, py: 1 }}>
                    No groups yet
                  </Typography>
                )}
              </List>
            </Collapse>
          </Box>
        </List>

        {/* Bottom Menu */}
        <List>
          <Divider sx={{ my: 1 }} />
          {bottomMenuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => item.onClick ? item.onClick() : handleNavigation(item.path)}
                selected={item.active}
              >
                <ListItemIcon sx={{ color: 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{
                    variant: 'body2',
                    fontWeight: item.active ? 600 : 'normal',
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </StyledDrawer>
  );
};

export default Sidebar;
