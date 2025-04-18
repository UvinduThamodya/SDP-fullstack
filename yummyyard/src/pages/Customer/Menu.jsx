import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Container, Grid, Card, CardMedia, CardContent, Button,
  Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Snackbar, Alert, TextField, Fab, Divider
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PaymentIcon from '@mui/icons-material/Payment';
import Sidebar from '../../components/Sidebar';
import MenuService from '../../services/menuService';
import apiService from '../../services/api';

const formatCurrency = (price, currency = 'LKR', locale = 'en-LK') =>
  new Intl.NumberFormat(locale, { style: 'currency', currency }).format(price);

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Main-Dishes');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const items = await MenuService.getMenuItems();
        setMenuItems(items);
      } catch (error) {
        setNotification({ open: true, message: 'Failed to fetch menu items', severity: 'error' });
      }
    };
    fetchMenuItems();
  }, []);

  const displayItems = menuItems.filter(item => item.category === selectedCategory);

  const handleAddToCart = (itemId) => {
    const item = menuItems.find(i => i.item_id === itemId);
    if (!item) return;

    setCart(prevCart => {
      const existing = prevCart.find(ci => ci.item_id === itemId);
      if (existing) {
        return prevCart.map(ci => ci.item_id === itemId ? { ...ci, quantity: ci.quantity + 1 } : ci);
      } else {
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
    setCartOpen(true);
    setNotification({ open: true, message: `${item.name} added to cart`, severity: 'success' });
  };

  const handleRemoveFromCart = (itemId) => {
    setCart(prevCart => prevCart.filter(ci => ci.item_id !== itemId));
  };

  const handleQuantityChange = (itemId, quantity) => {
    if (quantity < 1) return;
    setCart(prevCart => prevCart.map(ci => ci.item_id === itemId ? { ...ci, quantity } : ci));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleCategoryChange = (event, newCategory) => {
    setSelectedCategory(newCategory);
  };

  const handleNotificationClose = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ display: 'flex', backgroundColor: 'white' }}>
      <Sidebar />
      <Container maxWidth="lg" sx={{ pt: 5, pb: 8 }}>
        <Tabs
          value={selectedCategory}
          onChange={handleCategoryChange}
          centered
          sx={{ mb: 3 }}
        >
          <Tab label="Main Dishes" value="Main-Dishes" />
          <Tab label="Sea Food" value="Sea-Food" />
          <Tab label="Desserts" value="Desserts" />
          <Tab label="Beverage" value="Beverage" />
        </Tabs>

        <Grid container spacing={3}>
          {displayItems.map(item => (
            <Grid item xs={12} sm={6} md={4} key={item.item_id}>
              <Card sx={{ display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={item.image_url}
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
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Floating Cart Button */}
      <Fab
        color="primary"
        aria-label="cart"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1300,
        }}
        onClick={() => setCartOpen(true)}
      >
        <ShoppingCartIcon />
      </Fab>

      {/* Cart Sidebar Dialog */}
      <Dialog
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        PaperProps={{
          sx: {
            width: 400,
            maxWidth: '90vw',
            position: 'fixed',
            right: 0,
            top: 0,
            height: '100%',
            m: 0,
            borderRadius: 5
          }
        }}
        hideBackdrop
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Cart ({cart.length})</Typography>
          <Button onClick={() => setCartOpen(false)}>Close</Button>
        </DialogTitle>
        <DialogContent dividers>
          {cart.length === 0 ? (
            <Typography>Your cart is empty.</Typography>
          ) : (
            <>
              {cart.map(item => (
                <Box key={item.item_id} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <img
                    src={item.image_url}
                    alt={item.name}
                    style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, marginRight: 12 }}
                  />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography>{item.name}</Typography>
                    <Typography variant="body2">Qty: 
                      <TextField
                        type="number"
                        size="small"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.item_id, parseInt(e.target.value) || 1)}
                        inputProps={{ min: 1, style: { width: 50 } }}
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                    <Typography variant="body2">{formatCurrency(item.price * item.quantity)}</Typography>
                  </Box>
                  <Button size="small" color="error" onClick={() => handleRemoveFromCart(item.item_id)}>
                    Remove
                  </Button>
                </Box>
              ))}
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ textAlign: 'right' }}>
                Subtotal: {formatCurrency(calculateTotal())}
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="primary" fullWidth disabled={cart.length === 0}>
            Checkout
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleNotificationClose} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Menu;
