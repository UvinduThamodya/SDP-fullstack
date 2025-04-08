import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import Sidebar from './Sidebar';

const Order = () => {
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
            Orders
          </Typography>
          <Typography variant="body1">
            Manage all your restaurant orders here. You can view, update, and track order status.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Order;
