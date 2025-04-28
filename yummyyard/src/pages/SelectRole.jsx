import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Container,
  Collapse,
  Paper,
  Zoom
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BadgeIcon from '@mui/icons-material/Badge';
import PersonIcon from '@mui/icons-material/Person';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const SelectRole = () => {
  const navigate = useNavigate();
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
  
  const handleRoleSelect = (path) => {
    navigate(path);
  };
  
  const handleCustomerClick = () => {
    setCustomerDropdownOpen(!customerDropdownOpen);
  };
  
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#00E676',
        background: 'linear-gradient(135deg, #00E676 0%, #00C853 100%)',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: '"Poppins", sans-serif',
      }}
    >
      {/* Main content */}
      <Container 
        maxWidth="sm" 
        sx={{ 
          mt: 8, 
          mb: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          zIndex: 1
        }}
      >
        <Zoom in={true} timeout={800}>
          <Typography 
            variant="h2" 
            align="center" 
            sx={{ 
              fontWeight: '600',
              color: 'white',
              mb: 4,
              fontFamily: '"Poppins", sans-serif',
              textShadow: '1px 1px 3px rgba(0,0,0,0.2)'
            }}
          >
            Login as
          </Typography>
        </Zoom>
        
        <Box sx={{ width: '100%', mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Zoom in={true} timeout={1000} style={{ transitionDelay: '200ms' }}>
            <Paper 
              elevation={4}
              sx={{
                borderRadius: 2,
                overflow: 'hidden',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-5px)'
                }
              }}
            >
              <Button
                variant="contained"
                fullWidth
                size="large"
                startIcon={<AdminPanelSettingsIcon />}
                sx={{
                  backgroundColor: 'white',
                  color: '#00C853',
                  py: 2,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1.2rem',
                  fontWeight: '500',
                  fontFamily: '"Poppins", sans-serif',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                  }
                }}
                onClick={() => handleRoleSelect('/adminLogin')}
              >
                Admin
              </Button>
            </Paper>
          </Zoom>
          
          <Zoom in={true} timeout={1000} style={{ transitionDelay: '400ms' }}>
            <Paper 
              elevation={4}
              sx={{
                borderRadius: 2,
                overflow: 'hidden',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-5px)'
                }
              }}
            >
              <Button
                variant="contained"
                fullWidth
                size="large"
                startIcon={<BadgeIcon />}
                sx={{
                  backgroundColor: 'white',
                  color: '#00C853',
                  py: 2,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1.2rem',
                  fontWeight: '500',
                  fontFamily: '"Poppins", sans-serif',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                  }
                }}
                onClick={() => handleRoleSelect('/StaffLogin')}
              >
                Staff
              </Button>
            </Paper>
          </Zoom>
          
          <Zoom in={true} timeout={1000} style={{ transitionDelay: '600ms' }}>
            <Paper 
              elevation={4}
              sx={{
                borderRadius: 2,
                overflow: 'hidden',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-5px)'
                }
              }}
            >
              <Button
                variant="contained"
                fullWidth
                size="large"
                startIcon={<PersonIcon />}
                endIcon={customerDropdownOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                sx={{
                  backgroundColor: 'white',
                  color: '#00C853',
                  py: 2,
                  borderRadius: customerDropdownOpen ? '16px 16px 0 0' : 2,
                  textTransform: 'none',
                  fontSize: '1.2rem',
                  fontWeight: '500',
                  fontFamily: '"Poppins", sans-serif',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                  }
                }}
                onClick={handleCustomerClick}
              >
                Customer
              </Button>
              
              <Collapse in={customerDropdownOpen} timeout={500}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 0,
                  background: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '0 0 16px 16px',
                  overflow: 'hidden'
                }}>
                  <Button
                    variant="text"
                    size="large"
                    startIcon={<LoginIcon />}
                    sx={{
                      py: 1.8,
                      textTransform: 'none',
                      fontSize: '1.1rem',
                      fontWeight: '500',
                      fontFamily: '"Poppins", sans-serif',
                      color: '#00C853',
                      borderRadius: 0,
                      '&:hover': {
                        backgroundColor: 'rgba(0, 200, 83, 0.08)',
                      }
                    }}
                    onClick={() => handleRoleSelect('/login')}
                  >
                    Login
                  </Button>
                  
                  <Button
                    variant="text"
                    size="large"
                    startIcon={<PersonAddIcon />}
                    sx={{
                      py: 1.8,
                      textTransform: 'none',
                      fontSize: '1.1rem',
                      fontWeight: '500',
                      fontFamily: '"Poppins", sans-serif',
                      color: '#00C853',
                      borderTop: '1px solid rgba(0,0,0,0.08)',
                      borderRadius: 0,
                      '&:hover': {
                        backgroundColor: 'rgba(0, 200, 83, 0.08)',
                      }
                    }}
                    onClick={() => navigate('/register')}
                  >
                    Register new account
                  </Button>
                </Box>
              </Collapse>
            </Paper>
          </Zoom>
        </Box>
      </Container>

      {/* Improved curved section */}
      <Box
        sx={{
          position: 'absolute',
          height: '40%',
          width: '120%',
          bottom: -40,
          left: '-10%',
          backgroundColor: 'white',
          borderTopLeftRadius: '50% 60%',
          borderTopRightRadius: '50% 60%',
          zIndex: 0,
          boxShadow: 'inset 0 15px 20px -10px rgba(0,0,0,0.2)'
        }}
      />
    </Box>
  );
};

export default SelectRole;