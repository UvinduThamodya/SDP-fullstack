import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Grid,
  Container,
  Divider,
  Snackbar,
  Alert,
  CircularProgress,
  Avatar,
  Card,
  CardContent,
  useTheme,
  alpha
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import HomeIcon from '@mui/icons-material/Home';
import BadgeIcon from '@mui/icons-material/Badge';
import SecurityIcon from '@mui/icons-material/Security';
import Navbar from '../../components/Navbar';
import { useNavigate } from 'react-router-dom';

const CustomerProfile = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  
  // Add loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get customer data from localStorage as initial default
  const [customer, setCustomer] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '12345678',
      address: '123 Main St'
    };
  });

  // State for edit mode
  const [editMode, setEditMode] = useState(false);
  
  // State for form values
  const [formValues, setFormValues] = useState({...customer});
  
  // State for notifications
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    const fetchCustomerProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          navigate('/login');
          return;
        }
        
        const response = await fetch('http://localhost:5000/api/customers/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        
        const data = await response.json();
        setCustomer(data);
        setFormValues(data);
        
        // Cache the user data in localStorage
        localStorage.setItem('user', JSON.stringify(data));
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError(error.message);
        setNotification({
          open: true,
          message: 'Failed to load profile data: ' + error.message,
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchCustomerProfile();
  }, [navigate]);

  const handleEditClick = () => {
    setEditMode(true);
    setFormValues({...customer});
  };

  const handleSaveClick = async () => {
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formValues.email)) {
      setNotification({
        open: true,
        message: 'Invalid email format.',
        severity: 'error'
      });
      return;
    }
  
    // Phone number validation
    const phoneRegex = /^\d{10}$/; // Assuming phone number should be 10 digits
    if (!phoneRegex.test(formValues.phone)) {
      setNotification({
        open: true,
        message: 'Invalid phone number. It should be 10 digits.',
        severity: 'error'
      });
      return;
    }
  
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }
      
      const response = await fetch('http://localhost:5000/api/customers/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formValues)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      const data = await response.json();
      
      // Update state with the returned data
      setCustomer(data.user || formValues);
      setEditMode(false);
      
      // Cache the updated user data in localStorage
      localStorage.setItem('user', JSON.stringify(data.user || formValues));
      
      // Show success notification
      setNotification({
        open: true,
        message: 'Profile updated successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setNotification({
        open: true,
        message: 'Failed to update profile: ' + error.message,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = () => {
    setEditMode(false);
    setFormValues({...customer});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value
    });
  };

  const handleNotificationClose = () => {
    setNotification({...notification, open: false});
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh', 
      bgcolor: '#fdfef8' // Updated background color
    }}>
      <Navbar />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: 10,
          pb: 6,
          px: { xs: 2, sm: 4, md: 6 }
        }}
      >
        <Container maxWidth="lg">
          {loading && !editMode ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              height: '60vh'
            }}>
              <CircularProgress size={60} thickness={4} />
            </Box>
          ) : error && !customer ? (
            <Alert 
              severity="error"
              sx={{ 
                borderRadius: 2, 
                py: 2,
                boxShadow: 3 
              }}
            >
              Error loading profile data. Please try again later.
            </Alert>
          ) : (
            <Box>
              {/* Welcome Banner with User Information */}
              <Card 
                elevation={4} 
                sx={{ 
                  mb: 4, 
                  borderRadius: 4,
                  overflow: 'visible',
                  position: 'relative',
                  background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
                  color: 'white',
                  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 8
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    flexWrap: { xs: 'wrap', md: 'nowrap' },
                    gap: 3
                  }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 3, 
                      mb: { xs: 2, md: 0 },
                      width: { xs: '100%', md: 'auto' }
                    }}>
                      <Avatar 
                        sx={{ 
                          width: { xs: 70, md: 90 }, 
                          height: { xs: 70, md: 90 }, 
                          bgcolor: 'white',
                          color: theme.palette.primary.main,
                          boxShadow: 3,
                          fontSize: { xs: 36, md: 45 },
                          border: `4px solid ${alpha(theme.palette.common.white, 0.6)}`,
                          transition: 'transform 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.05)'
                          }
                        }}
                      >
                        {customer.name ? customer.name.charAt(0).toUpperCase() : 'U'}
                      </Avatar>
                      <Box>
                        <Typography 
                          variant="h4" 
                          sx={{ 
                            fontWeight: 'bold',
                            textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
                          }}
                        >
                          Welcome, {customer.name.split(' ')[0]}!
                        </Typography>
                        <Typography 
                          variant="subtitle1"
                          sx={{ opacity: 0.9, mt: 0.5 }}
                        >
                          {customer.email}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 2,
                      flexWrap: { xs: 'wrap', sm: 'nowrap' },
                      width: { xs: '100%', md: 'auto' },
                      justifyContent: { xs: 'center', md: 'flex-end' }
                    }}>
                      {!editMode ? (
                        <>
                          <Button 
                            variant="contained" 
                            startIcon={<EditIcon />}
                            onClick={handleEditClick}
                            sx={{ 
                              bgcolor: 'white', 
                              color: theme.palette.primary.main,
                              fontWeight: 'bold',
                              borderRadius: 3,
                              px: 3,
                              boxShadow: 2,
                              '&:hover': {
                                bgcolor: alpha(theme.palette.common.white, 0.9),
                                boxShadow: 4
                              },
                              transition: 'transform 0.2s ease',
                              '&:active': {
                                transform: 'scale(0.98)'
                              }
                            }}
                          >
                            Edit Profile
                          </Button>
                          <Button
                            variant="outlined"
                            startIcon={<LogoutIcon />}
                            onClick={handleLogout}
                            sx={{ 
                              borderColor: 'white', 
                              color: 'white',
                              borderRadius: 3,
                              borderWidth: 2,
                              px: 3,
                              '&:hover': {
                                borderColor: alpha(theme.palette.common.white, 0.9),
                                bgcolor: alpha(theme.palette.common.white, 0.1),
                                boxShadow: 2
                              }
                            }}
                          >
                            Logout
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button 
                            variant="outlined" 
                            startIcon={<CancelIcon />}
                            onClick={handleCancelClick}
                            sx={{ 
                              borderColor: 'white', 
                              color: 'white',
                              borderRadius: 3,
                              borderWidth: 2,
                              px: 3,
                              '&:hover': {
                                borderColor: alpha(theme.palette.common.white, 0.9),
                                bgcolor: alpha(theme.palette.common.white, 0.1),
                                boxShadow: 2
                              }
                            }}
                            disabled={loading}
                          >
                            Cancel
                          </Button>
                          <Button 
                            variant="contained" 
                            startIcon={loading ? null : <SaveIcon />}
                            onClick={handleSaveClick}
                            sx={{ 
                              bgcolor: 'white', 
                              color: theme.palette.primary.main,
                              fontWeight: 'bold',
                              borderRadius: 3,
                              px: 3,
                              boxShadow: 2,
                              '&:hover': {
                                bgcolor: alpha(theme.palette.common.white, 0.9),
                                boxShadow: 4
                              }
                            }}
                            disabled={loading}
                          >
                            {loading ? <CircularProgress size={24} color="primary" /> : 'Save Changes'}
                          </Button>
                        </>
                      )}
                    </Box>
                  </Box>
                </CardContent>
                {/* Decorative elements */}
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    top: 15, 
                    right: 15, 
                    width: 80, 
                    height: 80, 
                    borderRadius: '50%', 
                    bgcolor: alpha(theme.palette.common.white, 0.1),
                    zIndex: 0
                  }} 
                />
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    bottom: -10, 
                    left: 100, 
                    width: 40, 
                    height: 40, 
                    borderRadius: '50%', 
                    bgcolor: alpha(theme.palette.common.white, 0.1),
                    zIndex: 0
                  }} 
                />
              </Card>

              {/* Personal Information Card */}
              <Grid container spacing={4}>
                <Grid item xs={12}>
                  <Paper 
                    elevation={3} 
                    sx={{ 
                      p: { xs: 3, md: 4 }, 
                      borderRadius: 4,
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        boxShadow: 6
                      }
                    }}
                  >
                    <Typography 
                      variant="h5" 
                      gutterBottom 
                      sx={{ 
                        fontWeight: 'bold',
                        color: theme.palette.primary.main,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        mb: 3
                      }}
                    >
                      <BadgeIcon sx={{ fontSize: 30 }} /> 
                      Personal Information
                    </Typography>
                    <Divider sx={{ 
                      mb: 4, 
                      borderColor: alpha(theme.palette.primary.main, 0.2),
                      borderWidth: 2
                    }} />
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Full Name"
                          name="name"
                          value={editMode ? formValues.name : customer.name}
                          onChange={handleChange}
                          disabled={!editMode || loading}
                          variant={editMode ? "outlined" : "filled"}
                          InputProps={{
                            readOnly: !editMode,
                            startAdornment: (
                              <PersonIcon sx={{ 
                                mr: 1.5, 
                                color: theme.palette.primary.main,
                                opacity: 0.7
                              }} />
                            ),
                          }}
                          sx={{
                            '& .MuiFilledInput-root': {
                              borderRadius: 2,
                              bgcolor: alpha(theme.palette.primary.main, 0.05),
                              '&.Mui-focused': {
                                bgcolor: alpha(theme.palette.primary.main, 0.08),
                              }
                            },
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&.Mui-focused': {
                                boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`
                              }
                            },
                            '& .MuiInputLabel-root': {
                              fontWeight: 500
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Email Address"
                          name="email"
                          type="email"
                          value={editMode ? formValues.email : customer.email}
                          onChange={handleChange}
                          disabled={!editMode || loading}
                          variant={editMode ? "outlined" : "filled"}
                          InputProps={{
                            readOnly: !editMode,
                            startAdornment: (
                              <EmailIcon sx={{ 
                                mr: 1.5, 
                                color: theme.palette.primary.main,
                                opacity: 0.7
                              }} />
                            ),
                          }}
                          sx={{
                            '& .MuiFilledInput-root': {
                              borderRadius: 2,
                              bgcolor: alpha(theme.palette.primary.main, 0.05),
                              '&.Mui-focused': {
                                bgcolor: alpha(theme.palette.primary.main, 0.08),
                              }
                            },
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&.Mui-focused': {
                                boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`
                              }
                            },
                            '& .MuiInputLabel-root': {
                              fontWeight: 500
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Phone Number"
                          name="phone"
                          value={editMode ? formValues.phone : customer.phone}
                          onChange={handleChange}
                          disabled={!editMode || loading}
                          variant={editMode ? "outlined" : "filled"}
                          InputProps={{
                            readOnly: !editMode,
                            startAdornment: (
                              <PhoneIcon sx={{ 
                                mr: 1.5, 
                                color: theme.palette.primary.main,
                                opacity: 0.7
                              }} />
                            ),
                          }}
                          sx={{
                            '& .MuiFilledInput-root': {
                              borderRadius: 2,
                              bgcolor: alpha(theme.palette.primary.main, 0.05),
                              '&.Mui-focused': {
                                bgcolor: alpha(theme.palette.primary.main, 0.08),
                              }
                            },
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&.Mui-focused': {
                                boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`
                              }
                            },
                            '& .MuiInputLabel-root': {
                              fontWeight: 500
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography
                          variant="body2"
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            color: theme.palette.text.secondary,
                            mb: 1
                          }}
                        >
                          <SecurityIcon fontSize="small" /> 
                          Your data is secure and encrypted
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Address"
                          name="address"
                          value={editMode ? formValues.address : customer.address}
                          onChange={handleChange}
                          disabled={!editMode || loading}
                          variant={editMode ? "outlined" : "filled"}
                          multiline
                          rows={3}
                          InputProps={{
                            readOnly: !editMode,
                            startAdornment: (
                              <HomeIcon sx={{ 
                                mr: 1.5, 
                                mt: 1,
                                color: theme.palette.primary.main,
                                opacity: 0.7
                              }} />
                            ),
                          }}
                          sx={{
                            '& .MuiFilledInput-root': {
                              borderRadius: 2,
                              bgcolor: alpha(theme.palette.primary.main, 0.05),
                              '&.Mui-focused': {
                                bgcolor: alpha(theme.palette.primary.main, 0.08),
                              }
                            },
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&.Mui-focused': {
                                boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`
                              }
                            },
                            '& .MuiInputLabel-root': {
                              fontWeight: 500
                            }
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
        </Container>
      </Box>

      {/* Notification */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleNotificationClose} 
          severity={notification.severity}
          variant="filled"
          sx={{ 
            borderRadius: 2,
            boxShadow: 4,
            width: '100%'
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CustomerProfile;