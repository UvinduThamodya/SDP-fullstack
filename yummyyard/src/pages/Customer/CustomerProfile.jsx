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
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
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
import DeleteIcon from '@mui/icons-material/Delete';
import Navbar from '../../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { Visibility, VisibilityOff } from '@mui/icons-material';

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

  const [deleteRequest, setDeleteRequest] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Password change state
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordFields, setPasswordFields] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

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

  useEffect(() => {
    const checkDeleteRequests = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        const response = await fetch('http://localhost:5000/api/customers/delete-requests', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setDeleteRequest(data.hasDeleteRequest);
        }
      } catch (error) {
        console.error('Error checking delete requests:', error);
      }
    };
    checkDeleteRequests();
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

  const handleAcceptDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/customers/accept-delete', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
      }
    } catch (error) {
      console.error('Error accepting delete request:', error);
    }
  };

  const handleRejectDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/customers/reject-delete', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        setDeleteRequest(false);
        setNotification({
          open: true,
          message: 'Delete request rejected',
          severity: 'success',
        });
      }
    } catch (error) {
      console.error('Error rejecting delete request:', error);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const response = await fetch('http://localhost:5000/api/customers/profile', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error('Failed to delete account');
      }
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setDeleteDialogOpen(false);
      navigate('/');
    } catch (error) {
      setNotification({
        open: true,
        message: 'Failed to delete account: ' + error.message,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Password field handlers
  const handlePasswordFieldChange = (e) => {
    const { name, value } = e.target;
    setPasswordFields({ ...passwordFields, [name]: value });
  };
  const handleClickShowPassword = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!passwordFields.currentPassword || !passwordFields.newPassword || !passwordFields.confirmPassword) {
      setNotification({
        open: true,
        message: 'All password fields are required.',
        severity: 'error'
      });
      return;
    }
    if (passwordFields.newPassword !== passwordFields.confirmPassword) {
      setNotification({
        open: true,
        message: 'New passwords do not match.',
        severity: 'error'
      });
      return;
    }
    if (passwordFields.newPassword.length < 6) {
      setNotification({
        open: true,
        message: 'New password must be at least 6 characters.',
        severity: 'error'
      });
      return;
    }
    try {
      setPasswordLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/customers/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordFields.currentPassword,
          newPassword: passwordFields.newPassword
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to change password');
      }
      setNotification({
        open: true,
        message: 'Password changed successfully!',
        severity: 'success'
      });
      setPasswordFields({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setNotification({
        open: true,
        message: error.message,
        severity: 'error'
      });
    } finally {
      setPasswordLoading(false);
    }
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
                  background: `linear-gradient(to right, #11998e, #38ef7d)`,
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
                          <Button
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => setDeleteDialogOpen(true)}
                            sx={{
                              borderColor: 'white',
                              color: 'white',
                              borderRadius: 3,
                              borderWidth: 2,
                              px: 3,
                              '&:hover': {
                                borderColor: theme.palette.error.main,
                                bgcolor: alpha(theme.palette.error.main, 0.1),
                                boxShadow: 2
                              }
                            }}
                          >
                            Delete Account
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
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 600,
                            mb: 1,
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <PersonIcon sx={{ mr: 1, color: theme.palette.primary.main }} /> Full Name
                        </Typography>
                        <TextField
                          fullWidth
                          name="name"
                          value={editMode ? formValues.name : customer.name}
                          onChange={handleChange}
                          disabled={!editMode || loading}
                          variant={editMode ? "outlined" : "filled"}
                          InputProps={{
                            readOnly: !editMode,
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
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 600,
                            mb: 1,
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <EmailIcon sx={{ mr: 1, color: theme.palette.primary.main }} /> Email Address
                        </Typography>
                        <TextField
                          fullWidth
                          name="email"
                          type="email"
                          value={editMode ? formValues.email : customer.email}
                          onChange={handleChange}
                          disabled={!editMode || loading}
                          variant={editMode ? "outlined" : "filled"}
                          InputProps={{
                            readOnly: !editMode,
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
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 600,
                            mb: 1,
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <PhoneIcon sx={{ mr: 1, color: theme.palette.primary.main }} /> Phone Number
                        </Typography>
                        <TextField
                          fullWidth
                          name="phone"
                          value={editMode ? formValues.phone : customer.phone}
                          onChange={handleChange}
                          disabled={!editMode || loading}
                          variant={editMode ? "outlined" : "filled"}
                          InputProps={{
                            readOnly: !editMode,
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
                    </Grid>
                    {/* Change Password Section */}
                    <Divider sx={{ my: 4 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Change Password
                    </Typography>
                    <Box component="form" onSubmit={handlePasswordChange} sx={{ maxWidth: 400 }}>
                      <TextField
                        fullWidth
                        label="Current Password"
                        name="currentPassword"
                        type={showPassword.current ? 'text' : 'password'
                        }
                        value={passwordFields.currentPassword}
                        onChange={handlePasswordFieldChange}
                        margin="normal"
                        InputProps={{
                          endAdornment: (
                            <Button
                              onClick={() => handleClickShowPassword('current')}
                              tabIndex={-1}
                              sx={{ minWidth: 0, p: 0, color: 'inherit' }}
                            >
                              {showPassword.current ? <VisibilityOff /> : <Visibility />}
                            </Button>
                          )
                        }}
                      />
                      <TextField
                        fullWidth
                        label="New Password"
                        name="newPassword"
                        type={showPassword.new ? 'text' : 'password'}
                        value={passwordFields.newPassword}
                        onChange={handlePasswordFieldChange}
                        margin="normal"
                        InputProps={{
                          endAdornment: (
                            <Button
                              onClick={() => handleClickShowPassword('new')}
                              tabIndex={-1}
                              sx={{ minWidth: 0, p: 0, color: 'inherit' }}
                            >
                              {showPassword.new ? <VisibilityOff /> : <Visibility />}
                            </Button>
                          )
                        }}
                      />
                      <TextField
                        fullWidth
                        label="Confirm New Password"
                        name="confirmPassword"
                        type={showPassword.confirm ? 'text' : 'password'}
                        value={passwordFields.confirmPassword}
                        onChange={handlePasswordFieldChange}
                        margin="normal"
                        InputProps={{
                          endAdornment: (
                            <Button
                              onClick={() => handleClickShowPassword('confirm')}
                              tabIndex={-1}
                              sx={{ minWidth: 0, p: 0, color: 'inherit' }}
                            >
                              {showPassword.confirm ? <VisibilityOff /> : <Visibility />}
                            </Button>
                          )
                        }}
                      />
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        sx={{ mt: 2, minWidth: 160 }}
                        disabled={passwordLoading}
                      >
                        {passwordLoading ? <CircularProgress size={20} color="inherit" /> : 'Change Password'}
                      </Button>
                    </Box>
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

      <Dialog
        open={deleteRequest}
        PaperProps={{ sx: { borderRadius: 2, px: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 600, color: 'error.main' }}>
          Account Deletion Request
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            An administrator has requested to delete your account. Do you want to accept this request? If accepted, your account will be permanently deleted.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 2 }}>
          <Button
            onClick={handleRejectDelete}
            variant="outlined"
            sx={{ borderRadius: 6 }}
          >
            Reject
          </Button>
          <Button
            onClick={handleAcceptDelete}
            color="error"
            variant="contained"
            sx={{ borderRadius: 6 }}
          >
            Accept & Delete My Account
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: 2, px: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 600, color: 'error.main' }}>
          Delete Account
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete your account? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 2 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            variant="outlined"
            sx={{ borderRadius: 6 }}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteAccount}
            color="error"
            variant="contained"
            sx={{ borderRadius: 6 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomerProfile;