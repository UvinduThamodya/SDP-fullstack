import React, { useEffect, useState } from 'react';
import { Box, Typography, Container, Paper, Avatar, CircularProgress, Alert, Button, TextField, Snackbar, Divider } from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import Sidebar from '../../components/SidebarAdmin';
import apiService from '../../services/api';
import { useNavigate } from 'react-router-dom';

const AdminProfile = () => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [phoneError, setPhoneError] = useState(''); // State for phone validation error
  const [emailError, setEmailError] = useState(''); // State for email validation error
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      setError('No admin is currently logged in.');
      setLoading(false);
      return;
    }
    
    try {
      const user = JSON.parse(userData);
      // Verify this is an admin
      if (user.role !== 'Admin') {
        setError('Current user is not an admin.');
        setLoading(false);
        return;
      }
      
      setAdmin(user);
      setEditData(user);
      setLoading(false);
    } catch (error) {
      setError('Failed to load admin profile.');
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('adminId');
    navigate('/selectrole');
  };

  const handleEdit = () => setEditMode(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });

    // Validate phone number
    if (name === 'phone') {
      const phoneRegex = /^[0-9]{10}$/; // Example: 10-digit phone number
      if (!phoneRegex.test(value)) {
        setPhoneError('Phone number must be 10 digits.');
      } else {
        setPhoneError('');
      }
    }

    // Validate email address
    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email validation regex
      if (!emailRegex.test(value)) {
        setEmailError('Invalid email address.');
      } else {
        setEmailError('');
      }
    }
  };

  const handleSave = async () => {
    if (phoneError || emailError) {
      setSnackbar({ open: true, message: 'Please fix the errors before saving.', severity: 'error' });
      return;
    }

    try {
      await apiService.updateAdminProfile(admin.id, editData);
      setAdmin(editData);
      setEditMode(false);
      setSnackbar({ open: true, message: 'Profile updated successfully!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to update profile.', severity: 'error' });
    }
  };

  const handleCancel = () => {
    setEditData(admin);
    setEditMode(false);
    setPhoneError(''); // Clear phone error on cancel
    setEmailError(''); // Clear email error on cancel
  };

  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          backgroundColor: '#f5f5f5',
          minHeight: '100vh',
        }}
      >
        <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center', color: '#1976d2' }}>
            Admin Profile
          </Typography>
          <Divider sx={{ mb: 4 }} />
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : admin ? (
            <Paper elevation={3} sx={{ p: 4, mt: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ width: 80, height: 80, bgcolor: '#1976d2', fontSize: 36, mr: 3 }}>
                  <AdminPanelSettingsIcon fontSize="large" />
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{admin.name}</Typography>
                  <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>{admin.role}</Typography>
                </Box>
              </Box>
              <Divider sx={{ mb: 3 }} />
              {editMode ? (
                <>
                  <TextField
                    label="Name"
                    name="name"
                    value={editData.name}
                    onChange={handleChange}
                    fullWidth
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    label="Email"
                    name="email"
                    value={editData.email}
                    onChange={handleChange}
                    fullWidth
                    sx={{ mb: 2 }}
                    error={!!emailError} // Show error state if emailError exists
                    helperText={emailError} // Display email error message
                  />
                  <TextField
                    label="Phone"
                    name="phone"
                    value={editData.phone}
                    onChange={handleChange}
                    fullWidth
                    sx={{ mb: 2 }}
                    error={!!phoneError} // Show error state if phoneError exists
                    helperText={phoneError} // Display phone error message
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button variant="contained" color="primary" onClick={handleSave}>
                      Save
                    </Button>
                    <Button variant="outlined" onClick={handleCancel}>
                      Cancel
                    </Button>
                  </Box>
                </>
              ) : (
                <>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Email:</strong> {admin.email}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Phone:</strong> {admin.phone}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                    <Button variant="contained" onClick={handleEdit}>
                      Edit Profile
                    </Button>
                    <Button variant="outlined" color="error" onClick={handleLogout}>
                      Logout
                    </Button>
                  </Box>
                </>
              )}
            </Paper>
          ) : (
            <Typography>No admin data found.</Typography>
          )}
        </Container>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleSnackbarClose}
        >
          <Alert severity={snackbar.severity} onClose={handleSnackbarClose}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default AdminProfile;
