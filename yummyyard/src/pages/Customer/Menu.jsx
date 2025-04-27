import React, { useState, useEffect } from 'react';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
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

// Create a custom theme with Poppins font
const theme = createTheme({
  typography: {
    fontFamily: '"Poppins", sans-serif',
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
});

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState(() => {
    // Initialize cart from local storage
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  // Save cart to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

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

    setNotification({ open: true, message: `${item.name} added to cart`, severity: 'success' });
  };

  const [selectedCategory, setSelectedCategory] = useState('Main-Dishes');
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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', backgroundColor: 'white' }}>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Navbar /> {/* Add the Navbar component */}
        </Box>
        <Container maxWidth="lg" sx={{ pt: 5, pb: 8 }}>
          <Tabs
            value={selectedCategory}
            onChange={handleCategoryChange}
            centered
            sx={{
              mb: 4,
              '& .MuiTabs-flexContainer': {
                justifyContent: 'center',
              },
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '1rem',
                mx: 1,
                px: 3,
                borderRadius: '24px',
                transition: 'all 0.3s',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
              },
              '& .Mui-selected': {
                color: 'primary.main',
                fontWeight: 600,
              },
              '& .MuiTabs-indicator': {
                display: 'none',
              },
            }}
          >
            <Tab 
              label="Main Dishes" 
              value="Main-Dishes" 
              sx={{ 
                backgroundColor: selectedCategory === 'Main-Dishes' ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
              }} 
            />
            <Tab 
              label="Sea Food" 
              value="Sea-Food" 
              sx={{ 
                backgroundColor: selectedCategory === 'Sea-Food' ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
              }} 
            />
            <Tab 
              label="Desserts" 
              value="Desserts" 
              sx={{ 
                backgroundColor: selectedCategory === 'Desserts' ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
              }} 
            />
            <Tab 
              label="Beverage" 
              value="Beverage" 
              sx={{ 
                backgroundColor: selectedCategory === 'Beverage' ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
              }} 
            />
            <Tab 
              label="Favorites" 
              value="Favorites" 
              sx={{ 
                backgroundColor: selectedCategory === 'Favorites' ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
              }} 
            />
          </Tabs>

          <Grid container spacing={3}>
            {displayItems.map(item => (
              <Grid item xs={12} sm={6} md={4} key={item.item_id}>
                <Card 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    height: '100%',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
                    }
                  }}
                >
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="220"
                      image={item.image_url}
                      alt={item.name}
                      sx={{ objectFit: 'cover' }}
                    />
                    <IconButton
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        backgroundColor: 'rgba(255,255,255,0.8)',
                        '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' },
                      }}
                      color="error"
                      onClick={() => handleToggleFavorite(item.item_id)}
                    >
                      {favoriteIds.includes(item.item_id) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                    </IconButton>
                  </Box>
                  <CardContent sx={{ flexGrow: 1, pt: 2, px: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>{item.name}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{item.description}</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        {formatCurrency(item.price)}
                      </Typography>
                      <Button
                        variant="contained"
                        disableElevation
                        startIcon={<ShoppingCartIcon />}
                        onClick={() => handleAddToCart(item.item_id)}
                        sx={{ 
                          borderRadius: '24px',
                          px: 2,
                          backgroundColor: '#ff9800',
                          '&:hover': { backgroundColor: '#f57c00' },
                        }}
                      >
                        Add
                      </Button>
                    </Box>
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
            bottom: 24,
            right: 24,
            zIndex: 1300,
            backgroundColor: '#ff9800',
            '&:hover': {
              backgroundColor: '#f57c00',
              transform: 'scale(1.05)',
            },
            boxShadow: '0 6px 12px rgba(0,0,0,0.2)',
            transition: 'all 0.3s',
            width: 64,
            height: 64,
          }}
          onClick={() => setCartOpen(true)}
        >
          <Box sx={{ position: 'relative' }}>
            <ShoppingCartIcon sx={{ fontSize: 28 }} />
            {cart.length > 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  backgroundColor: 'error.main',
                  color: 'white',
                  borderRadius: '50%',
                  width: 20,
                  height: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                }}
              >
                {cart.length}
              </Box>
            )}
          </Box>
        </Fab>

        {/* Cart Sidebar Dialog */}
        <Dialog
          open={cartOpen}
          onClose={() => setCartOpen(false)}
          PaperProps={{
            sx: {
              width: 420,
              maxWidth: '90vw',
              position: 'fixed',
              right: 0,
              top: 0,
              height: '100%',
              m: 0,
              borderRadius: '24px 0 0 24px',
              boxShadow: '-5px 0 20px rgba(0,0,0,0.1)',
            }
          }}
          TransitionProps={{
            style: {
              transition: 'all 0.3s ease-out',
            },
          }}
          hideBackdrop={false}
        >
          <Box sx={{ 
            p: 3, 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100%',
            backgroundColor: '#f8f9fa',
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Your Cart {cart.length > 0 && `(${cart.length})`}
              </Typography>
              <IconButton onClick={() => setCartOpen(false)}>
                <Box sx={{ fontSize: '1.5rem', fontWeight: 300 }}>×</Box>
              </IconButton>
            </Box>
            
            <Box sx={{ 
              flexGrow: 1, 
              overflowY: 'auto',
              pr: 2,
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(0,0,0,0.2)',
                borderRadius: '6px',
              }
            }}>
              {cart.length === 0 ? (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  height: '100%',
                  opacity: 0.7,
                }}>
                  <ShoppingCartIcon sx={{ fontSize: 60, mb: 2, color: 'text.secondary' }} />
                  <Typography variant="h6" color="text.secondary">Your cart is empty</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                    Add delicious items from the menu to get started
                  </Typography>
                </Box>
              ) : (
                <>
                  {cart.map(item => (
                    <Card key={item.item_id} sx={{ 
                      mb: 2, 
                      backgroundColor: 'white',
                      borderRadius: 3,
                      boxShadow: 'none',
                      overflow: 'hidden',
                      transition: 'all 0.2s',
                      '&:hover': {
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                      }
                    }}>
                      <Box sx={{ display: 'flex', p: 2 }}>
                        <Box sx={{ 
                          width: 80, 
                          height: 80, 
                          borderRadius: 2, 
                          overflow: 'hidden',
                          mr: 2,
                          flexShrink: 0
                        }}>
                          <img
                            src={item.image_url}
                            alt={item.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </Box>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>{item.name}</Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {formatCurrency(item.price)}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              border: '1px solid #e0e0e0',
                              borderRadius: 1,
                              overflow: 'hidden'
                            }}>
                              <IconButton 
                                size="small"
                                onClick={() => handleQuantityChange(item.item_id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                sx={{ p: 0.5 }}
                              >
                                <Box component="span" sx={{ fontSize: '1.2rem', fontWeight: 300, lineHeight: 1 }}>−</Box>
                              </IconButton>
                              <Typography sx={{ px: 1, minWidth: 24, textAlign: 'center' }}>
                                {item.quantity}
                              </Typography>
                              <IconButton 
                                size="small"
                                onClick={() => handleQuantityChange(item.item_id, item.quantity + 1)}
                                sx={{ p: 0.5 }}
                              >
                                <Box component="span" sx={{ fontSize: '1.2rem', fontWeight: 300, lineHeight: 1 }}>+</Box>
                              </IconButton>
                            </Box>
                            <IconButton 
                              size="small" 
                              color="error" 
                              onClick={() => handleRemoveFromCart(item.item_id)}
                              sx={{ p: 0.5 }}
                            >
                              <Box component="span" sx={{ fontSize: '1.2rem', fontWeight: 300, lineHeight: 1 }}>×</Box>
                            </IconButton>
                          </Box>
                        </Box>
                      </Box>
                    </Card>
                  ))}
                </>
              )}
            </Box>
            
            {cart.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="subtitle1">Subtotal</Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {formatCurrency(calculateTotal())}
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  disableElevation
                  startIcon={<PaymentIcon />}
                  onClick={() => setCheckoutOpen(true)}
                  sx={{ 
                    py: 1.5, 
                    borderRadius: 2,
                    backgroundColor: '#ff9800',
                    '&:hover': { backgroundColor: '#f57c00' },
                    transition: 'all 0.3s',
                  }}
                >
                  Proceed to Checkout
                </Button>
              </Box>
            )}
          </Box>
        </Dialog>
        <Dialog 
          open={checkoutOpen} 
          onClose={() => setCheckoutOpen(false)} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3 }
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>Checkout</Typography>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ py: 2 }}>
              <Typography variant="h6" sx={{ mb: 3, textAlign: 'center' }}>
                Order Summary
              </Typography>
              
              {cart.map(item => (
                <Box key={item.item_id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body1">
                    {item.name} × {item.quantity}
                  </Typography>
                  <Typography variant="body1">
                    {formatCurrency(item.price * item.quantity)}
                  </Typography>
                </Box>
              ))}
              
              <Divider sx={{ my: 3 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {formatCurrency(calculateTotal(), 'LKR', 'en-LK')}
                </Typography>
              </Box>
              
              <Typography variant="h6" sx={{ textAlign: 'center', mb: 3 }}>
                Choose Payment Method
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<CreditCardIcon />}
                  onClick={() => {
                    setPaymentType('card');
                    setCheckoutOpen(false);
                    setPaymentDialogOpen(true);
                  }}
                  sx={{ 
                    px: 4, 
                    py: 1.5, 
                    borderRadius: 2,
                    transition: 'all 0.3s',
                    '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }
                  }}
                >
                  Card Payment
                </Button>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button 
              onClick={() => setCheckoutOpen(false)} 
              color="inherit"
              sx={{ textTransform: 'none' }}
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog 
          open={openCashDialog} 
          onClose={() => setOpenCashDialog(false)} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3 }
          }}
        >
          <DialogTitle>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>Cash Payment</Typography>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ py: 2 }}>
              <Box sx={{ 
                mb: 3, 
                p: 3, 
                backgroundColor: 'primary.light', 
                color: 'primary.contrastText',
                borderRadius: 2,
                textAlign: 'center'
              }}>
                <Typography variant="h6" sx={{ fontWeight: 400 }}>
                  Total Amount
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600, mt: 1 }}>
                  {formatCurrency(calculateTotal(), 'LKR', 'en-LK')}
                </Typography>
              </Box>
              
              <TextField
                label="Amount Given"
                type="number"
                value={amountGiven}
                onChange={(e) => {
                  setAmountGiven(e.target.value);
                  setBalance(e.target.value - calculateTotal());
                }}
                fullWidth
                variant="outlined"
                sx={{ mb: 3 }}
                inputProps={{ min: 0 }}
              />
              
              {amountGiven && (
                <Box sx={{ 
                  p: 2, 
                  backgroundColor: balance >= 0 ? 'success.light' : 'error.light',
                  color: balance >= 0 ? 'success.contrastText' : 'error.contrastText',
                  borderRadius: 2,
                  textAlign: 'center',
                  transition: 'all 0.3s'
                }}>
                  <Typography variant="h6">
                    {balance >= 0 ? 'Change' : 'Insufficient Amount'}
                  </Typography>
                  {balance >= 0 && (
                    <Typography variant="h5" sx={{ fontWeight: 600, mt: 1 }}>
                      {formatCurrency(balance, 'LKR', 'en-LK')}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button 
              onClick={() => setOpenCashDialog(false)} 
              color="inherit"
              sx={{ textTransform: 'none' }}
            >
              Cancel
            </Button>
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
              disabled={balance < 0 || amountGiven === ''}
              sx={{ 
                px: 4,
                borderRadius: 2
              }}
            >
              Confirm Payment
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
          autoHideDuration={3000}
          onClose={handleNotificationClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          TransitionProps={{
            style: {
              transform: 'translateY(20px)',
              transition: 'transform 0.5s ease-out, opacity 0.5s ease-out',
            },
          }}
        >
          <Alert 
            onClose={handleNotificationClose} 
            severity={notification.severity} 
            variant="filled"
            sx={{ 
              width: '100%',
              borderRadius: 8,
              boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
              backgroundColor: notification.severity === 'success' ? '#2e7d32' : '#d32f2f',
              color: '#ffffff',
            }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

export default Menu;
