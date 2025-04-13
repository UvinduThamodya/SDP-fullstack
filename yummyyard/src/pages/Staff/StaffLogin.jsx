import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  Snackbar,
  Alert
} from '@mui/material';
import Logo from '../../assets/YummyYard_logo.png';

const StaffLogin = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'error' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await apiService.loginStaff(credentials); // Ensure this calls the correct API endpoint
      
      // Store staff ID and other data in localStorage
      localStorage.setItem('staffId', response.user.id); // Ensure response.user.id exists
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setAlert({
        open: true,
        message: 'Login successful! Redirecting...',
        severity: 'success'
      });
      
      // Redirect based on role
      setTimeout(() => {
        if (response.user.role === 'Admin') {
          navigate('/admin-dashboard');
        } else {
          navigate('/dashboard');
        }
      }, 1500);
      
    } catch (error) {
      console.error('Login error:', error);
      setAlert({
        open: true,
        message: error.response?.data?.error || 'Invalid staff credentials. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  return (
    <Box sx={{ 
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f5f5f5'
    }}>
      <Paper elevation={3} sx={{ width: '90%', maxWidth: 1000, borderRadius: 3, overflow: 'hidden' }}>
        <Grid container>
          {/* Left Side - Form */}
          <Grid item xs={12} md={6} sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom>
              Staff Portal
            </Typography>
            
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={credentials.email}
                onChange={handleChange}
                required
                sx={{ mb: 3 }}
              />
              
              <TextField
                fullWidth
                label="Password"
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                required
                sx={{ mb: 3 }}
              />
              
              <Button 
                type="submit" 
                fullWidth 
                variant="contained" 
                disabled={loading}
                sx={{ py: 2 }}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </Grid>
          
          {/* Right Side - Logo */}
          <Grid item xs={12} md={6} sx={{ 
            backgroundColor: '#10b981', // Updated to match your other components
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 4
          }}>
            <img src={Logo} alt="Yummy Yard Logo" style={{ maxWidth: '100%' }} />
          </Grid>
        </Grid>
      </Paper>
      
      <Snackbar open={alert.open} autoHideDuration={6000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity={alert.severity} sx={{ width: '100%' }}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StaffLogin;
