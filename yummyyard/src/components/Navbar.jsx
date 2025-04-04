import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Box, Tooltip } from '@mui/material';
import yummyYard from '../assets/YummyYard_logo.png'; // Import the Yummy Yard logo
import { useNavigate } from 'react-router-dom'; // Import useNavigate

// Import logos for the pages
import dashboardLogo from '../assets/dashboard (1).png';
import menuLogo from '../assets/menu (1).png';
import ordersLogo from '../assets/Order.png';
import aboutLogo from '../assets/aboutus.png';

const Navbar = () => {
  const navigate = useNavigate(); // Initialize useNavigate

  const handleNavigation = (route) => {
    navigate(route);
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', height: '80px' }}>
      <Toolbar sx={{ minHeight: '80px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 4 }}
          >
            <img
              src={yummyYard} // Replace with your restaurant logo
              alt="Yummy Yard Logo"
              style={{ height: '60px', marginRight: '9px', borderRadius: '5px' }} // Increased logo height
            />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', fontSize: '30px', fontFamily: 'Poppins, sans-serif' }}>
            Yummy Yard
          </Typography>
          <Typography variant="h6" component="div" sx={{ fontSize: '20px', fontFamily: 'Poppins, sans-serif', ml: 4 }}>
            +94 76 718 1695
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 3 }}>
          <Tooltip title="Dashboard" placement="bottom" sx={{ fontSize: '20px' }}>
            <IconButton color="inherit" onClick={() => handleNavigation('/dashboard')}>
              <img src={dashboardLogo} alt="Dashboard" style={{ height: '40px' }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Menu" placement="bottom" sx={{ fontSize: '20px' }}>
            <IconButton color="inherit" onClick={() => handleNavigation('/menu')}>
              <img src={menuLogo} alt="Menu" style={{ height: '40px' }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Orders" placement="bottom" sx={{ fontSize: '20px' }}>
            <IconButton color="inherit" onClick={() => handleNavigation('/placeorder')}>
              <img src={ordersLogo} alt="Orders" style={{ height: '40px' }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="About Us" placement="bottom" sx={{ fontSize: '20px' }}>
            <IconButton color="inherit" onClick={() => handleNavigation('/aboutcontact')}>
              <img src={aboutLogo} alt="About Us" style={{ height: '40px' }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
