import React, { useState, useEffect } from 'react';
import { Box, Typography, Container } from '@mui/material';
import SidebarStaff from '../../components/SidebarStaff';

const Order = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // Replace this with your actual API call or data fetching logic
    const fetchCategories = async () => {
      const mockCategories = ['Appetizers', 'Main Course', 'Desserts', 'Beverages'];
      setCategories(mockCategories);
    };
    fetchCategories();
  }, []);

  return (
    <Box sx={{ display: 'flex' }}>
      <SidebarStaff />
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          backgroundColor: '#f5f5f5',
          minHeight: '100vh'
        }}
      >
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Orders
          </Typography>
          <Typography variant="body1">
            Manage all your restaurant orders here. You can view, update, and track order status.
          </Typography>
          <Typography variant="h4" gutterBottom>
            Menu Categories
          </Typography>
          <Box>
            {categories.map((category, index) => (
              <Typography key={index} variant="body1" sx={{ mb: 1 }}>
                {category}
              </Typography>
            ))}
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Order;
