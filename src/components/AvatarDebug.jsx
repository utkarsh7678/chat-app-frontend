import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import useStore from '../store/useStore';

const AvatarDebug = () => {
  const { user, token } = useStore();
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    if (user) {
      const avatarUrl = user?.profilePicture?.url ? 
        `${import.meta.env.VITE_API_URL}${user.profilePicture.url}` : 
        null;

      setDebugInfo({
        hasUser: !!user,
        userId: user._id,
        username: user.username,
        email: user.email,
        hasProfilePicture: !!user.profilePicture,
        profilePictureData: user.profilePicture,
        avatarUrl: avatarUrl,
        apiUrl: import.meta.env.VITE_API_URL,
        hasToken: !!token
      });
    }
  }, [user, token]);

  if (!user) {
    return (
      <Paper sx={{ p: 2, m: 2 }}>
        <Typography variant="h6" color="error">
          🔍 Avatar Debug: No User Data
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2, m: 2 }}>
      <Typography variant="h6" gutterBottom>
        🔍 Avatar Debug Information
      </Typography>
      
      <Box sx={{ fontFamily: 'monospace', fontSize: '12px' }}>
        <div><strong>User ID:</strong> {debugInfo.userId}</div>
        <div><strong>Username:</strong> {debugInfo.username}</div>
        <div><strong>Email:</strong> {debugInfo.email}</div>
        <div><strong>Has Token:</strong> {debugInfo.hasToken ? '✅' : '❌'}</div>
        <div><strong>Has ProfilePicture:</strong> {debugInfo.hasProfilePicture ? '✅' : '❌'}</div>
        
        {debugInfo.hasProfilePicture && (
          <>
            <div><strong>Avatar URL in DB:</strong> {debugInfo.profilePictureData?.url}</div>
            <div><strong>Avatar Key:</strong> {debugInfo.profilePictureData?.key}</div>
            <div><strong>Last Updated:</strong> {debugInfo.profilePictureData?.lastUpdated}</div>
            <div><strong>API URL:</strong> {debugInfo.apiUrl}</div>
            <div><strong>Full Avatar URL:</strong> {debugInfo.avatarUrl}</div>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2">Avatar Preview:</Typography>
              <img 
                src={debugInfo.avatarUrl} 
                alt="Avatar" 
                style={{ width: 50, height: 50, borderRadius: '50%' }}
                onError={(e) => {
                  e.target.style.border = '2px solid red';
                  e.target.alt = 'Failed to load';
                }}
                onLoad={(e) => {
                  e.target.style.border = '2px solid green';
                }}
              />
            </Box>
          </>
        )}
      </Box>
    </Paper>
  );
};

export default AvatarDebug;
