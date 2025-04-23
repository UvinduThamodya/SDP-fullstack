
// import React, { useState, useEffect } from 'react';
// import {
//   Box,
//   Typography,
//   Paper,
//   Button,
//   TextField,
//   Grid,
//   Container,
//   Divider,
//   Snackbar,
//   Alert,
//   CircularProgress
// } from '@mui/material';
// import EditIcon from '@mui/icons-material/Edit';
// import SaveIcon from '@mui/icons-material/Save';
// import CancelIcon from '@mui/icons-material/Cancel';
// import LogoutIcon from '@mui/icons-material/Logout';
// import Sidebar from '../../components/Sidebar';
// import { useNavigate } from 'react-router-dom';

// const CustomerProfile = () => {
//   const navigate = useNavigate();
  
//   // Add loading and error states
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
  
//   // Get customer data from localStorage as initial default
//   const [customer, setCustomer] = useState(() => {
//     const savedUser = localStorage.getItem('user');
//     return savedUser ? JSON.parse(savedUser) : {
//       name: 'John Doe',
//       email: 'john@example.com',
//       phone: '12345678',
//       address: '123 Main St'
//     };
//   });

//   // State for edit mode
//   const [editMode, setEditMode] = useState(false);
  
//   // State for form values
//   const [formValues, setFormValues] = useState({...customer});
  
//   // State for notifications
//   const [notification, setNotification] = useState({
//     open: false,
//     message: '',
//     severity: 'success'
//   });

//   // Fetch customer profile from API on component mount
//   useEffect(() => {
//     const fetchCustomerProfile = async () => {
//       try {
//         setLoading(true);
//         const token = localStorage.getItem('token');
        
//         if (!token) {
//           navigate('/login');
//           return;
//         }
        
//         const response = await fetch('http://localhost:5000/api/customers/profile', {
//           method: 'GET',
//           headers: {
//             'Authorization': `Bearer ${token}`
//           }
//         });
        
//         if (!response.ok) {
//           throw new Error('Failed to fetch profile');
//         }
        
//         const data = await response.json();
//         setCustomer(data);
//         setFormValues(data);
        
//         // Cache the user data in localStorage
//         localStorage.setItem('user', JSON.stringify(data));
//       } catch (error) {
//         console.error('Error fetching profile:', error);
//         setError(error.message);
//         setNotification({
//           open: true,
//           message: 'Failed to load profile data: ' + error.message,
//           severity: 'error'
//         });
//       } finally {
//         setLoading(false);
//       }
//     };
    
//     fetchCustomerProfile();
//   }, [navigate]);

//   // Handle edit button click
//   const handleEditClick = () => {
//     setEditMode(true);
//     setFormValues({...customer});
//   };

//   // Handle save button click with API integration
//   const handleSaveClick = async () => {
//     try {
//       setLoading(true);
//       const token = localStorage.getItem('token');
      
//       if (!token) {
//         navigate('/login');
//         return;
//       }
      
//       const response = await fetch('http://localhost:5000/api/customers/profile', {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify(formValues)
//       });
      
//       if (!response.ok) {
//         throw new Error('Failed to update profile');
//       }
      
//       const data = await response.json();
      
//       // Update state with the returned data
//       setCustomer(data.user || formValues);
//       setEditMode(false);
      
//       // Cache the updated user data in localStorage
//       localStorage.setItem('user', JSON.stringify(data.user || formValues));
      
//       // Show success notification
//       setNotification({
//         open: true,
//         message: 'Profile updated successfully!',
//         severity: 'success'
//       });
//     } catch (error) {
//       console.error('Error updating profile:', error);
//       setNotification({
//         open: true,
//         message: 'Failed to update profile: ' + error.message,
//         severity: 'error'
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle cancel button click
//   const handleCancelClick = () => {
//     setEditMode(false);
//     setFormValues({...customer});
//   };

//   // Handle form field changes
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormValues({
//       ...formValues,
//       [name]: value
//     });
//   };

//   // Handle notification close
//   const handleNotificationClose = () => {
//     setNotification({...notification, open: false});
//   };
  
//   // Handle logout
//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     navigate('/');
//   };

//   return (
//     <Box sx={{ display: 'flex', bgcolor: 'white', minHeight: '100vh' }}>
//       <Sidebar>
//         <Container maxWidth="md" sx={{ py: 5, ml: 40 }}>
//           {loading && !editMode ? (
//             <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
//               <CircularProgress />
//             </Box>
//           ) : error && !customer ? (
//             <Alert severity="error">
//               Error loading profile data. Please try again later.
//             </Alert>
//           ) : (
//             <Paper elevation={3} sx={{ p: 4, borderRadius: 2, mb: 3 }}>
//               <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
//                 <Typography variant="h4" component="h1" sx={{ fontFamily: 'Poppins, sans-serif' }}>
//                   My Profile
//                 </Typography>
//                 {!editMode ? (
//                   <Box>
//                     <Button 
//                       variant="contained" 
//                       startIcon={<EditIcon />}
//                       onClick={handleEditClick}
//                       sx={{ mr: 1 }}
//                     >
//                       Edit Profile
//                     </Button>
//                     <Button
//                       variant="outlined"
//                       color="error"
//                       startIcon={<LogoutIcon />}
//                       onClick={handleLogout}
//                     >
//                       Logout
//                     </Button>
//                   </Box>
//                 ) : (
//                   <Box>
//                     <Button 
//                       variant="outlined" 
//                       startIcon={<CancelIcon />}
//                       onClick={handleCancelClick}
//                       sx={{ mr: 1 }}
//                       disabled={loading}
//                     >
//                       Cancel
//                     </Button>
//                     <Button 
//                       variant="contained" 
//                       startIcon={loading ? null : <SaveIcon />}
//                       onClick={handleSaveClick}
//                       color="primary"
//                       disabled={loading}
//                     >
//                       {loading ? <CircularProgress size={24} /> : 'Save'}
//                     </Button>
//                   </Box>
//                 )}
//               </Box>

//               <Grid container spacing={4}>
//                 {/* Profile Info Section */}
//                 <Grid item xs={12}>
//                   <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Poppins, sans-serif' }}>
//                     Personal Information
//                   </Typography>
//                   <Divider sx={{ mb: 3 }} />
                  
//                   <Grid container spacing={2}>
//                     <Grid item xs={12} md={6}>
//                       <TextField
//                         fullWidth
//                         label="Full Name"
//                         name="name"
//                         value={editMode ? formValues.name : customer.name}
//                         onChange={handleChange}
//                         disabled={!editMode || loading}
//                         variant={editMode ? "outlined" : "filled"}
//                         InputProps={{
//                           readOnly: !editMode,
//                         }}
//                       />
//                     </Grid>
//                     <Grid item xs={12} md={6}>
//                       <TextField
//                         fullWidth
//                         label="Email Address"
//                         name="email"
//                         type="email"
//                         value={editMode ? formValues.email : customer.email}
//                         onChange={handleChange}
//                         disabled={!editMode || loading}
//                         variant={editMode ? "outlined" : "filled"}
//                         InputProps={{
//                           readOnly: !editMode,
//                         }}
//                       />
//                     </Grid>
//                     <Grid item xs={12} md={6}>
//                       <TextField
//                         fullWidth
//                         label="Phone Number"
//                         name="phone"
//                         value={editMode ? formValues.phone : customer.phone}
//                         onChange={handleChange}
//                         disabled={!editMode || loading}
//                         variant={editMode ? "outlined" : "filled"}
//                         InputProps={{
//                           readOnly: !editMode,
//                         }}
//                       />
//                     </Grid>
//                     <Grid item xs={12}>
//                       <TextField
//                         fullWidth
//                         label="Address"
//                         name="address"
//                         value={editMode ? formValues.address : customer.address}
//                         onChange={handleChange}
//                         disabled={!editMode || loading}
//                         variant={editMode ? "outlined" : "filled"}
//                         multiline
//                         rows={3}
//                         InputProps={{
//                           readOnly: !editMode,
//                         }}
//                       />
//                     </Grid>
//                   </Grid>
//                 </Grid>
//               </Grid>
//             </Paper>
//           )}
//         </Container>
//       </Sidebar>
      
//       {/* Notification */}
//       <Snackbar 
//         open={notification.open} 
//         autoHideDuration={6000} 
//         onClose={handleNotificationClose}
//         anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
//       >
//         <Alert 
//           onClose={handleNotificationClose} 
//           severity={notification.severity}
//           variant="filled"
//         >
//           {notification.message}
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// };

// export default CustomerProfile;

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Grid,
  Container,
  Divider,
  Snackbar,
  Alert,
  CircularProgress,
  Avatar,
  Card,
  CardContent,
IconButton,
  useTheme,
  alpha
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import HomeIcon from '@mui/icons-material/Home';
import Navbar from '../../components/Navbar'; // Import the Navbar component
import { useNavigate } from 'react-router-dom';

const CustomerProfile = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  
  // Add loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get customer data from localStorage as initial default
  const [customer, setCustomer] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '12345678',
      address: '123 Main St'
    };
  });

  // State for edit mode
  const [editMode, setEditMode] = useState(false);
  
  // State for form values
  const [formValues, setFormValues] = useState({...customer});
  
  // State for notifications
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    const fetchCustomerProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          navigate('/login');
          return;
        }
        
        const response = await fetch('http://localhost:5000/api/customers/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        
        const data = await response.json();
        setCustomer(data);
        setFormValues(data);
        
        // Cache the user data in localStorage
        localStorage.setItem('user', JSON.stringify(data));
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError(error.message);
        setNotification({
          open: true,
          message: 'Failed to load profile data: ' + error.message,
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchCustomerProfile();
  }, [navigate]);

  const handleEditClick = () => {
    setEditMode(true);
    setFormValues({...customer});
  };

  const handleSaveClick = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }
      
      const response = await fetch('http://localhost:5000/api/customers/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formValues)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      const data = await response.json();
      
      // Update state with the returned data
      setCustomer(data.user || formValues);
      setEditMode(false);
      
      // Cache the updated user data in localStorage
      localStorage.setItem('user', JSON.stringify(data.user || formValues));
      
      // Show success notification
      setNotification({
        open: true,
        message: 'Profile updated successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setNotification({
        open: true,
        message: 'Failed to update profile: ' + error.message,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = () => {
    setEditMode(false);
    setFormValues({...customer});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value
    });
  };

  const handleNotificationClose = () => {
    setNotification({...notification, open: false});
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'white' }}>
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Navbar /> {/* Add the Navbar component */}
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'flex', bgcolor: 'white', minHeight: '100vh' }}>
          
            <Container sx={{ py: 5, mt: 2 }}>
              {loading && !editMode ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <CircularProgress />
                </Box>
              ) : error && !customer ? (
                <Alert severity="error">
                  Error loading profile data. Please try again later.
                </Alert>
              ) : (
                <Box>
                  {/* User Info Card with Avatar */}
                  <Card 
                    elevation={4} 
                    sx={{ 
                      mb: 4, 
                      borderRadius: 3,
                      overflow: 'visible',
                      position: 'relative',
                      background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
                      color: 'white'
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        flexWrap: 'wrap'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: { xs: 2, md: 0 } }}>
                          <Avatar 
                            sx={{ 
                              width: 80, 
                              height: 80, 
                              bgcolor: 'white',
                              color: theme.palette.primary.main,
                              boxShadow: 3,
                              fontSize: 40
                            }}
                          >
                            {customer.name ? customer.name.charAt(0).toUpperCase() : 'U'}
                          </Avatar>
                          <Box>
                            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                              {customer.name}
                            </Typography>
                            <Typography variant="subtitle1">
                              {customer.email}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          {!editMode ? (
                            <>
                              <Button 
                                variant="contained" 
                                startIcon={<EditIcon />}
                                onClick={handleEditClick}
                                sx={{ 
                                  bgcolor: 'white', 
                                  color: theme.palette.primary.main,
                                  fontWeight: 'bold',
                                  '&:hover': {
                                    bgcolor: alpha(theme.palette.common.white, 0.9)
                                  }
                                }}
                              >
                                Edit Profile
                              </Button>
                              <Button
                                variant="outlined"
                                startIcon={<LogoutIcon />}
                                onClick={handleLogout}
                                sx={{ 
                                  borderColor: 'white', 
                                  color: 'white',
                                  '&:hover': {
                                    borderColor: alpha(theme.palette.common.white, 0.9),
                                    bgcolor: alpha(theme.palette.common.white, 0.1)
                                  }
                                }}
                              >
                                Logout
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button 
                                variant="outlined" 
                                startIcon={<CancelIcon />}
                                onClick={handleCancelClick}
                                sx={{ 
                                  borderColor: 'white', 
                                  color: 'white',
                                  '&:hover': {
                                    borderColor: alpha(theme.palette.common.white, 0.9),
                                    bgcolor: alpha(theme.palette.common.white, 0.1)
                                  }
                                }}
                                disabled={loading}
                              >
                                Cancel
                              </Button>
                              <Button 
                                variant="contained" 
                                startIcon={loading ? null : <SaveIcon />}
                                onClick={handleSaveClick}
                                sx={{ 
                                  bgcolor: 'white', 
                                  color: theme.palette.primary.main,
                                  fontWeight: 'bold',
                                  '&:hover': {
                                    bgcolor: alpha(theme.palette.common.white, 0.9)
                                  }
                                }}
                                disabled={loading}
                              >
                                {loading ? <CircularProgress size={24} color="primary" /> : 'Save'}
                              </Button>
                            </>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>

                  {/* Personal Information Card */}
                  <Paper 
                    elevation={3} 
                    sx={{ 
                      p: 4, 
                      borderRadius: 3,
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        boxShadow: 6
                      }
                    }}
                  >
                    <Typography 
                      variant="h5" 
                      gutterBottom 
                      sx={{ 
                        fontFamily: 'Poppins, sans-serif',
                        fontWeight: 'bold',
                        color: theme.palette.primary.main,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 3
                      }}
                    >
                      <PersonIcon sx={{ fontSize: 28 }} /> Personal Information
                    </Typography>
                    <Divider sx={{ mb: 4 }} />
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Full Name"
                          name="name"
                          value={editMode ? formValues.name : customer.name}
                          onChange={handleChange}
                          disabled={!editMode || loading}
                          variant={editMode ? "outlined" : "filled"}
                          InputProps={{
                            readOnly: !editMode,
                            startAdornment: <PersonIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />,
                          }}
                          sx={{
                            '& .MuiFilledInput-root': {
                              borderRadius: 2,
                              bgcolor: alpha(theme.palette.primary.main, 0.05),
                            },
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Email Address"
                          name="email"
                          type="email"
                          value={editMode ? formValues.email : customer.email}
                          onChange={handleChange}
                          disabled={!editMode || loading}
                          variant={editMode ? "outlined" : "filled"}
                          InputProps={{
                            readOnly: !editMode,
                            startAdornment: <EmailIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />,
                          }}
                          sx={{
                            '& .MuiFilledInput-root': {
                              borderRadius: 2,
                              bgcolor: alpha(theme.palette.primary.main, 0.05),
                            },
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Phone Number"
                          name="phone"
                          value={editMode ? formValues.phone : customer.phone}
                          onChange={handleChange}
                          disabled={!editMode || loading}
                          variant={editMode ? "outlined" : "filled"}
                          InputProps={{
                            readOnly: !editMode,
                            startAdornment: <PhoneIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />,
                          }}
                          sx={{
                            '& .MuiFilledInput-root': {
                              borderRadius: 2,
                              bgcolor: alpha(theme.palette.primary.main, 0.05),
                            },
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Address"
                          name="address"
                          value={editMode ? formValues.address : customer.address}
                          onChange={handleChange}
                          disabled={!editMode || loading}
                          variant={editMode ? "outlined" : "filled"}
                          multiline
                          rows={3}
                          InputProps={{
                            readOnly: !editMode,
                            startAdornment: <HomeIcon sx={{ mr: 1, mt: 1, color: theme.palette.text.secondary }} />,
                          }}
                          sx={{
                            '& .MuiFilledInput-root': {
                              borderRadius: 2,
                              bgcolor: alpha(theme.palette.primary.main, 0.05),
                            },
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2
                            }
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Box>
              )}
            </Container>
          
          
          {/* Notification */}
          <Snackbar 
            open={notification.open} 
            autoHideDuration={6000} 
            onClose={handleNotificationClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert 
              onClose={handleNotificationClose} 
              severity={notification.severity}
              variant="filled"
              sx={{ borderRadius: 2 }}
            >
              {notification.message}
            </Alert>
          </Snackbar>
        </Box>
      </Box>
    </Box>
  );
};

export default CustomerProfile;
