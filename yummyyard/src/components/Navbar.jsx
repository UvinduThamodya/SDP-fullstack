import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Tooltip,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { 
  Menu as MenuIcon,
  Home as HomeIcon,
  AccountCircle as AccountCircleIcon,
  Restaurant as RestaurantIcon,
  ListAlt as ListAltIcon,
  Dashboard as DashboardIcon,
  Info as InfoIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import yummyYard from '../assets/YummyYard_logo.png';

const Navbar = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [user, setUser] = useState(null);
  const [deleteRequest, setDeleteRequest] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // User and delete request logic (same as previous implementation)
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
    const interval = setInterval(checkDeleteRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  // Navigation handlers
  const handleNavigation = (route) => {
    navigate(route);
    setMobileOpen(false);
  };
  
  const handleHomeClick = () => {
    const token = localStorage.getItem('token');
    navigate(token ? '/HomepageUser' : '/');
    setMobileOpen(false);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
    setMobileOpen(false);
  };

  // Desktop navigation items
  const NavItems = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Tooltip title="Home" placement="bottom">
        <IconButton color="inherit" onClick={handleHomeClick}>
          <HomeIcon sx={{ fontSize: isMobile ? 24 : 50, color: '#fff' }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Menu" placement="bottom">
        <IconButton color="inherit" onClick={() => handleNavigation('/menu')}>
          <RestaurantIcon sx={{ fontSize: isMobile ? 24 : 40, color: '#fff' }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Orders" placement="bottom">
        <IconButton color="inherit" onClick={() => handleNavigation('/orderhistory')}>
          <ListAltIcon sx={{ fontSize: isMobile ? 24 : 40, color: '#fff' }} />
        </IconButton>
      </Tooltip>
      {/* {user && (
        <Tooltip title="Dashboard" placement="bottom">
          <IconButton color="inherit" onClick={() => handleNavigation('/dashboardcustomer')}>
            <DashboardIcon sx={{ fontSize: isMobile ? 24 : 40, color: '#fff' }} />
          </IconButton>
        </Tooltip>
      )} */}
      <Tooltip title="About Us" placement="bottom">
        <IconButton color="inherit" onClick={() => handleNavigation('/aboutcontact')}>
          <InfoIcon sx={{ fontSize: isMobile ? 24 : 40, color: '#fff' }} />
        </IconButton>
      </Tooltip>
      {user && (
        <Tooltip title="My Profile" placement="bottom">
          <Box sx={{ position: 'relative' }}>
            <IconButton
              color="inherit"
              onClick={() => handleNavigation('/profile')}
            >
              <AccountCircleIcon sx={{ fontSize: isMobile ? 24 : 40, color: '#fff' }} />
            </IconButton>
            {deleteRequest && (
              <Box
                sx={{
                  position: 'absolute',
                  top: -2,
                  right: -2,
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle at 40% 40%, #ff1744 60%, #fff 100%)',
                  border: '2px solid #fff',
                  boxShadow: '0 0 8px 2px #ff1744, 0 0 0 4px rgba(255,23,68,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2,
                  animation: 'ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite',
                  '@keyframes ping': {
                    '0%': { boxShadow: '0 0 8px 2px #ff1744, 0 0 0 4px rgba(255,23,68,0.2)' },
                    '70%': { boxShadow: '0 0 16px 8px #ff1744, 0 0 0 16px rgba(255,23,68,0.1)' },
                    '100%': { boxShadow: '0 0 8px 2px #ff1744, 0 0 0 4px rgba(255,23,68,0.2)' },
                  }
                }}
              >
                <span style={{
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 10,
                  lineHeight: 1,
                  textShadow: '0 0 2px #ff1744',
                }}>!</span>
              </Box>
            )}
          </Box>
        </Tooltip>
      )}
    </Box>
  );

  // Mobile drawer menu
  const drawer = (
    <List>
      <ListItem onClick={handleHomeClick}>
        <ListItemIcon><HomeIcon /></ListItemIcon>
        <ListItemText primary="Home" />
      </ListItem>
      <ListItem onClick={() => handleNavigation('/menu')}>
        <ListItemIcon><RestaurantIcon /></ListItemIcon>
        <ListItemText primary="Menu" />
      </ListItem>
      <ListItem onClick={() => handleNavigation('/orderhistory')}>
        <ListItemIcon><ListAltIcon /></ListItemIcon>
        <ListItemText primary="Orders" />
      </ListItem>
      {/* {user && (
        <ListItem onClick={() => handleNavigation('/dashboardcustomer')}>
          <ListItemIcon><DashboardIcon /></ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
      )} */}
      <ListItem onClick={() => handleNavigation('/aboutcontact')}>
        <ListItemIcon><InfoIcon /></ListItemIcon>
        <ListItemText primary="About Us" />
      </ListItem>
      {user && (
        <>
          <ListItem onClick={() => handleNavigation('/profile')}>
            <ListItemIcon sx={{ position: 'relative' }}>
              <AccountCircleIcon />
              {/* Show delete request popup on mobile drawer */}
              {deleteRequest && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: 'red',
                    animation: 'pulse 1.5s infinite',
                  }}
                />
              )}
            </ListItemIcon>
            <ListItemText primary="My Profile" />
          </ListItem>
          <ListItem onClick={handleLogout}>
            <ListItemIcon><LogoutIcon /></ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </>
      )}
    </List>
  );

  return (
    <>
      <AppBar
        position="static"
        sx={{
          background: 'linear-gradient(to right, #11998e, #38ef7d)',
          height: { xs: '60px', sm: '70px', md: '80px' },
          boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.4)',
        }}
      >
        <Toolbar
          sx={{
            minHeight: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: { xs: '0 10px', sm: '0 20px' },
          }}
        >
          {/* Logo and Title Section */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: { xs: 1, sm: 2, md: 4 } }}
            >
              <img
                src={yummyYard}
                alt="Yummy Yard Logo"
                onClick={handleHomeClick}
                style={{
                  height: isMobile ? '40px' : '60px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  transition: 'transform 0.3s',
                }}
                onMouseEnter={(e) => (e.target.style.transform = 'scale(1.1)')}
                onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
              />
            </IconButton>
            
            {/* Hide on very small screens */}
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center' }}>
              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontWeight: 'bold',
                  fontSize: { xs: '20px', md: '30px' },
                  fontFamily: 'Poppins, sans-serif',
                  color: '#fff',
                  mr: 2,
                }}
              >
                Yummy Yard
              </Typography>
              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontSize: { xs: '14px', md: '20px' },
                  fontFamily: 'Poppins, sans-serif',
                  color: '#fff',
                  display: { xs: 'none', md: 'block' },
                }}
              >
                +94 76 718 1695
              </Typography>
            </Box>
          </Box>

          {/* User Welcome and Mobile Menu Toggle */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {user && !isMobile && (
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '16px',
                  color: '#fff',
                  mr: 2,
                }}
              >
                Welcome, {user.name}!
              </Typography>
            )}

            {/* Desktop Navigation */}
            {!isMobile ? (
              <NavItems />
            ) : (
              <>
                {user && (
                  <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <IconButton
                      color="inherit"
                      onClick={() => handleNavigation('/profile')}
                      sx={{ mr: 1 }}
                    >
                      <AccountCircleIcon sx={{ fontSize: 24, color: '#fff' }} />
                    </IconButton>
                    {/* Show delete request popup near profile icon in mobile navbar */}
                    {deleteRequest && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: -2,
                          right: -2,
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          background: 'radial-gradient(circle at 40% 40%, #ff1744 60%, #fff 100%)',
                          border: '2px solid #fff',
                          boxShadow: '0 0 8px 2px #ff1744, 0 0 0 4px rgba(255,23,68,0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 2,
                          animation: 'ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite',
                          '@keyframes ping': {
                            '0%': { boxShadow: '0 0 8px 2px #ff1744, 0 0 0 4px rgba(255,23,68,0.2)' },
                            '70%': { boxShadow: '0 0 16px 8px #ff1744, 0 0 0 16px rgba(255,23,68,0.1)' },
                            '100%': { boxShadow: '0 0 8px 2px #ff1744, 0 0 0 4px rgba(255,23,68,0.2)' },
                          }
                        }}
                      >
                        <span style={{
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: 10,
                          lineHeight: 1,
                          textShadow: '0 0 2px #ff1744',
                        }}>!</span>
                      </Box>
                    )}
                  </Box>
                )}
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={() => setMobileOpen(!mobileOpen)}
                >
                  <MenuIcon />
                </IconButton>
              </>
            )}

            {/* Logout Button for Desktop */}
            {user && !isMobile && (
              <Button
                color="inherit"
                onClick={handleLogout}
                sx={{
                  fontFamily: 'Poppins, sans-serif',
                  color: '#fff',
                  border: '1px solid #fff',
                  borderRadius: '20px',
                  padding: '5px 15px',
                  transition: 'background-color 0.3s, transform 0.3s',
                  '&:hover': {
                    backgroundColor: '#fff',
                    color: '#ff7e5f',
                    transform: 'scale(1.1)',
                  },
                }}
              >
                Logout
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar;