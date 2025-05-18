import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import {
  Box,
  Button,
  Grid,
  Paper,
  TextField,
  Typography,
  Snackbar,
  Alert,
  ThemeProvider,
  createTheme,
  CssBaseline
} from '@mui/material';
import Logo from '../../assets/YummyYard_logo.png';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Background from '../../assets/Background.jpg';
import '@fontsource/poppins/300.css';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';

// Create a custom theme with Poppins font
const theme = createTheme({
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 500,
      textTransform: 'none',
    },
  },
  palette: {
    primary: {
      main: '#10b981', // Using the green from the logo section
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#3f51b5',
    },
    background: {
      default: '#f7f9fc',
    },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&.Mui-focused fieldset': {
              borderColor: '#10b981',
            },
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#10b981',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 4px 10px rgba(16, 185, 129, 0.2)',
          '&:hover': {
            boxShadow: '0 6px 15px rgba(16, 185, 129, 0.3)',
          },
        },
      },
    },
  },
});

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

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setAlert({
        open: true,
        message: 'Please enter a valid email address.',
        severity: 'error',
      });
      return;
    }

    // Phone number validation (10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      setAlert({
        open: true,
        message: 'Please enter a valid 10-digit phone number.',
        severity: 'error',
      });
      return;
    }

    // Password length validation
    if (formData.password.length < 7) {
      setAlert({
        open: true,
        message: 'Password must be at least 7 characters long.',
        severity: 'error',
      });
      return;
    }

    setIsLoading(true);
  
    try {
      // Use apiService.register() for staff registration
      await apiService.registerStaff(formData);
  
      setAlert({
        open: true,
        message: 'Registration successful! Redirecting to accounts...',
        severity: 'success',
      });
  
      // Redirect to login after success
      setTimeout(() => navigate('/accounts'), 3000);
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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          backgroundImage: `url(${Background})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          py: 4
        }}
      >
        <Paper 
          elevation={6} 
          sx={{ 
            width: '90%',
            maxWidth: '1000px',
            borderRadius: 4,
            overflow: 'hidden',
            padding: 0,
            margin: 'auto',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
          }}
        >
          <Grid container>
            {/* Left Column - Registration Form */}
            <Grid item xs={12} md={6} sx={{ 
              p: { xs: 3, md: 5 }, 
              position: 'relative', 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center'
            }}>
              {/* Back Button */}
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/accounts')}
                sx={{
                  position: 'absolute',
                  top: 16,
                  left: 16,
                  color: 'primary.main',
                  fontWeight: 600,
                  background: 'rgba(16, 185, 129, 0.05)',
                  '&:hover': { background: 'rgba(16, 185, 129, 0.1)' }
                }}
              >
                Back
              </Button>

              <Box sx={{ mb: 4, mt: { xs: 5, md: 2 } }}>
                <Typography 
                  variant="h4" 
                  gutterBottom 
                  sx={{ 
                    textAlign: 'center', 
                    color: '#333',
                    fontWeight: 600,
                    mb: 1
                  }}
                >
                  Staff Registration
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    textAlign: 'center', 
                    color: '#666',
                    mb: 3
                  }}
                >
                  Join our team and start your journey with us
                </Typography>
              </Box>

              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  sx={{ mb: 2.5 }}
                  InputProps={{
                    style: { fontSize: '15px' }
                  }}
                />
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  sx={{ mb: 2.5 }}
                  InputProps={{
                    style: { fontSize: '15px' }
                  }}
                />
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  sx={{ mb: 2.5 }}
                  InputProps={{
                    style: { fontSize: '15px' }
                  }}
                />
                <TextField
                  fullWidth
                  label="Password (min 7 characters)"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  sx={{ mb: 3.5 }}
                  InputProps={{
                    style: { fontSize: '15px' }
                  }}
                />
                <Button 
                  type="submit" 
                  fullWidth 
                  variant="contained" 
                  color="primary" 
                  disabled={isLoading}
                  sx={{ 
                    py: 1.5, 
                    fontSize: '16px',
                    fontWeight: 500,
                    letterSpacing: '0.5px'
                  }}
                >
                  {isLoading ? 'Registering...' : 'Register Now'}
                </Button>
              </form>
            </Grid>

            {/* Right Column - Logo */}
            <Grid item xs={12} md={6} sx={{ 
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'center', 
              alignItems: 'center', 
              p: 4,
              position: 'relative',
              overflow: 'hidden'
            }}>
              <Box 
                sx={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  right: 0, 
                  bottom: 0, 
                  opacity: 0.1, 
                  background: 'radial-gradient(circle, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 70%)'
                }} 
              />
              <Box sx={{ 
                width: '100%', 
                maxWidth: '400px', 
                position: 'relative', 
                zIndex: 2,
                textAlign: 'center'
              }}>
                <img src={Logo} alt="Yummy Yard Logo" style={{ width: '100%', height: 'auto' }} />
              </Box>
            </Grid>
          </Grid>
        </Paper>
        
        {/* Snackbar for alerts */}
        <Snackbar open={alert.open} autoHideDuration={3000} onClose={handleCloseAlert}>
          <Alert 
            onClose={handleCloseAlert} 
            severity={alert.severity} 
            sx={{ 
              width: '100%',
              fontSize: '15px', 
              '& .MuiAlert-icon': { fontSize: '24px' } 
            }}
          >
            {alert.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

export default StaffRegister;
