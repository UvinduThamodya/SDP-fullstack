import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Avatar,
  CircularProgress,
  Alert,
  Button,
  TextField,
  Snackbar,
  Divider
} from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import Sidebar from '../../components/SidebarAdmin';
import apiService from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';

// Custom theme with Poppins font and enhanced design
const theme = createTheme({
  typography: {
    fontFamily: 'Poppins, Arial, sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    button: { fontFamily: 'Poppins, Arial, sans-serif', textTransform: 'none' }
  },
  shape: { borderRadius: 16 },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 8px 32px rgba(25, 118, 210, 0.08)',
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 600,
          boxShadow: 'none',
          transition: 'all 0.2s',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(25, 118, 210, 0.12)',
            transform: 'translateY(-2px)'
          }
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
          }
        }
      }
    }
  }
});

// Styled Paper for profile card
const ProfilePaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(7, 6), // Increased padding
  borderRadius: 32, // More rounded
  background: '#fff',
  boxShadow: '0 8px 32px rgba(25, 118, 210, 0.08)',
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(28),
  minWidth: 480,
  maxWidth: 600,
  minHeight: 420,
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3, 2),
    borderRadius: 18,
    minWidth: 'unset',
    maxWidth: '100%',
    minHeight: 320,
  },
}));

const AdminProfile = () => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [phoneError, setPhoneError] = useState(''); // State for phone validation error
  const [emailError, setEmailError] = useState(''); // State for email validation error
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
    <ThemeProvider theme={theme}>
      <Box sx={{
        display: 'flex',
        minHeight: '100vh',
        background: 'linear-gradient(120deg, #f5f7fa 0%, #e3f0ff 100%)',
        position: 'relative'
      }}>
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
            p: { xs: 1, sm: 6 },
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          <Container maxWidth={false} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', px: { xs: 0.5, sm: 2 } }}>
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              {/* Make the profile card larger */}
              <ProfilePaper elevation={4} sx={{
                minWidth: { xs: '90vw', sm: 480 },
                maxWidth: { xs: '98vw', sm: 600 },
                minHeight: { xs: 320, sm: 420 },
                marginTop: { xs: 2, sm: 1 },
                marginBottom: { xs: 4, sm: 28 },
                p: { xs: 2, sm: 7 },
              }}>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : error ? (
                  <Alert severity="error">{error}</Alert>
                ) : admin ? (
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar
                        sx={{
                          width: 90,
                          height: 90,
                          bgcolor: '#1976d2',
                          fontSize: 40,
                          mr: 3,
                          boxShadow: '0 4px 16px rgba(25, 118, 210, 0.18)'
                        }}
                      >
                        <AdminPanelSettingsIcon fontSize="large" />
                      </Avatar>
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#1976d2', fontFamily: 'Poppins, Arial, sans-serif' }}>
                          {admin.name}
                        </Typography>
                        <Typography color="text.secondary" sx={{ fontStyle: 'italic', fontSize: 16 }}>
                          {admin.role}
                        </Typography>
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
                          error={!!emailError}
                          helperText={emailError}
                        />
                        <TextField
                          label="Phone"
                          name="phone"
                          value={editData.phone}
                          onChange={handleChange}
                          fullWidth
                          sx={{ mb: 2 }}
                          error={!!phoneError}
                          helperText={phoneError}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
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
                        <Typography variant="body1" sx={{ mb: 1.5, fontSize: 17 }}>
                          <strong>Email:</strong> <span style={{ color: '#1976d2' }}>{admin.email}</span>
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1.5, fontSize: 17 }}>
                          <strong>Phone:</strong> <span style={{ color: '#1976d2' }}>{admin.phone}</span>
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
                          <Button variant="contained" onClick={handleEdit}>
                            Edit Profile
                          </Button>
                          <Button variant="outlined" color="error" onClick={handleLogout}>
                            Logout
                          </Button>
                        </Box>
                      </>
                    )}
                  </>
                ) : (
                  <Typography>No admin data found.</Typography>
                )}
              </ProfilePaper>
            </Box>
          </Container>
          <Snackbar
            open={snackbar.open}
            autoHideDuration={4000}
            onClose={handleSnackbarClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Alert severity={snackbar.severity} onClose={handleSnackbarClose} sx={{ fontFamily: 'Poppins, Arial, sans-serif' }}>
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default AdminProfile;
