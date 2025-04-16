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
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await apiService.loginStaff(credentials);
      
      localStorage.setItem('staffId', response.user.id); 
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('staff', JSON.stringify(response.user));
      
      // Redirect based on role
      if(response.user.role === 'Admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/dashboard');
      }
      
    } catch (err) {
      setError('Invalid staff credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f5f5f5'
    }}>
      <Paper elevation={3} sx={{ width: '90%', maxWidth: 1000, borderRadius: 3 }}>
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
                value={credentials.email}
                onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                sx={{ mb: 3 }}
              />
              
              <TextField
                fullWidth
                label="Password"
                type="password"
                name="password"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
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
            backgroundColor: '#00E676',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 4
          }}>
            <img src={Logo} alt="Logo" style={{ maxWidth: '100%' }} />
          </Grid>
        </Grid>
      </Paper>
      
      <Snackbar open={!!error} onClose={() => setError('')}>
        <Alert severity="error">{error}</Alert>
      </Snackbar>
    </Box>
  );
};

export default StaffLogin;
