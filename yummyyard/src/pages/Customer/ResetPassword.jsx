import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiService from '../../services/api';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Paper,
  CircularProgress,
  Container,
  InputAdornment,
  Alert
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import CheckIcon from '@mui/icons-material/Check';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Background from '../../assets/Background.jpg';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  // Validate token on component mount
  useEffect(() => {
    const validateToken = async () => {
      try {
        if (!token) {
          setError('Invalid password reset link');
          setIsValid(false);
          setIsLoading(false);
          return;
        }

        const response = await apiService.verifyResetToken(token);
        
        if (response.valid) {
          setIsValid(true);
        } else {
          setError('This password reset link is invalid or has expired');
          setIsValid(false);
        }
      } catch (error) {
        setError('This password reset link is invalid or has expired');
        setIsValid(false);
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, [token]);

  const validatePassword = (password) => {
    // Minimum 8 characters
    return password.length >= 8;
  };

  const passwordsMatch = () => {
    return password === confirmPassword;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset previous states
    setIsSubmitting(true);
    setError('');
    setMessage('');
    
    try {
      // Validate password strength
      if (!validatePassword(password)) {
        setError('Password must be at least 8 characters long');
        setIsSubmitting(false);
        return;
      }
      
      // Validate password match
      if (!passwordsMatch()) {
        setError('Passwords do not match');
        setIsSubmitting(false);
        return;
      }
      
      // Call the API
      const response = await apiService.resetPassword({ 
        token, 
        password 
      });
      
      // Success response
      setIsSuccess(true);
      setMessage(response.message || 'Your password has been reset successfully!');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      setIsSuccess(false);
      setError(
        error.response?.data?.error || 
        'Failed to reset your password. Please try again later.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundImage: `url(${Background})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Box sx={{ 
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          padding: 4,
          borderRadius: 3,
        }}>
          <CircularProgress size={60} thickness={4} sx={{ color: '#10b981' }} />
          <Typography variant="h6" sx={{ mt: 3, color: 'text.secondary' }}>
            Verifying your reset link...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundImage: `url(${Background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: 2
      }}
    >
      <Paper elevation={3} sx={{ 
        p: 4, 
        borderRadius: 3, 
        width: '100%',
        maxWidth: 450,
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
      }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography component="h1" variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
            Reset Your Password
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
            {isValid ? 
              'Create a new password for your account' : 
              'There was a problem with your reset link'}
          </Typography>
          
          {!isValid ? (
            <Box sx={{ width: '100%' }}>
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Please request a new password reset link.
                </Typography>
              </Alert>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Button
                  component={Link}
                  to="/forgot-password"
                  startIcon={<ArrowBackIcon />}
                  variant="outlined"
                  sx={{ 
                    textTransform: 'none',
                    color: '#10b981',
                    borderColor: '#10b981',
                    '&:hover': {
                      borderColor: '#0e9f6e',
                      backgroundColor: 'rgba(16, 185, 129, 0.04)'
                    }
                  }}
                >
                  Request a new reset link
                </Button>
              </Box>
            </Box>
          ) : !isSuccess ? (
            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="New Password"
                type="password"
                id="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm New Password"
                type="password"
                id="confirmPassword"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CheckIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Password must be at least 8 characters long
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isSubmitting}
                sx={{ 
                  mt: 3, 
                  mb: 2,
                  py: 1.5,
                  bgcolor: '#10b981',
                  '&:hover': {
                    bgcolor: '#0e9f6e'
                  }
                }}
              >
                {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
              </Button>
            </Box>
          ) : (
            <Alert severity="success" sx={{ width: '100%' }}>
              <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                {message}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                You will be redirected to the login page shortly...
              </Typography>
            </Alert>
          )}
          
          <Box sx={{ mt: 3 }}>
            <Button
              component={Link}
              to="/login"
              startIcon={<ArrowBackIcon />}
              size="small"
              sx={{ 
                textTransform: 'none',
                color: '#10b981'
              }}
            >
              Back to login
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default ResetPassword;
