import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import apiService from '../../services/api';
import Logo from '../../assets/YummyYard_logo.png';

// Material UI imports
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  TextField,
  Typography,
  Snackbar,
  Alert,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });

  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const navigate = useNavigate();

  // Check if user is already logged in with valid token
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      // Optional: You can add token validation here
      navigate('/HomepageUser');
    }
    
    // Load saved email if "remember me" was checked
    const savedEmail = localStorage.getItem('email');
    if (savedEmail) {
      setCredentials(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckbox = (e) => {
    setRememberMe(e.target.checked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await apiService.loginCustomer(credentials);

      if (response.user) {
        // Store user info
        localStorage.setItem('user', JSON.stringify(response.user));
        
        // Store JWT token
        if (response.token) {
          localStorage.setItem('token', response.token);
        } else {
          console.warn('Warning: No token received from server');
        }

        if (rememberMe) {
          localStorage.setItem('email', credentials.email);
        } else {
          localStorage.removeItem('email');
        }

        setAlert({
          open: true,
          message: 'Login successful!',
          severity: 'success',
        });

        // Redirect to homepage after login
        setTimeout(() => {
          navigate('/HomepageUser');
        }, 2000);
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError('Invalid email or password. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setError('');
  }, [credentials]);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
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
          {/* Left Column - Login Form */}
          <Grid item xs={12} md={6} sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            padding: 3,
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            borderRadius: '15px 0 0 15px',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
          }}> 
            <Box sx={{ mb: 5 }}>
              <Typography variant="h4" component="h1" fontWeight="bold" sx={{ fontSize: '1.75rem' }}> 
                Welcome Back,
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ fontSize: '1rem' }}>
                Welcome again to an Island of Flavors
              </Typography>
            </Box>
            
            {error && (
              <Box sx={{ backgroundColor: '#ffebee', color: '#d32f2f', p: 3, borderRadius: 1, mb: 5 }}>
                {error}
              </Box>
            )}
            
            <Box component="form" onSubmit={handleSubmit} sx={{ flex: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email"
                name="email"
                autoComplete="email"
                placeholder="Your Email"
                autoFocus
                value={credentials.email}
                onChange={handleChange}
                sx={{ fontSize: '1.2rem' }}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={credentials.password}
                onChange={handleChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: { fontSize: '1.2rem' }
                }}
              />
              
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={rememberMe}
                    onChange={handleCheckbox}
                    name="rememberMe" 
                    color="primary"
                  />
                }
                label="Remember me"
                sx={{ mt: 1 }}
              />
              
              <Box sx={{ width: "100%", textAlign: "center", marginTop: 2 }}>
                <Typography variant="body2">
                  New for the island of flavours? <a href="/Register" style={{ color: '#4285F4', textDecoration: 'none' }}>Register in here!</a>
                </Typography>
              </Box>
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                disabled={isLoading}
                sx={{ mt: 3, mb: 3, py: 2, fontSize: '1.2rem' }}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </Box>
          </Grid>
          
          {/* Right Column - Logo Only */}
          <Grid item xs={12} md={6} sx={{ backgroundColor: '#10b981', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 3 }}>
            <Box sx={{ width: '100%', maxWidth: '500px' }}>
              <img src={Logo} alt="Yummy Yard Logo" style={{ width: '100%', height: 'auto' }} />
            </Box>
          </Grid>
        </Grid>
      </Paper>
      <Snackbar open={alert.open} autoHideDuration={3000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity={alert.severity} sx={{ width: '100%' }}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Login;
