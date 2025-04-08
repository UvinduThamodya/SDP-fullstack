import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import Sidebar from './Sidebar';

const Profile = () => {
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
            Profile
          </Typography>
          <Typography variant="body1">
            View and manage your account details, preferences, and settings.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Profile;
