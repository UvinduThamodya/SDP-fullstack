import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api'; // Replace with your API service
import {
  Box,
  Button,
  Grid,
  Paper,
  TextField,
  Typography,
  Snackbar,
  Alert
} from '@mui/material';
import Logo from '../../assets/YummyYard_logo.png'; // Replace with your logo path

const StaffRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'Staff' // Default role for staff registration
  });

  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
  
    try {
      // Use apiService.register() for staff registration
      await apiService.register(formData);
  
      setAlert({
        open: true,
        message: 'Registration successful! Redirecting to login...',
        severity: 'success',
      });
  
      // Redirect to login after success
      setTimeout(() => navigate('/staff-login'), 3000);
    } catch (error) {
      console.error('Registration error:', error);
      setAlert({
        open: true,
        message: error.response?.data?.error || 'Registration failed. Please try again.',
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'url(../public/Background.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          width: '90%',
          maxWidth: '1000px',
          borderRadius: 3,
          overflow: 'hidden',
          padding: 0,
        }}
      >
        <Grid container>
          {/* Left Column - Registration Form */}
          <Grid item xs={12} md={6} sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom>
              Staff Registration
            </Typography>
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                sx={{ mb: 2 }}
              />
              <Button 
                type="submit" 
                fullWidth 
                variant="contained" 
                color="primary" 
                disabled={isLoading}
                sx={{ py: 1.5 }}
              >
                {isLoading ? 'Registering...' : 'Register'}
              </Button>
            </form>
          </Grid>

          {/* Right Column - Logo */}
          <Grid item xs={12} md={6} sx={{ 
            backgroundColor: '#10b981', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            p: 4 
          }}>
            <Box sx={{ width: '100%', maxWidth: '500px' }}>
              <img src={Logo} alt="Yummy Yard Logo" style={{ width: '100%', height: 'auto' }} />
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Snackbar for alerts */}
      <Snackbar open={alert.open} autoHideDuration={3000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity={alert.severity} sx={{ width: '100%' }}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StaffRegister;
