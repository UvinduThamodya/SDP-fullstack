import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, IconButton, Typography, Box, Tooltip, Button } from '@mui/material';
import yummyYard from '../assets/YummyYard_logo.png'; // Import the Yummy Yard logo
import { useNavigate } from 'react-router-dom'; // Import useNavigate

// Import logos for the pages
import dashboardLogo from '../assets/dashboard (1).png';
import menuLogo from '../assets/menu (1).png';
import ordersLogo from '../assets/Order.png';
import aboutLogo from '../assets/aboutus.png';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HomeIcon from '@mui/icons-material/Home'; // Import the Home icon

const Navbar = () => {
  const navigate = useNavigate(); // Initialize useNavigate
  const [user, setUser] = useState(null);
  const [deleteRequest, setDeleteRequest] = useState(false);
  
  // Check if user is logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    const checkDeleteRequests = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch('http://localhost:5000/api/customers/delete-requests', {
          headers: { 'Authorization': `Bearer ${token}` }
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
    const interval = setInterval(checkDeleteRequests, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleNavigation = (route) => {
    navigate(route);
  };
  
  // Handle home navigation based on authentication status
  const handleHomeClick = () => {
    const token = localStorage.getItem('token');
    if (token) {
      // If user is logged in, go to user homepage
      navigate('/HomepageUser');
    } else {
      // If user is not logged in, go to public homepage
      navigate('/');
    }
  };
  
  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
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
              src={yummyYard}
              alt="Yummy Yard Logo"
              onClick={handleHomeClick}
              style={{ height: '60px', marginRight: '9px', borderRadius: '5px' }}
            />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', fontSize: '30px', fontFamily: 'Poppins, sans-serif' }}>
            Yummy Yard
          </Typography>
          <Typography variant="h6" component="div" sx={{ fontSize: '20px', fontFamily: 'Poppins, sans-serif', ml: 4 }}>
            +94 76 718 1695
          </Typography>
        </Box>
        
        {user && (
          <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontSize: '16px' }}>
            Welcome, {user.name}!
          </Typography>
        )}
        
        <Box sx={{ display: 'flex', gap: 3 }}>
          <Tooltip title="Home" placement="bottom" sx={{ fontSize: '20px' }}>
            <IconButton color="inherit" onClick={handleHomeClick}>
              <HomeIcon sx={{ fontSize: 50 }} /> {/* Increase the font size to 40 */}
            </IconButton>
          </Tooltip>
          <Tooltip title="Menu" placement="bottom" sx={{ fontSize: '20px' }}>
            <IconButton color="inherit" onClick={() => handleNavigation('/menu')}>
              <img src={menuLogo} alt="Menu" style={{ height: '40px' }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Orders" placement="bottom" sx={{ fontSize: '20px' }}>
            <IconButton color="inherit" onClick={() => handleNavigation('/orderhistory')}>
              <img src={ordersLogo} alt="Orders" style={{ height: '40px' }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Dashboard" placement="bottom" sx={{ fontSize: '20px' }}>
            <IconButton color="inherit" onClick={() => handleNavigation('/dashboardcustomer')}>
              <img src={dashboardLogo} alt="Dashboard" style={{ height: '40px' }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="About Us" placement="bottom" sx={{ fontSize: '20px' }}>
            <IconButton color="inherit" onClick={() => handleNavigation('/aboutcontact')}>
              <img src={aboutLogo} alt="About Us" style={{ height: '40px' }} />
            </IconButton>
          </Tooltip>
          {user && (
            <Tooltip title="My Profile" placement="bottom" sx={{ fontSize: '20px' }}>
              <Box sx={{ position: 'relative' }}>
                <IconButton color="inherit" onClick={() => handleNavigation('/profile')}>
                  <AccountCircleIcon sx={{ fontSize: 40 }} />
                </IconButton>
                {deleteRequest && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: 'red',
                      animation: 'pulse 1.5s infinite'
                    }}
                  />
                )}
              </Box>
            </Tooltip>
          )}
          {user && (
            <Button 
              color="inherit" 
              onClick={handleLogout}
              sx={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Logout
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
