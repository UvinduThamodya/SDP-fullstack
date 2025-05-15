import React, { useEffect, useState } from 'react';
import { Box, Typography, Container, Paper, Avatar, CircularProgress, Alert, Button, TextField, Snackbar, Divider } from '@mui/material';
import Sidebar from '../../components/SidebarStaff';
import apiService from '../../services/api';
import { useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';

const Profile = () => {
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const staffId = localStorage.getItem('staffId');
    if (!staffId) {
      setError('No staff member is currently logged in.');
      setLoading(false);
      return;
    }
    apiService.getStaffProfile(staffId)
      .then(data => {
        setStaff(data.user || data.staff || data);
        setEditData(data.user || data.staff || data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load staff profile.');
        setLoading(false);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('staffId');
    localStorage.removeItem('token');
    localStorage.removeItem('staff');
    localStorage.removeItem('user');
    localStorage.removeItem('admin');
    window.dispatchEvent(new Event('user-logout'));
    navigate('/selectrole');
  };

  const handleEdit = () => setEditMode(true);

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editData.email)) {
      setSnackbar({ open: true, message: 'Invalid email format.', severity: 'error' });
      return;
    }

    // Phone number validation
    const phoneRegex = /^\d{10}$/; // Assuming phone number should be 10 digits
    if (!phoneRegex.test(editData.phone)) {
      setSnackbar({ open: true, message: 'Invalid phone number. It should be 10 digits.', severity: 'error' });
      return;
    }

    try {
      await apiService.updateStaffProfile(staff.id, editData);
      setStaff(editData);
      setEditMode(false);
      setSnackbar({ open: true, message: 'Profile updated successfully!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to update profile.', severity: 'error' });
    }
  };

  const handleCancel = () => {
    setEditData(staff);
    setEditMode(false);
  };

  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
      {/* Sidebar for desktop, Drawer-style for mobile */}
      <Box
        sx={{
          display: { xs: sidebarOpen ? 'block' : 'none', sm: 'block' },
          position: { xs: 'fixed', sm: 'relative' },
          zIndex: 1200,
          height: '100vh',
          minHeight: '100vh',
          width: { xs: 220, sm: 'auto' },
          background: { xs: '#fff', sm: 'none' },
          boxShadow: { xs: 3, sm: 'none' },
          transition: 'left 0.3s',
          left: { xs: sidebarOpen ? 0 : '-100%', sm: 0 },
          top: 0,
        }}
      >
        <Sidebar
          open={sidebarOpen}
          toggleSidebar={() => setSidebarOpen(false)}
          sx={{
            minHeight: '100vh',
            height: '100vh',
            borderRight: 0,
          }}
        />
      </Box>
      {/* Mobile menu button */}
      <Button
        variant="contained"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        sx={{
          display: { xs: 'flex', sm: 'none' },
          position: 'fixed',
          top: 16,
          left: 16,
          zIndex: 1300,
          minWidth: 'auto',
          width: 44,
          height: 44,
          borderRadius: '50%',
          boxShadow: 3,
          alignItems: 'center',
          justifyContent: 'center',
          p: 0,
        }}
      >
        <MenuIcon />
      </Button>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1, sm: 3 },
          backgroundColor: '#f5f5f5',
          minHeight: '100vh',
          width: '100%',
        }}
      >
        <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center', color: '#1976d2' }}>
            Staff Profile
          </Typography>
          <Divider sx={{ mb: 4 }} />
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : staff ? (
            <Paper elevation={3} sx={{ p: 4, mt: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ width: 80, height: 80, bgcolor: '#1976d2', fontSize: 36, mr: 3 }}>
                  {staff.name ? staff.name.charAt(0).toUpperCase() : 'S'}
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{staff.name}</Typography>
                  <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>{staff.role}</Typography>
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
                  />
                  <TextField
                    label="Phone"
                    name="phone"
                    value={editData.phone}
                    onChange={handleChange}
                    fullWidth
                    sx={{ mb: 2 }}
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
                    <strong>Email:</strong> {staff.email}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Phone:</strong> {staff.phone}
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
            <Typography>No staff data found.</Typography>
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

export default Profile;
