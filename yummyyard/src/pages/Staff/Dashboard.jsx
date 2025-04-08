import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import Sidebar from '../../components/SidebarStaff';

const Dashboard = () => {
  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          backgroundColor: '#f5f5f5',
          minHeight: '100vh'
        }}
      >
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="body1">
            Welcome to your Yummy Yard dashboard. Here you'll find all important information about your restaurant.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Dashboard;
