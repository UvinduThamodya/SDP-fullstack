import React from 'react';
import { Box, Typography, Container, Grid, Paper } from '@mui/material';
import SidebarAdmin from '../../components/SidebarAdmin'; // Import the Admin Sidebar

const AdminDashboard = () => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f9fa', fontFamily: 'Poppins, sans-serif' }}>
      {/* Admin Sidebar */}
      <SidebarAdmin />

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" align="center" sx={{ mb: 4, fontWeight: 'bold' }}>
            Admin Dashboard
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={4}>
              <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Total Users
                </Typography>
                <Typography variant="h4" sx={{ mt: 2 }}>
                  120
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Total Orders
                </Typography>
                <Typography variant="h4" sx={{ mt: 2 }}>
                  45
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Revenue
                </Typography>
                <Typography variant="h4" sx={{ mt: 2 }}>
                  $12,345
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default AdminDashboard;