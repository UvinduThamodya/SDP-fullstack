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
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import Logo from '../../assets/YummyYard_logo.png';
import '@fontsource/poppins';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Custom theme with Poppins font
const theme = createTheme({
  typography: {
    fontFamily: 'Poppins, sans-serif',
    h4: { fontWeight: 700 },
    button: { fontFamily: 'Poppins, sans-serif', textTransform: 'none' },
  },
});

const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: 24,
  overflow: 'hidden',
  boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
  fontFamily: 'Poppins, sans-serif',
}));

const LeftPanel = styled(Grid)(({ theme }) => ({
  background: 'linear-gradient(135deg, #00E676 0%, #00C853 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(4),
  borderTopLeftRadius: 24,
  borderBottomLeftRadius: 24,
  minHeight: 420,
}));

const RightPanel = styled(Grid)(({ theme }) => ({
  backgroundColor: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(4),
  borderTopRightRadius: 24,
  borderBottomRightRadius: 24,
  minHeight: 420,
}));

const StyledButton = styled(Button)(({ theme }) => ({
  fontWeight: 600,
  fontFamily: 'Poppins, sans-serif',
  borderRadius: 12,
  fontSize: '1.1rem',
  background: 'linear-gradient(90deg, #00E676 0%, #00C853 100%)',
  color: '#fff',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  '&:hover': {
    background: 'linear-gradient(90deg, #00C853 0%, #00E676 100%)',
    color: '#fff',
  },
}));

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
    <ThemeProvider theme={theme}>
      <Box sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e0ffe7 0%, #f5f5f5 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Poppins, sans-serif'
      }}>
        <StyledPaper elevation={6} sx={{ width: '95%', maxWidth: 950 }}>
          <Grid container>
            {/* Left Panel - Logo & Welcome */}
            <LeftPanel item xs={12} md={5} sx={{ position: 'relative' }}>
              {/* Back Button */}
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/selectrole')}
                sx={{
                  position: 'absolute',
                  top: 16,
                  left: 16,
                  minWidth: 0,
                  px: 2,
                  color: '#fff',
                  fontWeight: 600,
                  background: 'none',
                  boxShadow: 'none',
                  zIndex: 2,
                  '&:hover': { background: 'rgba(25, 118, 210, 0.08)' }
                }}
              >
                Back
              </Button>
              <Box sx={{ textAlign: 'center', width: '100%' }}>
                <img
                  src={Logo}
                  alt="Yummy Yard Logo"
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    marginBottom: 24,
                    marginLeft: 105,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                    background: '#fff'
                  }}
                />
                <Typography variant="h4" sx={{
                  color: '#fff',
                  fontWeight: 700,
                  mb: 2,
                  letterSpacing: 1,
                  fontFamily: 'Poppins, sans-serif',
                  textShadow: '1px 1px 6px rgba(0,0,0,0.10)'
                }}>
                  Welcome Admin
                </Typography>

              </Box>
            </LeftPanel>

            {/* Right Panel - Login Form */}
            <RightPanel item xs={12} md={7}>
              <Box sx={{ width: '100%', maxWidth: 370, mx: 'auto' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <AdminPanelSettingsIcon sx={{ fontSize: 38, mr: 1, color: '#00C853' }} />
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#00C853', fontFamily: 'Poppins, sans-serif' }}>
                    Admin Portal
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontFamily: 'Poppins, sans-serif' }}>
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
                    InputProps={{
                      style: { fontFamily: 'Poppins, sans-serif' }
                    }}
                    InputLabelProps={{
                      style: { fontFamily: 'Poppins, sans-serif' }
                    }}
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
                    InputProps={{
                      style: { fontFamily: 'Poppins, sans-serif' }
                    }}
                    InputLabelProps={{
                      style: { fontFamily: 'Poppins, sans-serif' }
                    }}
                  />
                  <StyledButton
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    sx={{ py: 1.5, mb: 2 }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Login as Admin'}
                  </StyledButton>
                  <Box sx={{ mt: 1, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'Poppins, sans-serif' }}>
                      Not an admin?{' '}
                      <Button
                        variant="text"
                        size="small"
                        sx={{ color: '#00C853', fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}
                        onClick={() => navigate('/staffLogin')}
                      >
                        Staff Login
                      </Button>
                    </Typography>
                  </Box>
                </form>
              </Box>
            </RightPanel>
          </Grid>
        </StyledPaper>
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError('')}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity="error" onClose={() => setError('')} sx={{ width: '100%', fontFamily: 'Poppins, sans-serif' }}>
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

export default AdminLogin;
