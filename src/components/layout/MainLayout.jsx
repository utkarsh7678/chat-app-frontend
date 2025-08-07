import { Box, CssBaseline, useMediaQuery, styled } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { getThemeColors } from '../../utils/theme';
import { useStore } from '../../store/useStore';

const MainContent = styled(Box)(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: 0,
  marginTop: '64px',
  minHeight: 'calc(100vh - 64px)',
  backgroundColor: theme.palette.background.default,
  [theme.breakpoints.up('sm')]: {
    marginLeft: '240px',
    width: 'calc(100% - 240px)',
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const MainLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const colors = getThemeColors();
  const { sidebarOpen, toggleSidebar } = useStore();

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh', 
      bgcolor: colors.background,
      color: colors.text.primary,
    }}>
      <CssBaseline />
      
      {/* Header */}
      <Header />
      
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={toggleSidebar} />
      
      {/* Main Content */}
      <MainContent component="main" open={sidebarOpen}>
        <Box 
          sx={{
            maxWidth: 1600,
            margin: '0 auto',
            width: '100%',
            height: '100%',
            borderRadius: 2,
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
            backgroundColor: colors.surface,
            overflow: 'hidden',
            p: 3,
          }}
        >
          <Outlet />
        </Box>
      </MainContent>
    </Box>
  );
};

export default MainLayout;
