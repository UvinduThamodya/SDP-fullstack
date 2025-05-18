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
  Divider,
  createTheme,
  ThemeProvider,
  CssBaseline
} from '@mui/material';
import Sidebar from '../../components/SidebarStaff';
import apiService from '../../services/api';
import { useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';

// Custom theme with Poppins font and modern palette
const theme = createTheme({
  typography: {
    fontFamily: 'Poppins, sans-serif',
    h4: { fontWeight: 700, letterSpacing: '0.5px' },
    h5: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: 'none', fontFamily: 'Poppins, sans-serif' },
    body1: { fontFamily: 'Poppins, sans-serif' }
  },
  palette: {
    primary: { main: '#3ACA82' },
    secondary: { main: '#f50057' },
    background: { default: '#f5f7fa' }
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 24px rgba(25, 118, 210, 0.07)',
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 8px rgba(25, 118, 210, 0.08)',
          }
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          }
        }
      }
    }
  }
});

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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', position: 'relative', background: 'linear-gradient(120deg, #f5f7fa 0%, #e3f0ff 100%)' }}>
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
            background: 'linear-gradient(135deg, #3ACA82 60%, #4dd496 100%)'
          }}
        >
          <MenuIcon />
        </Button>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 1, sm: 3 },
            backgroundColor: 'transparent',
            minHeight: '100vh',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{
              p: { xs: 2, sm: 4 },
              mt: 3,
              borderRadius: 4,
              background: 'linear-gradient(120deg, #fff, #e3f0ff 100%)',
              boxShadow: '0 6px 32px rgba(25, 118, 210, 0.10)'
            }}>
              <Typography
                variant="h4"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  textAlign: 'center',
                  color: '#1976d2',
                  mb: 2,
                  letterSpacing: '0.5px',
                  fontFamily: 'Poppins, sans-serif'
                }}
              >
                Staff Profile
              </Typography>
              <Divider sx={{ mb: 3 }} />
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <CircularProgress color="primary" />
                </Box>
              ) : error ? (
                <Alert severity="error">{error}</Alert>
              ) : staff ? (
                <>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 3,
                    justifyContent: 'center'
                  }}>
                    <Avatar
                      sx={{
                        width: 90,
                        height: 90,
                        bgcolor: '#1976d2',
                        fontSize: 40,
                        mr: 3,
                        boxShadow: '0 2px 12px rgba(25, 118, 210, 0.15)'
                      }}
                    >
                      {staff.name ? staff.name.charAt(0).toUpperCase() : 'S'}
                    </Avatar>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: '#222' }}>{staff.name}</Typography>
                      <Typography color="primary" sx={{ fontStyle: 'italic', fontWeight: 500 }}>{staff.role}</Typography>
                    </Box>
                  </Box>
                  <Divider sx={{ mb: 3 }} />
                  {editMode ? (
                    <Box component="form" noValidate autoComplete="off">
                      <TextField
                        label="Name"
                        name="name"
                        value={editData.name}
                        onChange={handleChange}
                        fullWidth
                        sx={{ mb: 2 }}
                        InputLabelProps={{ style: { fontFamily: 'Poppins, sans-serif' } }}
                      />
                      <TextField
                        label="Email"
                        name="email"
                        value={editData.email}
                        onChange={handleChange}
                        fullWidth
                        sx={{ mb: 2 }}
                        InputLabelProps={{ style: { fontFamily: 'Poppins, sans-serif' } }}
                      />
                      <TextField
                        label="Phone"
                        name="phone"
                        value={editData.phone}
                        onChange={handleChange}
                        fullWidth
                        sx={{ mb: 2 }}
                        InputLabelProps={{ style: { fontFamily: 'Poppins, sans-serif' } }}
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleSave}
                          sx={{
                            px: 4,
                            py: 1.2,
                            fontSize: '1rem',
                            letterSpacing: '0.5px',
                            bgcolor: '#3ACA82',
                            '&:hover': {
                              bgcolor: '#2d9e68',
                            }
                          }}
                        >
                          Save
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={handleCancel}
                          sx={{
                            px: 4,
                            py: 1.2,
                            fontSize: '1rem',
                            letterSpacing: '0.5px'
                          }}
                        >
                          Cancel
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <Box>
                      <Typography variant="body1" sx={{ mb: 1.5, fontSize: '1.1rem' }}>
                        <strong>Email:</strong> <span style={{ color: '#1976d2' }}>{staff.email}</span>
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1.5, fontSize: '1.1rem' }}>
                        <strong>Phone:</strong> <span style={{ color: '#1976d2' }}>{staff.phone}</span>
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleEdit}
                          sx={{
                            px: 4,
                            py: 1.2,
                            fontSize: '1rem',
                            letterSpacing: '0.5px',
                            bgcolor: '#3ACA82',
                            '&:hover': {
                              bgcolor: '#2d9e68',
                            }
                          }}
                        >
                          Edit Profile
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={handleLogout}
                          sx={{
                            px: 4,
                            py: 1.2,
                            fontSize: '1rem',
                            letterSpacing: '0.5px'
                          }}
                        >
                          Logout
                        </Button>
                      </Box>
                    </Box>
                  )}
                </>
              ) : (
                <Typography>No staff data found.</Typography>
              )}
            </Paper>
            <Snackbar
              open={snackbar.open}
              autoHideDuration={4000}
              onClose={handleSnackbarClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
              <Alert severity={snackbar.severity} onClose={handleSnackbarClose} sx={{ fontFamily: 'Poppins, sans-serif' }}>
                {snackbar.message}
              </Alert>
            </Snackbar>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Profile;
