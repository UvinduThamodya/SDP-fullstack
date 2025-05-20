import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../../services/api';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Paper, 
  CircularProgress,
  Container,
  InputAdornment
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset previous states
    setIsSubmitting(true);
    setError('');
    setMessage('');
    
    try {
      // Validate email format
      if (!email || !email.includes('@')) {
        setError('Please enter a valid email address');
        setIsSubmitting(false);
        return;
      }
      
      // Call the API
      const response = await apiService.requestPasswordReset({ email });
      
      // Success response
      setIsSuccess(true);
      setMessage(response.message || 'Password reset email sent successfully!');
    } catch (error) {
      setIsSuccess(false);
      setError(
        error.response?.data?.error || 
        'Failed to process your request. Please try again later.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, width: '100%' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography component="h1" variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
            Reset Your Password
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
            Enter your email address and we'll send you a link to reset your password.
          </Typography>
          
          {!isSuccess ? (
            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              {error && (
                <Box sx={{ mt: 2, p: 2, bgcolor: '#ffebee', color: '#d32f2f', borderRadius: 1 }}>
                  {error}
                </Box>
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
                {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Send Reset Link'}
              </Button>
            </Box>
          ) : (
            <Box sx={{ mt: 2, p: 3, bgcolor: '#e8f5e9', color: '#2e7d32', borderRadius: 1, width: '100%' }}>
              <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                {message}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Please check your email inbox and spam folder for the password reset link.
              </Typography>
            </Box>
          )}
          
          <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Button
              component={Link}
              to="/login"
              startIcon={<ArrowBackIcon />}
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
    </Container>
  );
};

export default ForgotPassword;
