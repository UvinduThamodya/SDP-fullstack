import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  Grid,
  Alert,
} from "@mui/material";
import apiService from '../services/api';
import { useNavigate } from "react-router-dom"; // Add this line

const Register = () => {
  const navigate = useNavigate(); // Initialize useNavigate hook

  // State for form inputs
  const [formData, setFormData] = useState({
    name: "",  // Changed from "username" to "name"
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: ""
  });
  

  // State for form errors
  const [errors, setErrors] = useState({});
  
  // State for submission status
  const [submitStatus, setSubmitStatus] = useState({
    submitted: false,
    success: false,
    message: ""
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing in a field with error
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ""
      });
    }
  };

  // Validate form data
  const validateForm = () => {
    const newErrors = {};
    
    // Username validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }
    
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    
    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = "Phone number must be 10 digits";
    }
    
    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    
    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const isValid = validateForm();
    if (!isValid) return;
    
    // Set loading state
    setSubmitStatus({
      submitted: true,
      success: false,
      message: "Processing registration..."
    });
    
    try {
      await apiService.register(formData);
      setSubmitStatus({
        submitted: true,
        success: true,
        message: "Registration successful! Redirecting..."
      });
      
      // Redirect to HomepageUser after successful registration
      setTimeout(() => navigate('/HomepageUser'), 2000);
    } catch (error) {
      setSubmitStatus({
        submitted: true,
        success: false,
        message: error.message
      });
    }
  };

  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        fontFamily: 'Poppins, sans-serif',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh'
      }}
    >
      <Grid container spacing={0} sx={{ height: '80vh' }}>
        <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Paper
            elevation={0}
            sx={{
              padding: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              fontFamily: 'Poppins, sans-serif',
              borderRadius: '15px 0 0 15px',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(1px)',
              boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              flex: 1
            }}
          >
            <Typography variant="h3" sx={{ fontWeight: "bold", marginBottom: 2, fontSize: {xs: '2rem', sm: '2.5rem'} }}>
              Hello,
            </Typography>
            <Typography variant="subtitle1" sx={{ marginBottom: 4, color: '#666' }}>
              Welcome to an Island of Flavors
            </Typography>
            
            {submitStatus.submitted && (
              <Alert 
                severity={submitStatus.success ? "success" : "info"} 
                sx={{ width: "100%", marginBottom: 2 }}
              >
                {submitStatus.message}
              </Alert>
            )}
            
            <Box component="form" sx={{ width: "100%" }} onSubmit={handleSubmit} noValidate>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                <TextField
    fullWidth
    label="Name"  // Changed label from "Username" to "Name"
    name="name"   // Changed name from "username" to "name"
    variant="outlined"
    value={formData.username}  // Keep using formData.username for the field value
    onChange={handleChange}
    error={!!errors.username}
    helperText={errors.username}
    required
    placeholder="Enter your name"
    sx={{ background: 'rgba(255, 255, 255, 0.6)', borderRadius: 1 }}
  />
                </Grid>
                <Grid item xs={12}>
                  <TextField 
                    fullWidth 
                    label="E-mail" 
                    name="email"
                    variant="outlined" 
                    value={formData.email}
                    onChange={handleChange}
                    error={!!errors.email}
                    helperText={errors.email}
                    required 
                    placeholder="example@example.com"
                    sx={{ background: 'rgba(255, 255, 255, 0.6)', borderRadius: 1 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Phone number"
                    name="phone"
                    variant="outlined"
                    value={formData.phone}
                    onChange={handleChange}
                    error={!!errors.phone}
                    helperText={errors.phone}
                    required
                    placeholder="(+94) 71 234 5678"
                    sx={{ background: 'rgba(255, 255, 255, 0.6)', borderRadius: 1 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    name="address"
                    variant="outlined"
                    value={formData.address}
                    onChange={handleChange}
                    error={!!errors.address}
                    helperText={errors.address}
                    required
                    placeholder="Enter your address"
                    sx={{ background: 'rgba(255, 255, 255, 0.6)', borderRadius: 1 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type="password"
                    variant="outlined"
                    value={formData.password}
                    onChange={handleChange}
                    error={!!errors.password}
                    helperText={errors.password}
                    required
                    placeholder="Enter your password"
                    sx={{ background: 'rgba(255, 255, 255, 0.6)', borderRadius: 1 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Confirm Password"
                    name="confirmPassword"
                    type="password"
                    variant="outlined"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword}
                    required
                    placeholder="Re-enter your password"
                    sx={{ background: 'rgba(255, 255, 255, 0.6)', borderRadius: 1 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    color="primary"
                    sx={{ 
                      padding: '12px', 
                      fontSize: 16, 
                      marginTop: 2,
                      borderRadius: '8px',
                      background: '#4285F4',
                      '&:hover': {
                        background: '#059669'
                      }
                    }}
                    disabled={submitStatus.submitted && !submitStatus.success}
                  >
                    Register
                  </Button>
                </Grid>
              </Grid>
            </Box>
            <Box sx={{ width: "100%", textAlign: "center", marginTop: 2 }}>
              <Typography variant="body2">
                Already have an account? <a href="/login" style={{ color: '#4285F4', textDecoration: 'none' }}>Log in here!</a>
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Paper
            elevation={0}
            sx={{
              padding: 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: '0 15px 15px 0',
              background: '#33CC66',
              flex: 1,
              overflow: 'hidden'
            }}
          >
            <Box
              component="img"
              src="/YummyYard_logo.png" 
              alt="Yummy Yard Logo"
              sx={{
                width: '80%',
                maxWidth: '500px',
                height: 'auto',
              }}
            />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Register;