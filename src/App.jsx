import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { useEffect, useRef, useMemo } from 'react';
import { SocketProvider } from './context/socketContext';
import { createAppTheme } from './utils/theme';
import { useAuth, useTheme } from './store/useStore';

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

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  console.log('PrivateRoute: isAuthenticated:', isAuthenticated, 'user:', user);
  return isAuthenticated && user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  console.log('PublicRoute: isAuthenticated:', isAuthenticated, 'user:', user);
  return !isAuthenticated || !user ? children : <Navigate to="/dashboard" />;
};

const App = () => {
  const { theme } = useTheme();
  const { isAuthenticated, user, setUser, logout } = useAuth();
  const authCheckRef = useRef(false);

  // Memoize the theme to prevent unnecessary recreations
  const appTheme = useMemo(() => createAppTheme(theme), [theme]);

  console.log('App render: isAuthenticated:', isAuthenticated, 'user:', user);

  // Check authentication on app load - only once
  useEffect(() => {
    if (authCheckRef.current) return;
    authCheckRef.current = true;

    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && (parsedUser._id || parsedUser.email)) {
          setUser(parsedUser);
        } else {
          // Invalid user data, clear everything
          logout();
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
        logout();
      }
    } else if (!token && isAuthenticated) {
      // No token but authenticated, clear state
      logout();
    }
  }, []); // Empty dependency array to run only once

  return (
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
  );
};

export default App;


