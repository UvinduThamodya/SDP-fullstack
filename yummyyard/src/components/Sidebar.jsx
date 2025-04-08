import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  // Avatar,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  styled
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

// Import icons from assets folder
import HomeIcon from '../assets/home.png';
import DashboardIcon from '../assets/dashboard.png';
// import OrderIcon from '../assets/purchase-order.png';
import MenuIconAsset from '../assets/menu.png'; // Corrected path
import InfoIcon from '@mui/icons-material/Info'; // Using Material UI Icon

// Styled components
const SidebarContainer = styled(Box)(({ theme, open }) => ({
  width: open ? 256 : 150, // Adjusted width when collapsed
  height: '100vh',
  backgroundColor: 'rgba(0, 0, 0, 0.6)', // Semi-transparent background
  backdropFilter: 'blur(10px)', // Glass effect
  color: '#FFFFFF',
  display: 'flex',
  flexDirection: 'column',
  position: 'fixed',
  top: 0,
  left: 0,
  padding: '16px',
  fontFamily: 'Poppins, sans-serif', // Changed font to Poppins
  transition: 'width 0.3s',
  overflow: 'hidden', // Ensure content is not cut off
  borderTopRightRadius: 20, // Curved top right edge
  borderBottomRightRadius: 20, // Curved bottom right edge
  zIndex: 1000, // Ensure sidebar is above other content
}));

const ContentContainer = styled(Box)(({ open }) => ({
  marginLeft: open ? 256 : 115, // Adjust margin based on sidebar width
  transition: 'margin-left 0.3s',
  padding: '16px',
  flexGrow: 1, // Allow content to grow and fill the remaining space
  fontFamily: 'Poppins, sans-serif', // Changed font to Poppins
}));

const NavButton = styled(ListItemButton)(({ active, open }) => ({
  backgroundColor: active ? '#868686' : '#D9D9D9',
  color: active ? '#000000' : '#000000',
  borderRadius: 4,
  marginBottom: 12,
  justifyContent: open ? 'flex-start' : 'center', // Center icons when sidebar is collapsed
  padding: open ? '8px 16px' : '8px', // Remove padding when collapsed
  minWidth: open ? 'auto' : 60, // Set minimum width when collapsed
  fontFamily: 'Poppins, sans-serif', // Changed font to Poppins
  '&:hover': {
    backgroundColor: active ? '#6B6B6B' : '#C0C0C0',
  },
}));

const LogoContainer = styled(Box)(({ open }) => ({
  width: open ? 180 : 0, // Adjusted width when sidebar is expanded
  height: open ? 180 : 0, // Adjusted height when sidebar is expanded
  borderRadius: '50%',
  backgroundColor: '#00E676',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  overflow: 'hidden',
  transition: 'width 0.03s, height 0.3s',
}));

const Sidebar = ({ children }) => {
  const [open, setOpen] = useState(() => {
    const savedState = localStorage.getItem('sidebarOpen');
    return savedState !== null ? JSON.parse(savedState) : true;
  });
  const location = useLocation();
  const navigate = useNavigate();
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

  useEffect(() => {
    localStorage.setItem('sidebarOpen', JSON.stringify(open));
  }, [open]);

  const toggleSidebar = () => {
    setOpen(!open);
  };

  // Function to handle home navigation based on authentication status
  const handleHomeClick = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (token) {
      // If user is logged in, go to user homepage
      navigate('/HomepageUser');
    } else {
      // If user is not logged in, go to public homepage
      navigate('/');
    }
  };

  return (
    <Box display="flex">
      <SidebarContainer open={open}>
        {/* User Profile Section */}
        <Box display="flex" alignItems="center" p={2} mb={2}>
          {open && (
            <Typography variant="h6" fontWeight="medium" sx={{ fontFamily: 'Poppins, sans-serif' }}>
              {user ? user.name : 'Guest'}
            </Typography>
          )}
          <IconButton onClick={toggleSidebar} sx={{ ml: 'auto', color: '#FFFFFF' }}>
            {open ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
        </Box>

        {/* Navigation Links */}
        <Box flex={1} px={2}>
          <List disablePadding>
            <ListItem disablePadding sx={{ mb: 1.5 }}>
              <NavButton
                active={location.pathname === '/' || location.pathname === '/HomepageUser'}
                onClick={handleHomeClick}
                open={open}
              >
                {open ? (
                  <ListItemText primary="Home" sx={{ textAlign: 'center', fontFamily: 'Poppins, sans-serif' }} />
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', width: 32, height: 32 }}>
                    <Box component="img" src={HomeIcon} alt="Home" sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </Box>
                )}
              </NavButton>
            </ListItem>

            <ListItem disablePadding sx={{ mb: 1.5 }}>
              <NavButton
                active={location.pathname === '/dashboard'}
                component={Link}
                to="/dashboard"
                open={open}
              >
                {open ? (
                  <ListItemText primary="Dashboard" sx={{ textAlign: 'center', fontFamily: 'Poppins, sans-serif' }} />
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', width: 32, height: 32 }}>
                    <Box component="img" src={DashboardIcon} alt="Dashboard" sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </Box>
                )}
              </NavButton>
            </ListItem>

            {/* <ListItem disablePadding sx={{ mb: 1.5 }}>
              <NavButton
                active={location.pathname === '/placeorder'}
                component={Link}
                to="/placeorder"
                open={open}
              >
                {open ? (
                  <ListItemText primary="Order" sx={{ textAlign: 'center', fontFamily: 'Poppins, sans-serif' }} />
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', width: 32, height: 32 }}>
                    <Box component="img" src={OrderIcon} alt="Order" sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </Box>
                )}
              </NavButton>
            </ListItem> */}

            <ListItem disablePadding sx={{ mb: 1.5 }}>
              <NavButton
                active={location.pathname === '/menu'}
                component={Link}
                to="/menu"
                open={open}
              >
                {open ? (
                  <ListItemText primary="Menu" sx={{ textAlign: 'center', fontFamily: 'Poppins, sans-serif' }} />
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', width: 32, height: 32 }}>
                    <Box component="img" src={MenuIconAsset} alt="Menu" sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </Box>
                )}
              </NavButton>
            </ListItem>

            {/* About Us */}
            <ListItem disablePadding sx={{ mb: 1.5 }}>
              <NavButton
                active={location.pathname === '/aboutcontact'}
                component={Link}
                to="/aboutcontact"
                open={open}
              >
                {open ? (
                  <ListItemText primary="About Us" sx={{ textAlign: 'center', fontFamily: 'Poppins, sans-serif' }} />
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', width: 32, height: 32 }}>
                    <InfoIcon sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </Box>
                )}
              </NavButton>
            </ListItem>

            {/* My Profile - Moved near About Us */}
            <ListItem disablePadding sx={{ mb: 1.5 }}>
              <NavButton
                active={location.pathname === '/profile'}
                component={Link}
                to="/profile"
                open={open}
              >
                {open ? (
                  <ListItemText primary="My Profile" sx={{ textAlign: 'center', fontFamily: 'Poppins, sans-serif' }} />
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', width: 32, height: 32 }}>
                    <AccountCircleIcon sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </Box>
                )}
              </NavButton>
            </ListItem>
          </List>
        </Box>
        {/* Logo at Bottom */}
        <Box display="flex" justifyContent="center" p={2} mb={4}>
          <LogoContainer open={open}>
            <Box
              component="img"
              src="/YummyYard_logo.png"
              alt="Yummy Yard"
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M12 4a2 2 0 00-2 2v2a2 2 0 104 0V6a2 2 0 00-2-2zm0 9a2.5 2.5 0 100 5 2.5 2.5 0 000-5zm9-2a9 9 0 11-18 0 9 9 0 0118 0z'/%3E%3C/svg%3E";
              }}
            />
          </LogoContainer>
        </Box>
      </SidebarContainer>
      <ContentContainer open={open}>
        {children}
      </ContentContainer>
    </Box>
  );
};

export default Sidebar;
