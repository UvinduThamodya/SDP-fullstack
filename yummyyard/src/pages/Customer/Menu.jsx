import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Container, Grid, Card, CardMedia, CardContent, Button,
  Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Snackbar, Alert, TextField
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PaymentIcon from '@mui/icons-material/Payment';
import Sidebar from '../../components/Sidebar';
import MenuService from '../../services/menuService';
import apiService from '../../services/api';
import ImageUploader from '../../components/ImageUploader'; // New component

const formatCurrency = (price, currency = 'LKR', locale = 'en-LK') => 
  new Intl.NumberFormat(locale, { style: 'currency', currency }).format(price);

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]); // State to store menu items
  const [selectedCategory, setSelectedCategory] = useState('Main-Dishes'); // State for category filtering
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Filter items to display based on the selected category
  const displayItems = menuItems.filter((item) => item.category === selectedCategory);

  // Example useEffect to fetch menu items (replace with your API call)
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const items = await MenuService.getMenuItems(); // Replace with your API call
        setMenuItems(items);
      } catch (error) {
        console.error('Failed to fetch menu items:', error);
      }
    };

    fetchMenuItems();
  }, []);

  // New state for menu item creation
  const [newMenuItem, setNewMenuItem] = useState({
    name: '',
    description: '',
    price: 0,
    category: 'Main-Dishes',
    image_url: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);

  // Modified CardMedia component with Cloudinary URL handling
  const MenuItemCard = ({ item }) => (
    <Card sx={{ display: 'flex', flexDirection: 'column' }}>
      <CardMedia 
        component="img" 
        height="200" 
        image={item.image_url} // Direct Cloudinary URL
        alt={item.name}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent sx={{ flexGrow: 1, pt: 2 }}>
        <Typography variant="h5">{item.name}</Typography>
        <Typography variant="body2">{item.description}</Typography>
        <Typography variant="h6" sx={{ mt: 2 }}>
          {formatCurrency(item.price)}
        </Typography>
        <Button
          variant="outlined"
          fullWidth
          startIcon={<ShoppingCartIcon />}
          onClick={() => handleAddToCart(item.item_id)}
        >
          Add to cart
        </Button>
      </CardContent>
    </Card>
  );

  // New menu item creation form
  const AddMenuItemForm = () => (
    <Dialog open={showAddForm} onClose={() => setShowAddForm(false)}>
      <DialogTitle>Add New Menu Item</DialogTitle>
      <DialogContent>
        <TextField
          label="Item Name"
          fullWidth
          sx={{ mb: 2 }}
          onChange={(e) => setNewMenuItem({...newMenuItem, name: e.target.value})}
        />
        <TextField
          label="Description"
          fullWidth
          multiline
          sx={{ mb: 2 }}
          onChange={(e) => setNewMenuItem({...newMenuItem, description: e.target.value})}
        />
        <TextField
          label="Price"
          type="number"
          fullWidth
          sx={{ mb: 2 }}
          onChange={(e) => setNewMenuItem({...newMenuItem, price: parseFloat(e.target.value)})}
        />
        <ImageUploader 
          onUpload={(url) => setNewMenuItem({...newMenuItem, image_url: url})}
        />
        <Button 
          variant="contained" 
          onClick={handleCreateMenuItem}
          sx={{ mt: 2 }}
        >
          Create Item
        </Button>
      </DialogContent>
    </Dialog>
  );

  // New menu item creation handler
  const handleCreateMenuItem = async () => {
    try {
      await apiService.createMenuItem(newMenuItem);
      setMenuItems([...menuItems, newMenuItem]);
      setShowAddForm(false);
      setNotification({
        open: true,
        message: 'Menu item created successfully!',
        severity: 'success'
      });
    } catch (error) {
      setNotification({
        open: true,
        message: 'Failed to create menu item',
        severity: 'error'
      });
    }
  };

  const handleAddToCart = async (itemId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ itemId, quantity: 1 }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to add item to cart');
      }
  
      const data = await response.json();
      setNotification({
        open: true,
        message: 'Item added to cart successfully!',
        severity: 'success',
      });
    } catch (error) {
      setNotification({
        open: true,
        message: 'Failed to add item to cart',
        severity: 'error',
      });
    }
  };

  return (
    <Box sx={{ display: 'flex', backgroundColor: 'white' }}>
      <Sidebar />
      <Container maxWidth="lg" sx={{ pt: 5, pb: 8 }}>
        {/* Add New Item Button */}
        <Button 
          variant="contained" 
          sx={{ mb: 4 }}
          onClick={() => setShowAddForm(true)}
        >
          Add New Menu Item
        </Button>

        {/* Existing menu grid with updated CardMedia */}
        <Grid container spacing={3}>
          {displayItems.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.item_id}>
              <MenuItemCard item={item} />
            </Grid>
          ))}
        </Grid>

        <AddMenuItemForm />
        {/* Existing checkout dialog and other components */}
      </Container>
    </Box>
  );
};

export default Menu;
