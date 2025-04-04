// import React, { useState, useEffect } from 'react'; // Added useEffect import
// import { useNavigate, Link as RouterLink } from 'react-router-dom';
// import apiService from '../services/api';
// import Logo from '../assets/YummyYard_logo.png';

// // Material UI imports
// import {
//   Box,
//   Button,
//   Checkbox,
//   FormControlLabel,
//   Grid,
//   IconButton,
//   InputAdornment,
//   Link,
//   Paper,
//   TextField,
//   Typography,
//   Snackbar,
//   Alert,
// } from '@mui/material';
// import { Visibility, VisibilityOff } from '@mui/icons-material';

// const Login = () => {
//   const [credentials, setCredentials] = useState({
//     username: '',
//     password: ''
//   });
//   const [rememberMe, setRememberMe] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [alert, setAlert] = useState({
//     open: false,
//     message: '',
//     severity: 'success',
//   });
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setCredentials(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleCheckbox = (e) => {
//     setRememberMe(e.target.checked);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError('');
  
//     try {
//       const response = await apiService.login(credentials);
  
//       if (response.user) {
//         localStorage.setItem('user', JSON.stringify(response.user));
  
//         if (rememberMe) {
//           localStorage.setItem('username', credentials.username);
//         } else {
//           localStorage.removeItem('username');
//         }
  
//         setAlert({
//           open: true,
//           message: 'Login successful!',
//           severity: 'success',
//         });
//         navigate('/Homepage'); // Navigate to Homepage
//       }
//     } catch (err) {
//       setError(err.message || 'Login failed. Please try again.');
//       setAlert({
//         open: true,
//         message: 'Login failed. Please try again.',
//         severity: 'error',
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };
  
//   // Reset error when user starts typing again
//   useEffect(() => {
//     setError('');
//   }, [credentials]);
  
//   const handleClickShowPassword = () => {
//     setShowPassword(!showPassword);
//   };

//   const handleMouseDownPassword = (event) => {
//     event.preventDefault();
//   };

//   const handleCloseAlert = () => {
//     setAlert({ ...alert, open: false });
//   };

//   return (
//     <Box
//       sx={{
//         height: '100vh',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         backgroundImage: 'url(../public/Background.jpg)',
//         backgroundSize: 'cover',
//         backgroundPosition: 'center',
        
//       }}
//     >
//       <Paper 
//         elevation={3} 
//         sx={{ 
//           width: '90%',
//           maxWidth: '1000px',
//           borderRadius: 3,
//           overflow: 'hidden',
//           padding: 0, // Reduced padding
//         }}
//       >
//         <Grid container>
//           {/* Left Column - Login Form */}
//           <Grid item xs={12} md={6} sx={{ 
//             display: 'flex', 
//             flexDirection: 'column', 
//             padding: 3,
//             background: 'rgba(255, 255, 255, 0.2)',
//             backdropFilter: 'blur(10px)',
//             borderRadius: '15px 0 0 15px',
//             boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
//             border: '1px solid rgba(255, 255, 255, 0.3)',
//           }}> 
//             <Box sx={{ mb: 5 }}>
//               <Typography variant="h4" component="h1" fontWeight="bold" sx={{ fontSize: '1.75rem' }}> 
//                 Welcome Back,
//               </Typography>
//               <Typography variant="h6" color="text.secondary" sx={{ fontSize: '1rem' }}>
//                 Welcome again to an Island of Flavors
//               </Typography>
//             </Box>
            
//             {error && (
//               <Box sx={{ backgroundColor: '#ffebee', color: '#d32f2f', p: 3, borderRadius: 1, mb: 5 }}>
//                 {error}
//               </Box>
//             )}
            
//             <Box component="form" onSubmit={handleSubmit} sx={{ flex: 1 }}>
//               <TextField
//                 margin="normal"
//                 required
//                 fullWidth
//                 id="username"
//                 label="Username"
//                 name="username"
//                 autoComplete="username"
//                 placeholder="Your Username"
//                 autoFocus
//                 value={credentials.username}
//                 onChange={handleChange}
//                 sx={{ fontSize: '1.2rem' }}
//               />
              
//               <TextField
//                 margin="normal"
//                 required
//                 fullWidth
//                 name="password"
//                 label="Password"
//                 type={showPassword ? 'text' : 'password'}
//                 id="password"
//                 autoComplete="current-password"
//                 placeholder="Enter your password"
//                 value={credentials.password}
//                 onChange={handleChange}
//                 InputProps={{
//                   endAdornment: (
//                     <InputAdornment position="end">
//                       <IconButton
//                         aria-label="toggle password visibility"
//                         onClick={handleClickShowPassword}
//                         onMouseDown={handleMouseDownPassword}
//                         edge="end"
//                       >
//                         {showPassword ? <VisibilityOff /> : <Visibility />}
//                       </IconButton>
//                     </InputAdornment>
//                   ),
//                   sx: { fontSize: '1.2rem' }
//                 }}
//               />
              
//               <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 3 }}>
//                 <FormControlLabel
//                   control={<Checkbox checked={rememberMe} onChange={handleCheckbox} color="primary" />}
//                   label="Remember Me"
//                   sx={{ fontSize: '1.2rem' }}
//                 />
//                 <Link component={RouterLink} to="/forgot-password" color="primary" underline="hover" sx={{ fontSize: '1.2rem' }}>
//                   Forgot Password?
//                 </Link>
//               </Box>
              
//               <Button
//                 type="submit"
//                 fullWidth
//                 variant="contained"
//                 color="primary"
//                 disabled={isLoading}
//                 sx={{ 
//                   mt: 3, 
//                   mb: 3, 
//                   py: 2,
//                   fontSize: '1.2rem',
//                   backgroundColor: '#4285F4', // Green color
//                   '&:hover': {
//                     backgroundColor: '#059669', // Darker green
//                   },
//                 }}
//               >
//                 {isLoading ? 'Logging in...' : 'Login'}
//               </Button>
              
//               <Box sx={{ textAlign: 'center', mt: 3 }}>
//                 <Typography variant="body1">
//                   Don't have an account?{' '}
//                   <Link component={RouterLink} to="/" color="primary" underline="hover" sx={{ fontSize: '1.2rem' }}>
//                     Register Now!
//                   </Link>
//                 </Typography>
//               </Box>
//             </Box>
//           </Grid>
          
//           {/* Right Column - Logo Only */}
//           <Grid item xs={12} md={6} sx={{ backgroundColor: '#10b981', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 3 }}> {/* Reduced padding */}
//             <Box sx={{ width: '100%', maxWidth: '500px' }}>
//               <img 
//                 src={Logo} 
//                 alt="Yummy Yard Logo" 
//                 style={{ width: '100%', height: 'auto' }} 
//               />
//             </Box>
//           </Grid>
//         </Grid>
//       </Paper>
//       <Snackbar
//         open={alert.open}
//         autoHideDuration={3000}
//         onClose={handleCloseAlert}
//         anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
//       >
//         <Alert onClose={handleCloseAlert} severity={alert.severity} sx={{ width: '100%' }}>
//           {alert.message}
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// };

// export default Login;




// import React, { useState, useEffect } from 'react';
// import { useNavigate, Link as RouterLink } from 'react-router-dom';
// import apiService from '../services/api';
// import Logo from '../assets/YummyYard_logo.png';

// // Material UI imports
// import {
//   Box,
//   Button,
//   Checkbox,
//   FormControlLabel,
//   Grid,
//   IconButton,
//   InputAdornment,
//   Link,
//   Paper,
//   TextField,
//   Typography,
//   Snackbar,
//   Alert,
// } from '@mui/material';
// import { Visibility, VisibilityOff } from '@mui/icons-material';

// const Login = () => {
//   const [credentials, setCredentials] = useState({
//     username: '',
//     password: ''
//   });
//   const [rememberMe, setRememberMe] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [alert, setAlert] = useState({
//     open: false,
//     message: '',
//     severity: 'success',
//   });

//   const navigate = useNavigate(); // Correctly initialize navigate

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setCredentials(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleCheckbox = (e) => {
//     setRememberMe(e.target.checked);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault(); // Ensure the form does not refresh

//     setIsLoading(true);
//     setError('');

//     try {
//       const response = await apiService.login(credentials);

//       if (response.user) {
//         localStorage.setItem('user', JSON.stringify(response.user));

//         if (rememberMe) {
//           localStorage.setItem('username', credentials.username);
//         } else {
//           localStorage.removeItem('username');
//         }

//         setAlert({
//           open: true,
//           message: 'Login successful!',
//           severity: 'success',
//         });

//         // ✅ Fix: Ensure correct navigation to homepage
//         setTimeout(() => {
//           navigate('/homepage'); 
//         }, 2000);
//       }
//     } catch (err) {
//       setError(err.message || 'Login failed. Please try again.');
//       setAlert({
//         open: true,
//         message: 'Login failed. Please check your credentials.',
//         severity: 'error',
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     setError('');
//   }, [credentials]);

//   const handleClickShowPassword = () => {
//     setShowPassword(!showPassword);
//   };

//   const handleMouseDownPassword = (event) => {
//     event.preventDefault();
//   };

//   const handleCloseAlert = () => {
//     setAlert({ ...alert, open: false });
//   };

//   return (
//     <Box
//       sx={{
//         height: '100vh',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         backgroundImage: 'url(../public/Background.jpg)',
//         backgroundSize: 'cover',
//         backgroundPosition: 'center',
//       }}
//     >
//       <Paper 
//         elevation={3} 
//         sx={{ 
//           width: '90%',
//           maxWidth: '1000px',
//           borderRadius: 3,
//           overflow: 'hidden',
//           padding: 0, // Reduced padding
//         }}
//       >
//         <Grid container>
//           {/* Left Column - Login Form */}
//           <Grid item xs={12} md={6} sx={{ 
//             display: 'flex', 
//             flexDirection: 'column', 
//             padding: 3,
//             background: 'rgba(255, 255, 255, 0.2)',
//             backdropFilter: 'blur(10px)',
//             borderRadius: '15px 0 0 15px',
//             boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
//             border: '1px solid rgba(255, 255, 255, 0.3)',
//           }}> 
//             <Box sx={{ mb: 5 }}>
//               <Typography variant="h4" component="h1" fontWeight="bold" sx={{ fontSize: '1.75rem' }}> 
//                 Welcome Back,
//               </Typography>
//               <Typography variant="h6" color="text.secondary" sx={{ fontSize: '1rem' }}>
//                 Welcome again to an Island of Flavors
//               </Typography>
//             </Box>
            
//             {error && (
//               <Box sx={{ backgroundColor: '#ffebee', color: '#d32f2f', p: 3, borderRadius: 1, mb: 5 }}>
//                 {error}
//               </Box>
//             )}
            
//             <Box component="form" onSubmit={handleSubmit} sx={{ flex: 1 }}>
//               <TextField
//                 margin="normal"
//                 required
//                 fullWidth
//                 id="username"
//                 label="Username"
//                 name="username"
//                 autoComplete="username"
//                 placeholder="Your Username"
//                 autoFocus
//                 value={credentials.username}
//                 onChange={handleChange}
//                 sx={{ fontSize: '1.2rem' }}
//               />
              
//               <TextField
//                 margin="normal"
//                 required
//                 fullWidth
//                 name="password"
//                 label="Password"
//                 type={showPassword ? 'text' : 'password'}
//                 id="password"
//                 autoComplete="current-password"
//                 placeholder="Enter your password"
//                 value={credentials.password}
//                 onChange={handleChange}
//                 InputProps={{
//                   endAdornment: (
//                     <InputAdornment position="end">
//                       <IconButton
//                         aria-label="toggle password visibility"
//                         onClick={handleClickShowPassword}
//                         onMouseDown={handleMouseDownPassword}
//                         edge="end"
//                       >
//                         {showPassword ? <VisibilityOff /> : <Visibility />}
//                       </IconButton>
//                     </InputAdornment>
//                   ),
//                   sx: { fontSize: '1.2rem' }
//                 }}
//               />
              
//               <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 3 }}>
//                 <FormControlLabel
//                   control={<Checkbox checked={rememberMe} onChange={handleCheckbox} color="primary" />}
//                   label="Remember Me"
//                   sx={{ fontSize: '1.2rem' }}
//                 />
//                 <Link component={RouterLink} to="/forgot-password" color="primary" underline="hover" sx={{ fontSize: '1.2rem' }}>
//                   Forgot Password?
//                 </Link>
//               </Box>
              
//               <Button
//                 type="submit"
//                 fullWidth
//                 variant="contained"
//                 color="primary"
//                 disabled={isLoading}
//                 sx={{ mt: 3, mb: 3, py: 2, fontSize: '1.2rem' }}
//               >
//                 {isLoading ? 'Logging in...' : 'Login'}
//               </Button>
//             </Box>
//           </Grid>
          
//           {/* Right Column - Logo Only */}
//           <Grid item xs={12} md={6} sx={{ backgroundColor: '#10b981', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 3 }}>
//             <Box sx={{ width: '100%', maxWidth: '500px' }}>
//               <img src={Logo} alt="Yummy Yard Logo" style={{ width: '100%', height: 'auto' }} />
//             </Box>
//           </Grid>
//         </Grid>
//       </Paper>
//       <Snackbar open={alert.open} autoHideDuration={3000} onClose={handleCloseAlert}>
//         <Alert onClose={handleCloseAlert} severity={alert.severity} sx={{ width: '100%' }}>
//           {alert.message}
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// };

// export default Login;


import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import apiService from '../services/api';
import Logo from '../assets/YummyYard_logo.png';

// Material UI imports
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  TextField,
  Typography,
  Snackbar,
  Alert,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: '',  // ✅ Change "username" to "email" (matches backend)
    password: ''
  });

  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckbox = (e) => {
    setRememberMe(e.target.checked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await apiService.login(credentials);

      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));

        if (rememberMe) {
          localStorage.setItem('email', credentials.email);
        } else {
          localStorage.removeItem('email');
        }

        setAlert({
          open: true,
          message: 'Login successful!',
          severity: 'success',
        });

        // ✅ Redirect to homepage after login
        setTimeout(() => {
          navigate('/HomepageUser');
        }, 2000);
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
      setAlert({
        open: true,
        message: 'Login failed. Please check your credentials.',
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setError('');
  }, [credentials]);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'url(../public/Background.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          width: '90%',
          maxWidth: '1000px',
          borderRadius: 3,
          overflow: 'hidden',
          padding: 0,
        }}
      >
        <Grid container>
          {/* Left Column - Login Form */}
          <Grid item xs={12} md={6} sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            padding: 3,
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            borderRadius: '15px 0 0 15px',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
          }}> 
            <Box sx={{ mb: 5 }}>
              <Typography variant="h4" component="h1" fontWeight="bold" sx={{ fontSize: '1.75rem' }}> 
                Welcome Back,
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ fontSize: '1rem' }}>
                Welcome again to an Island of Flavors
              </Typography>
            </Box>
            
            {error && (
              <Box sx={{ backgroundColor: '#ffebee', color: '#d32f2f', p: 3, borderRadius: 1, mb: 5 }}>
                {error}
              </Box>
            )}
            
            <Box component="form" onSubmit={handleSubmit} sx={{ flex: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email"
                name="email"
                autoComplete="email"
                placeholder="Your Email"
                autoFocus
                value={credentials.email}
                onChange={handleChange}
                sx={{ fontSize: '1.2rem' }}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={credentials.password}
                onChange={handleChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: { fontSize: '1.2rem' }
                }}
              />
              <Box sx={{ width: "100%", textAlign: "center", marginTop: 2 }}>
  <Typography variant="body2">
    New for the island of flavours? <a href="/Register" style={{ color: '#4285F4', textDecoration: 'none' }}>Register in here!</a>
  </Typography>
</Box>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                disabled={isLoading}
                sx={{ mt: 3, mb: 3, py: 2, fontSize: '1.2rem' }}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </Box>
          </Grid>
          
          {/* Right Column - Logo Only */}
          <Grid item xs={12} md={6} sx={{ backgroundColor: '#10b981', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 3 }}>
            <Box sx={{ width: '100%', maxWidth: '500px' }}>
              <img src={Logo} alt="Yummy Yard Logo" style={{ width: '100%', height: 'auto' }} />
            </Box>
          </Grid>
        </Grid>
      </Paper>
      <Snackbar open={alert.open} autoHideDuration={3000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity={alert.severity} sx={{ width: '100%' }}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Login;

