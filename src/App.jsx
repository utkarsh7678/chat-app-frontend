import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { useEffect, useRef, useMemo, Component } from 'react';
import { SocketProvider } from './context/SocketContext';
import { createAppTheme } from './utils/theme';
import useStore from './store/useStore';

// Layout
import MainLayout from './components/layout/MainLayout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

// Error Boundary Component
class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Something went wrong.</h2>
          <p>Error: {this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, user } = useStore();
  console.log('PrivateRoute: isAuthenticated:', isAuthenticated, 'user:', user);
  return isAuthenticated && user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useStore();
  console.log('PublicRoute: isAuthenticated:', isAuthenticated, 'user:', user);
  return !isAuthenticated || !user ? children : <Navigate to="/dashboard" />;
};

const App = () => {
  const { theme, isAuthenticated, user, setUser, logout } = useStore();
  const authCheckRef = useRef(false);

  // Memoize the theme to prevent unnecessary recreations
  const appTheme = useMemo(() => createAppTheme(theme), [theme]);

  console.log('App render: isAuthenticated:', isAuthenticated, 'user:', user);

  // Check authentication on app load - only once
  useEffect(() => {
    console.log('App useEffect triggered');
    if (authCheckRef.current) {
      console.log('Auth check already performed, skipping');
      return;
    }
    authCheckRef.current = true;

    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    console.log('Auth check - token:', !!token, 'storedUser:', !!storedUser);
    
    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && (parsedUser._id || parsedUser.email)) {
          console.log('Setting user from localStorage:', parsedUser);
          setUser(parsedUser);
          
          // If user doesn't have profilePicture or it's outdated, fetch fresh profile
          if (!parsedUser.profilePicture || !parsedUser.profilePicture.url) {
            console.log('User missing profilePicture, fetching fresh profile data');
            fetchUserProfile(token);
          }
        } else {
          console.log('Invalid user data, logging out');
          logout();
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
        logout();
      }
    } else if (!token && isAuthenticated) {
      console.log('No token but authenticated, clearing state');
      logout();
    }
  }, []); // Empty dependency array to run only once

  // Function to fetch fresh user profile data
  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fresh profile data fetched:', data);
        if (data.user) {
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
        }
      } else {
        console.error('Failed to fetch profile:', response.status);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  return (
    <AppErrorBoundary>
      <ThemeProvider theme={appTheme}>
        <CssBaseline />
        <SocketProvider>
          <Router>
            <Routes>
              {/* Public routes */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                }
              />
              <Route
                path="/forgot-password"
                element={
                  <PublicRoute>
                    <ForgotPassword />
                  </PublicRoute>
                }
              />
              <Route
                path="/reset-password"
                element={
                  <PublicRoute>
                    <ResetPassword />
                  </PublicRoute>
                }
              />
              <Route
                path="/verify-email"
                element={
                  <PublicRoute>
                    <VerifyEmail />
                  </PublicRoute>
                }
              />

              {/* Protected routes */}
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <MainLayout />
                  </PrivateRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="chat" element={<Chat />} />
                <Route path="chat/:userId" element={<Chat />} />
                <Route path="chat/group/:groupId" element={<Chat />} />
                <Route path="profile" element={<Profile />} />
                <Route path="settings" element={<Settings />} />
              </Route>

              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </SocketProvider>
      </ThemeProvider>
    </AppErrorBoundary>
  );
};

export default App;




