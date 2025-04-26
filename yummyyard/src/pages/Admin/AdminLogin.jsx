import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import Logo from '../../assets/YummyYard_logo.png';

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Use your existing staff login route with requireAdmin flag
      const response = await fetch('http://localhost:5000/api/staff/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...credentials, requireAdmin: true })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Verify admin role
      if (data.user?.role !== 'Admin') {
        throw new Error('Access denied: Not an admin');
      }

      // Store admin data in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('adminId', data.user.id);

      // Redirect to admin dashboard
      navigate('/admindashboard');
      
    } catch (err) {
      setError(err.message || 'Invalid admin credentials');
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
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <AdminPanelSettingsIcon sx={{ fontSize: 40, mr: 1, color: 'primary.main' }} />
              <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
                Admin Portal
              </Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Enter your credentials to access the admin dashboard
            </Typography>
            
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={credentials.email}
                onChange={handleChange}
                sx={{ mb: 3 }}
                required
              />
              
              <TextField
                fullWidth
                label="Password"
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                sx={{ mb: 3 }}
                required
              />
              
              <Button 
                type="submit" 
                fullWidth 
                variant="contained" 
                disabled={loading}
                sx={{ py: 2, backgroundColor: 'black' }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Login as Admin'}
              </Button>
              
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Not an admin? <Button 
                    variant="text" 
                    size="small" 
                    onClick={() => navigate('/staffLogin')}
                  >
                    Staff Login
                  </Button>
                </Typography>
              </Box>
            </form>
          </Grid>
          
          {/* Right Side - Logo */}
          <Grid item xs={12} md={6} sx={{ 
            backgroundColor: '#00E676',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 4,
            borderTopRightRadius: 12,
            borderBottomRightRadius: 12
          }}>
            <img src={Logo} alt="YummyYard Logo" style={{ maxWidth: '100%' }} />
          </Grid>
        </Grid>
      </Paper>
      
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setError('')} sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminLogin;
