import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Container,
  IconButton,
  Collapse
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const SelectRole = () => {
  const navigate = useNavigate();
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
  
  const handleRoleSelect = (role) => {
    navigate(`${role.toLowerCase()}`);
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
        position: 'relative',
        overflow: 'hidden',
        backgroundImage: 'url("./assets/Background.jpg")', // Add the background image
        backgroundSize: 'cover', // Ensure the image covers the entire background
        backgroundPosition: 'center', // Center the image
        backgroundRepeat: 'no-repeat', // Prevent the image from repeating
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
        <IconButton 
          edge="start" 
          sx={{ color: 'black', mr: 2 }}
        >
          {/* Add an icon here if needed */}
        </IconButton>
        <Typography 
          variant="h5" 
          component="div" 
          sx={{ fontWeight: 'bold', color: 'black', cursor: 'pointer' }}
          onClick={() => navigate('/')} // Navigate to Homepage.jsx
        >
          Yummy Yard
        </Typography>
      </Box>

      {/* Main content */}
      <Container 
        maxWidth="sm" 
        sx={{ 
          mt: 2, 
          mb: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          zIndex: 1
        }}
      >
        <Typography 
          variant="h2" 
          align="center" 
          sx={{ 
            fontWeight: 'bold',
            color: 'black',
            mb: 2
          }}
        >
          Select Role
        </Typography>
        
        <Box sx={{ width: '100%', mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button
            variant="contained"
            size="large"
            sx={{
              backgroundColor: '#e0e0e0',
              color: 'black',
              py: 1.5,
              borderRadius: 1,
              textTransform: 'none',
              fontSize: '1.2rem',
              fontWeight: 'medium',
              '&:hover': {
                backgroundColor: '#d5d5d5',
              }
            }}
            onClick={() => handleRoleSelect('Admin')}
          >
            Admin
          </Button>
          
          <Button
            variant="contained"
            size="large"
            sx={{
              backgroundColor: '#e0e0e0',
              color: 'black',
              py: 1.5,
              borderRadius: 1,
              textTransform: 'none',
              fontSize: '1.2rem',
              fontWeight: 'medium',
              '&:hover': {
                backgroundColor: '#d5d5d5',
              }
            }}
            onClick={() => handleRoleSelect('/StaffLogin')}
          >
            Staff
          </Button>
          
          <Button
            variant="contained"
            size="large"
            sx={{
              backgroundColor: '#e0e0e0',
              color: 'black',
              py: 1.5,
              borderRadius: 1,
              textTransform: 'none',
              fontSize: '1.2rem',
              fontWeight: 'medium',
              '&:hover': {
                backgroundColor: '#d5d5d5',
              }
            }}
            onClick={handleCustomerClick}
          >
            Customer
          </Button>
          
          <Collapse in={customerDropdownOpen} timeout={500}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
              <Button
                variant="contained"
                size="large"
                sx={{
                  backgroundColor: '#f5f5f5',
                  color: 'black',
                  py: 1.5,
                  borderRadius: 1,
                  textTransform: 'none',
                  fontSize: '1.2rem',
                  fontWeight: 'medium',
                  boxShadow: 1,
                  '&:hover': {
                    backgroundColor: '#e5e5e5',
                  }
                }}
                onClick={() => handleRoleSelect('/login')}
              >
                Login
              </Button>
              <Button
                variant="contained"
                size="large"
                sx={{
                  backgroundColor: '#f5f5f5',
                  color: 'black',
                  py: 1.5,
                  borderRadius: 1,
                  textTransform: 'none',
                  fontSize: '1.2rem',
                  fontWeight: 'medium',
                  boxShadow: 1,
                  '&:hover': {
                    backgroundColor: '#c4c4c4',
                  }
                }}
                onClick={() => navigate('/register')}
              >
                Register new account
              </Button>
            </Box>
          </Collapse>
        </Box>
      </Container>

      {/* White curved section */}
      <Box
        sx={{
          position: 'absolute',
          height: '50%',
          width: '100%',
          bottom: 0,
          backgroundColor: 'white',
          borderTopLeftRadius: '60% 40%',
          borderTopRightRadius: '60% 40%',
          zIndex: 0
        }}
      />
    </Box>
  );
};

export default SelectRole;
