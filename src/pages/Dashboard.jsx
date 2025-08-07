import React from 'react';
import Dashboard from '../components/Dashboard';
import { Box } from '@mui/material';

const DashboardPage = () => {
  return (
    <Box sx={{ 
      width: '100%',
      height: '100%',
      overflow: 'auto',
      bgcolor: 'background.default',
      p: { xs: 1, sm: 2, md: 3 }
    }}>
      <Dashboard />
    </Box>
  );
};

export default DashboardPage;
