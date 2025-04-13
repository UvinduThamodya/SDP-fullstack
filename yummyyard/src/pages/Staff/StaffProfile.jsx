import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Paper, Avatar, Grid, Divider, TextField, Button } from '@mui/material';
import SidebarStaff from '../../components/SidebarStaff';

const StaffProfile = () => {
  // State to store staff profile data
  const [staffData, setStaffData] = useState({
    name: '',
    email: '',
    phone: '',
    role: ''
  });
  
  // State for edit mode
  const [isEditing, setIsEditing] = useState(false);
  
  // Load staff profile data on component mount
  useEffect(() => {
    const staffId = localStorage.getItem('staffId'); // Retrieve staffId from localStorage
    
    if (!staffId) {
      console.error('Staff ID is null or missing');
      return;
    }
  
    const fetchStaffData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/staff/${staffId}`);
        const data = await response.json();
        
        if (data.success) {
          setStaffData(data.staff);
        }
      } catch (error) {
        console.error('Error fetching staff data:', error);
      }
    };
    
    fetchStaffData();
  }, []);
  
  
  // Handle input changes when editing
  const handleChange = (e) => {
    const { name, value } = e.target;
    setStaffData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle save profile
  const handleSaveProfile = async () => {
    try {
      const staffId = localStorage.getItem('staffId');
      
      // Replace with your actual API endpoint
      const response = await fetch(`http://localhost:5000/api/staff/${staffId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(staffData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Exit edit mode after successful save
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <SidebarStaff />
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
            Staff Profile
          </Typography>
          
          <Paper elevation={3} sx={{ p: 4, mt: 3 }}>
            <Grid container spacing={3}>
              {/* Profile Header */}
              <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar 
                  sx={{ 
                    width: 100, 
                    height: 100, 
                    bgcolor: '#10b981',
                    fontSize: '2rem',
                    mr: 3 
                  }}
                >
                  {staffData.name ? staffData.name.charAt(0).toUpperCase() : 'S'}
                </Avatar>
                <Box>
                  <Typography variant="h5">{staffData.name}</Typography>
                  <Typography variant="body1" color="text.secondary">
                    {staffData.role}
                  </Typography>
                </Box>
                <Button 
                  variant="contained" 
                  sx={{ ml: 'auto' }}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </Button>
              </Grid>
              
              <Divider sx={{ width: '100%', my: 2 }} />
              
              {/* Profile Details */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Personal Information
                </Typography>
                
                {isEditing ? (
                  // Edit Mode
                  <>
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="name"
                      value={staffData.name}
                      onChange={handleChange}
                      margin="normal"
                    />
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      value={staffData.email}
                      onChange={handleChange}
                      margin="normal"
                    />
                    <TextField
                      fullWidth
                      label="Phone"
                      name="phone"
                      value={staffData.phone}
                      onChange={handleChange}
                      margin="normal"
                    />
                    <Button 
                      variant="contained" 
                      color="primary"
                      onClick={handleSaveProfile}
                      sx={{ mt: 2 }}
                    >
                      Save Changes
                    </Button>
                  </>
                ) : (
                  // View Mode
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body1">
                      <strong>Name:</strong> {staffData.name}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 2 }}>
                      <strong>Email:</strong> {staffData.email}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 2 }}>
                      <strong>Phone:</strong> {staffData.phone}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 2 }}>
                      <strong>Role:</strong> {staffData.role}
                    </Typography>
                  </Box>
                )}
              </Grid>
            </Grid>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};

export default StaffProfile;
