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
  Badge
} from '@mui/material';
import {
  Chat as ChatIcon,
  Group as GroupIcon,
  People as PeopleIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import useStore from '../../store/useStore';
import { getThemeColors } from '../../utils/theme';
import { isUserOnline } from '../../utils/presence';
import Avatar from '../Avatar';

const drawerWidth = 240;

const Sidebar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const colors = getThemeColors();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { sidebarOpen, toggleSidebar, friends, groups, friendRequests, onlineUsers } = useStore();
  const [searchOpen, setSearchOpen] = useState(false);

  const handleDrawerToggle = () => {
    if (isMobile) {
      toggleSidebar();
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    handleDrawerToggle();
  };

  const handleSearchClick = () => {
    setSearchOpen(true);
    handleDrawerToggle();
  };

  const unreadFriendRequests = friendRequests.filter(r => !r.read).length||0;

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Dashboard */}
      <ListItemButton 
        onClick={() => handleNavigation('/dashboard')}
        selected={location.pathname === '/dashboard'}
      >
        <ListItemIcon>
          <DashboardIcon />
        </ListItemIcon>
        <ListItemText primary="Dashboard" />
      </ListItemButton>

      <Divider />

      {/* Search */}
      <ListItemButton onClick={handleSearchClick}>
        <ListItemIcon>
          <SearchIcon />
        </ListItemIcon>
        <ListItemText primary="Search" />
      </ListItemButton>

      <Divider />

      {/* Friends */}
      <List>
        <ListItem>
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle2">Friends</Typography>
                {unreadFriendRequests > 0 && (
                  <Badge badgeContent={unreadFriendRequests} color="error" />
                )}
              </Box>
            }
          />
        </ListItem>
        {friends.map((friend) => (
          <ListItem key={friend._id} disablePadding>
            <ListItemButton
              selected={location.pathname === `/chat/${friend._id}`}
              onClick={() => handleNavigation(`/chat/${friend._id}`)}
            >
              <ListItemIcon>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  variant="dot"
                  color={isUserOnline(friend._id, Array.from(onlineUsers)) ? 'success' : 'default'}
                >
                  <Avatar
                    src={friend.avatar}
                    alt={friend.username}
                    size={32}
                  />
                </Badge>
              </ListItemIcon>
              <ListItemText
                primary={friend.username}
                secondary={friend.status || 'No status'}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />

      {/* Groups */}
      <List>
        <ListItem>
          <ListItemText primary="Groups" />
          <ListItemIcon>
            <AddIcon onClick={() => handleNavigation('/groups/new')} />
          </ListItemIcon>
        </ListItem>
        {groups.map((group) => (
          <ListItem key={group._id} disablePadding>
            <ListItemButton
              selected={location.pathname === `/chat/group/${group._id}`}
              onClick={() => handleNavigation(`/chat/group/${group._id}`)}
            >
              <ListItemIcon>
                <Avatar
                  src={group.avatar}
                  alt={group.name}
                  size={32}
                />
              </ListItemIcon>
              <ListItemText
                primary={group.name}
                secondary={`${group.members.length} members`}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={sidebarOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            bgcolor: colors.surface,
            color: colors.text.primary,
            borderRight: `1px solid ${colors.divider}`
          }
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            bgcolor: colors.surface,
            color: colors.text.primary,
            borderRight: `1px solid ${colors.divider}`
          }
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar; 