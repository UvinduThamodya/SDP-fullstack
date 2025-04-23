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
import MenuService from '../../services/menuService';
import apiService from '../../services/api';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import IconButton from '@mui/material/IconButton';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import StripePayment from '../../components/StripePayment';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import Navbar from '../../components/Navbar'; // Import the Navbar component



const stripePromise = loadStripe('pk_test_51RBXHE2eTzT1rj33KqvHxzVBUeBpoDrtgtrs0rV8hvprNBZv4ny1YmaNH0mpB21AVCmf7sBeDmVvp1sYUn7YP7kX00GYfePn5k');



const formatCurrency = (price, currency = 'LKR', locale = 'en-LK') =>
  new Intl.NumberFormat(locale, { style: 'currency', currency }).format(price);


const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Main-Dishes');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
const [openCashDialog, setOpenCashDialog] = useState(false);
const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
const [paymentType, setPaymentType] = useState('');
const [amountGiven, setAmountGiven] = useState('');
const [balance, setBalance] = useState(0);
const [errorMessage, setErrorMessage] = useState('');


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

  const [favoriteIds, setFavoriteIds] = useState([]);

  const displayItems = selectedCategory === 'Favorites'
  ? menuItems.filter(item => favoriteIds.includes(item.item_id))
  : menuItems.filter(item => item.category === selectedCategory);

  const handlePayment = async (paymentData) => {
    try {
      // Prepare cart items for order
      const orderItems = cart.map(item => ({
        item_id: item.item_id,
        quantity: item.quantity,
        price: item.price,
      }));
  
      const orderData = {
        items: orderItems,
        payment: paymentData,
      };
  
      await apiService.createOrder(orderData);
  
      setNotification({ open: true, message: 'Order placed successfully!', severity: 'success' });
      setCart([]);
      setAmountGiven('');
      setBalance(0);
      setOpenCashDialog(false);
      setPaymentDialogOpen(false);
    } catch (error) {
      setNotification({ open: true, message: 'Payment failed. Please try again.', severity: 'error' });
    }
  };
  
 

useEffect(() => {
  // Fetch favorite IDs for the logged-in customer
  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/favorites', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setFavoriteIds(data.map(item => item.item_id));
    } catch (error) {
      // handle error
    }
  };
  fetchFavorites();
}, []);
// Toggle favorite status
const handleToggleFavorite = async (itemId) => {
  try {
    const token = localStorage.getItem('token');
    await fetch(`http://localhost:5000/api/favorites/${itemId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    setFavoriteIds(prev =>
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  } catch (error) {
    // handle error
  }
};


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
    <Box sx={{ display: 'flex', flexDirection: 'column', backgroundColor: 'white' }}>
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Navbar /> {/* Add the Navbar component */}
      </Box>
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
          <Tab label="Favorites" value="Favorites" />
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
                  <IconButton 
  color="error"
  onClick={() => handleToggleFavorite(item.item_id)}
>
  {favoriteIds.includes(item.item_id) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
</IconButton>

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
          <Button
            variant="contained"
            color="primary"
            fullWidth
            disabled={cart.length === 0}
            onClick={() => setCheckoutOpen(true)} // Opens the checkout dialog
          >
            Checkout
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={checkoutOpen} onClose={() => setCheckoutOpen(false)} maxWidth="sm" fullWidth>
  <DialogTitle>Order Summary</DialogTitle>
  <DialogContent>
    <Typography variant="h6" sx={{ mb: 2 }}>
      Total: {formatCurrency(calculateTotal(), 'LKR', 'en-LK')}
    </Typography>
    <Typography variant="h6" sx={{ textAlign: 'center', mb: 2 }}>
      Choose Payment Method
    </Typography>
    <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2 }}>
      <Button
        variant="contained"
        color="success"
        startIcon={<AttachMoneyIcon />}
        onClick={() => {
          setPaymentType('cash');
          setCheckoutOpen(false);
          setOpenCashDialog(true);
        }}
        sx={{ px: 4 }}
      >
        Cash
      </Button>
      <Button
        variant="contained"
        color="primary"
        startIcon={<CreditCardIcon />}
        onClick={() => {
          setPaymentType('card');
          setCheckoutOpen(false);
          setPaymentDialogOpen(true);
        }}
        sx={{ px: 4 }}
      >
        Card Payment
      </Button>
    </Box>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setCheckoutOpen(false)} color="error">
      Cancel
    </Button>
  </DialogActions>
</Dialog>

<Dialog open={openCashDialog} onClose={() => setOpenCashDialog(false)} maxWidth="sm" fullWidth>
  <DialogTitle>Cash Payment</DialogTitle>
  <DialogContent>
    <Typography variant="h6" sx={{ mb: 2 }}>
      Total Amount: {formatCurrency(calculateTotal(), 'LKR', 'en-LK')}
    </Typography>
    <TextField
      label="Amount Given"
      type="number"
      value={amountGiven}
      onChange={(e) => {
        setAmountGiven(e.target.value);
        setBalance(e.target.value - calculateTotal());
      }}
      fullWidth
      sx={{ mb: 2 }}
      inputProps={{ min: 0 }}
    />
    <Typography variant="h6" sx={{ mt: 2 }}>
      Balance: {balance >= 0 ? formatCurrency(balance, 'LKR', 'en-LK') : 'Insufficient Amount'}
    </Typography>
  </DialogContent>
  <DialogActions>
    <Button
      variant="contained"
      color="success"
      onClick={async () => {
        if (parseFloat(amountGiven) < calculateTotal()) {
          setErrorMessage('Insufficient cash received');
          return;
        }
        await handlePayment({
          method: 'cash',
          amount: calculateTotal(),
          cashReceived: parseFloat(amountGiven),
          change: parseFloat(amountGiven) - calculateTotal(),
        });
        setOpenCashDialog(false);
      }}
      sx={{ mb: 2 }}
      disabled={balance < 0 || amountGiven === ''}
    >
      Confirm Order
    </Button>
    <Button onClick={() => setOpenCashDialog(false)} color="error">
      Close
    </Button>
  </DialogActions>
</Dialog>


<Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)} maxWidth="sm" fullWidth>
  <DialogTitle>Card Payment</DialogTitle>
  <DialogContent>
    <Elements stripe={stripePromise}>
      <StripePayment
        amount={calculateTotal()}
        onSuccess={async (paymentIntent) => {
          await handlePayment({
            method: 'card',
            amount: calculateTotal(),
            stripeToken: paymentIntent.id,
          });
          setPaymentDialogOpen(false);
        }}
        onError={() => setErrorMessage('Card payment failed.')}
      />
    </Elements>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setPaymentDialogOpen(false)} color="error">
      Cancel
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
