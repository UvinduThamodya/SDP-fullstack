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
  useTheme,
  useMediaQuery
} from '@mui/material';
import { styled } from '@mui/material/styles';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import Sidebar from '../../components/SidebarStaff';
import apiService from '../../services/api';
import { useNavigate } from 'react-router-dom';

// Custom styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(3),
  borderRadius: 16,
  boxShadow: '0 8px 24px rgba(149, 157, 165, 0.2)',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
  }
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 100,
  height: 100,
  backgroundColor: theme.palette.primary.main,
  fontSize: 42,
  fontWeight: 'bold',
  marginRight: theme.spacing(3),
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: 8,
  padding: '8px 24px',
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: 'none',
  transition: 'all 0.3s',
  '&:hover': {
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    transform: 'translateY(-2px)',
  }
}));

const InfoRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  padding: theme.spacing(1.5),
  borderRadius: 8,
  backgroundColor: theme.palette.grey[50],
}));

// Create a theme with Poppins font
const Profile = () => {
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    // Add Poppins font to the document
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap';
    document.head.appendChild(link);
    
    // Apply Poppins font to the entire document
    document.body.style.fontFamily = "'Poppins', sans-serif";
    
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
      
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('staffId');
    localStorage.removeItem('token');
    localStorage.removeItem('staff');
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
    <Box sx={{ 
      display: 'flex',
      fontFamily: '"Poppins", sans-serif',
    }}>
      <Sidebar open={sidebarOpen} toggleSidebar={toggleSidebar} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          backgroundColor: '#f8fafc',
          minHeight: '100vh',
        }}
      >
        {isMobile && (
          <Button
            variant="contained"
            startIcon={<MenuIcon />}
            onClick={toggleSidebar}
            sx={{
              mb: 2,
              backgroundColor: theme.palette.primary.main,
              color: '#fff',
              borderRadius: '8px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              }
            }}
          >
            {sidebarOpen ? 'Hide Menu' : 'Menu'}
          </Button>
        )}

        <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
          <Typography 
            variant="h4" 
            gutterBottom 
            sx={{ 
              fontWeight: 700, 
              textAlign: 'center', 
              color: theme.palette.primary.main,
              letterSpacing: '-0.5px',
              mb: 2
            }}
          >
            Staff Profile
          </Typography>
          <Divider sx={{ 
            mb: 4, 
            "&::before, &::after": {
              borderColor: theme.palette.primary.light,
            }
          }}>
            <Typography variant="body2" 
              sx={{ 
                color: theme.palette.text.secondary,
                px: 2,
                fontStyle: 'italic'
              }}
            >
              Personal Information
            </Typography>
          </Divider>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress thickness={5} size={60} />
            </Box>
          ) : error ? (
            <Alert 
              severity="error"
              variant="filled"
              sx={{ 
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(211, 47, 47, 0.2)'
              }}
            >
              {error}
            </Alert>
          ) : staff ? (
            <StyledPaper elevation={0}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'center' : 'flex-start', 
                mb: 4 
              }}>
                <StyledAvatar>
                  {staff.name ? staff.name.charAt(0).toUpperCase() : 'S'}
                </StyledAvatar>
                <Box sx={{ 
                  textAlign: isMobile ? 'center' : 'left',
                  mt: isMobile ? 2 : 0
                }}>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 600,
                      color: theme.palette.text.primary,
                      mb: 0.5
                    }}
                  >
                    {staff.name}
                  </Typography>
                  <Typography 
                    sx={{ 
                      fontStyle: 'italic',
                      color: theme.palette.primary.main,
                      fontWeight: 500,
                      backgroundColor: 'rgba(25, 118, 210, 0.08)',
                      borderRadius: '4px',
                      display: 'inline-block',
                      px: 1.5,
                      py: 0.5,
                    }}
                  >
                    {staff.role}
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
                    variant="outlined"
                    sx={{ 
                      mb: 3,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                  <TextField
                    label="Email"
                    name="email"
                    value={editData.email}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                    sx={{ 
                      mb: 3,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                  <TextField
                    label="Phone"
                    name="phone"
                    value={editData.phone}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                    sx={{ 
                      mb: 3,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <StyledButton 
                      variant="outlined" 
                      color="error" 
                      onClick={handleCancel}
                      startIcon={<CancelOutlinedIcon />}
                    >
                      Cancel
                    </StyledButton>
                    <StyledButton 
                      variant="contained" 
                      color="primary" 
                      onClick={handleSave}
                      startIcon={<SaveOutlinedIcon />}
                    >
                      Save
                    </StyledButton>
                  </Box>
                </>
              ) : (
                <>
                  <InfoRow>
                    <Typography sx={{ fontWeight: 500, width: 80 }}>Email:</Typography>
                    <Typography sx={{ color: theme.palette.text.secondary }}>
                      {staff.email}
                    </Typography>
                  </InfoRow>
                  
                  <InfoRow>
                    <Typography sx={{ fontWeight: 500, width: 80 }}>Phone:</Typography>
                    <Typography sx={{ color: theme.palette.text.secondary }}>
                      {staff.phone}
                    </Typography>
                  </InfoRow>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'flex-end', 
                    gap: 2, 
                    mt: 4,
                    flexDirection: isMobile ? 'column' : 'row',
                  }}>
                    <StyledButton 
                      variant="outlined"
                      color="error" 
                      onClick={handleLogout}
                      fullWidth={isMobile}
                      startIcon={<LogoutOutlinedIcon />}
                    >
                      Logout
                    </StyledButton>
                    <StyledButton 
                      variant="contained" 
                      onClick={handleEdit}
                      fullWidth={isMobile}
                      startIcon={<EditOutlinedIcon />}
                    >
                      Edit Profile
                    </StyledButton>
                  </Box>
                </>
              )}
            </StyledPaper>
          ) : (
            <Typography>No staff data found.</Typography>
          )}
        </Container>
        
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            severity={snackbar.severity} 
            onClose={handleSnackbarClose}
            variant="filled"
            sx={{ 
              width: '100%',
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default Profile;