import React, { useState, useEffect } from 'react';
import { CircularProgress } from '@mui/material';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Container, Grid, Card, CardMedia, CardContent, Button,
  Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Snackbar, Alert, TextField, Fab, Divider, Chip
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
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Navbar from '../../components/Navbar'; 
import { alpha } from '@mui/material/styles'; 
import RecommendationService from '../../services/recommendationService';
import LocalBarIcon from '@mui/icons-material/LocalBar';
import Slide from '@mui/material/Slide';
import io from 'socket.io-client';

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

const SlideTransition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="left" ref={ref} {...props} />;
});

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState(() => {
    // Initialize cart from local storage
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [availability, setAvailability] = useState('Accepting');
  const [busyDialogOpen, setBusyDialogOpen] = useState(false);

  // Save cart to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    // Fetch initial availability
    fetch('http://localhost:5000/api/availability')
      .then(res => res.json())
      .then(data => setAvailability(data.availability));
    // Listen for changes
    const socket = io('http://localhost:5000');
    socket.on('availabilityChanged', data => setAvailability(data.availability));
    return () => socket.disconnect();
  }, []);

  const handleAddToCart = (itemId) => {
    if (availability === 'Busy') {
      setBusyDialogOpen(true);
      return;
    }
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
  const [recommendationDialogOpen, setRecommendationDialogOpen] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [orderNote, setOrderNote] = useState('');

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

  useEffect(() => {
    const fetchLowStockItems = async () => {
      try {
        const lowStockItems = await MenuService.getLowStockMenuItems();
        console.log('Low stock items:', lowStockItems); // Debugging log
        setMenuItems(prevItems =>
          prevItems.map(item => ({
            ...item,
            lowStock: lowStockItems.some(lowStockItem => lowStockItem.menu_item_id === item.item_id),
          }))
        );
        console.log('Updated menu items:', menuItems); // Debugging log
      } catch (error) {
        console.error('Failed to fetch low stock items:', error);
      }
    };

    fetchLowStockItems();
  }, []);

  // Empty category content with quotes and icons
  const emptyCategoryContent = {
    'Main-Dishes': {
      quote: "Good food is good mood",
      icon: "🍽️"
    },
    'Sea-Food': {
      quote: "Fresh from the ocean to your plate",
      icon: "🐟" 
    },
    'Desserts': {
      quote: "Life is short, eat dessert first",
      icon: "🍰"
    },
    'Beverage': {
      quote: "Sip, savor, smile",
      icon: "🥤"
    },
    'Favorites': {
      quote: "Your favorite dishes will appear here",
      icon: "❤️"
    },
  };

  const [favoriteIds, setFavoriteIds] = useState([]);

  const displayItems = selectedCategory === 'Favorites'
    ? menuItems.filter(item => favoriteIds.includes(item.item_id))
    : menuItems.filter(item => item.category === selectedCategory);

  const handlePayment = async (paymentData) => {
    try {
      const orderItems = cart.map(item => ({
        item_id: item.item_id,
        quantity: item.quantity,
        price: item.price,
      }));

      const orderData = {
        items: orderItems,
        payment: paymentData,
        note: orderNote // Include the note
      };

      await apiService.createOrder(orderData);
      setNotification({ open: true, message: 'Order placed successfully!', severity: 'success' });
      setCart([]);
      setOpenCashDialog(false);
      setPaymentDialogOpen(false);
    } catch (error) {
      setNotification({ open: true, message: 'Order placement failed. Please try again.', severity: 'error' });
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

  const fetchRecommendations = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user')) || {};
      const recs = await RecommendationService.getRecommendations(cart, user.id);
      setRecommendations(recs);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  function CardPaymentForm({ calculateTotal, setPaymentDialogOpen, setNotification,orderNote}) {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);

    return (
      <Box sx={{ py: 2 }}>
        <Typography variant="h6" sx={{ mb: 4, fontWeight: 500, textAlign: 'center' }}>
          Enter your card details
        </Typography>
        <Box sx={{
          p: 2.5,
          borderRadius: 2,
          border: '1px solid #e0e0e0',
          backgroundColor: 'white',
          mb: 3,
          transition: 'all 0.3s',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            borderColor: '#3ACA82',
          },
        }}>
          <CardElement options={{
            style: {
              base: {
                color: '#32325d',
                fontFamily: '"Poppins", sans-serif',
                fontSmoothing: 'antialiased',
                fontSize: '16px',
                '::placeholder': { color: '#aab7c4' },
              },
              invalid: { color: '#fa755a', iconColor: '#fa755a' },
            },
            hidePostalCode: true,
          }} />
        </Box>
        <Box sx={{
          py: 2,
          backgroundColor: alpha('#3ACA82', 0.1),
          borderRadius: 2,
          textAlign: 'center',
          mb: 3,
        }}>
          <Typography variant="body2" color="text.secondary">Total Amount</Typography>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#3ACA82' }}>
            {formatCurrency(calculateTotal())}
          </Typography>
        </Box>
        <Button
          onClick={async () => {
            try {
              setIsProcessing(true);
              if (!stripe || !elements) {
                setNotification({ open: true, message: 'Payment system unavailable', severity: 'error' });
                setIsProcessing(false);
                return;
              }
              const cardElement = elements.getElement(CardElement);
              if (!cardElement) {
                setNotification({ open: true, message: 'Please enter card details', severity: 'error' });
                setIsProcessing(false);
                return;
              }
              // Create payment intent on your server
              const response = await fetch('http://localhost:5000/api/payment/create-intent', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ amount: Math.round(calculateTotal() * 100) }) // amount in cents
              });
              if (!response.ok) {
                setNotification({ open: true, message: 'Payment failed. Please try again.', severity: 'error' });
                setIsProcessing(false);
                return;
              }
              const { clientSecret } = await response.json();
              // Confirm payment with Stripe
              const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: { card: cardElement }
              });
              if (result.error) {
                setNotification({ open: true, message: result.error.message, severity: 'error' });
              } else if (result.paymentIntent.status === 'succeeded') {
                // Only now create the order in the backend!
                const orderItems = cart.map(item => ({
                  item_id: item.item_id,
                  quantity: item.quantity,
                  price: item.price,
                }));
                const orderData = {
                  items: orderItems,
                  payment: {
                    method: 'Card',
                    amount: calculateTotal(),
                    stripeToken: result.paymentIntent.id,
                  },
                  note: orderNote
                };
                try {
                  await apiService.createOrder(orderData);
                  setNotification({ open: true, message: 'Order placed successfully!', severity: 'success' });
                  setCart([]);
                  setPaymentDialogOpen(false);
                } catch (error) {
                  setNotification({ open: true, message: 'Failed to create order.', severity: 'error' });
                }
              }
            } catch (error) {
              setNotification({ open: true, message: 'Payment failed. Please try again.', severity: 'error' });
            } finally {
              setIsProcessing(false);
            }
          }}
          disabled={isProcessing}
          sx={{
            py: 1.5,
            px: 4,
            display: 'block',
            ml: 'auto', // This pushes the button to the right
            borderRadius: 6,
            backgroundColor: '#3ACA82',
            color: 'white',
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(58, 202, 130, 0.25)',
            '&:hover': {
              backgroundColor: '#2db873',
              boxShadow: '0 6px 16px rgba(58, 202, 130, 0.35)',
            },
            '&:disabled': {
              backgroundColor: '#e0e0e0',
              color: '#9e9e9e',
            }
          }}
        >
          {isProcessing ? 'Processing...' : 'Pay Now'}
        </Button>
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Your payment information is secure. We don't store your card details.
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', backgroundColor: 'white' }}>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Navbar /> {/* Add the Navbar component */}
        </Box>
        {/* Availability Banner */}
        <Box sx={{ mb: 2 }}>
          {availability === 'Busy' && (
            <Box sx={{ p: 2, bgcolor: '#fff3e0', borderRadius: 2, textAlign: 'center' }}>
              <Typography variant="h5" color="error" sx={{ fontWeight: 700 }}>
                Staff is Busy - Orders are temporarily unavailable
              </Typography>
            </Box>
          )}
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
                backgroundColor: selectedCategory === 'Main-Dishes' ? 'rgba(58, 202, 130, 0.1)' : 'transparent',
              }} 
            />
            <Tab 
              label="Sea Food" 
              value="Sea-Food" 
              sx={{ 
                backgroundColor: selectedCategory === 'Sea-Food' ? 'rgba(58, 202, 130, 0.1)' : 'transparent',
              }} 
            />
            <Tab 
              label="Desserts" 
              value="Desserts" 
              sx={{ 
                backgroundColor: selectedCategory === 'Desserts' ? 'rgba(58, 202, 130, 0.1)' : 'transparent',
              }} 
            />
            <Tab 
              label="Beverage" 
              value="Beverage" 
              sx={{ 
                backgroundColor: selectedCategory === 'Beverage' ? 'rgba(58, 202, 130, 0.1)' : 'transparent',
              }} 
            />
            <Tab 
              label="Favorites" 
              value="Favorites" 
              sx={{ 
                backgroundColor: selectedCategory === 'Favorites' ? 'rgba(58, 202, 130, 0.1)' : 'transparent',
              }} 
            />
          </Tabs>

          <Grid container spacing={3}>
            {displayItems.length > 0 ? (
              displayItems.map(item => (
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
                        image={item.image_url}
                        alt={item.name}
                        sx={{
                          width: '100%',
                          height: 200,
                          objectFit: 'cover',
                        }}
                      />
                      {item.lowStock && ( // Check if the item is low stock
                        <Chip
                          label="Unavaiable"
                          color="error"
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                            backgroundColor: '#ff9800',
                            color: '#fff',
                            fontWeight: 'bold',
                          }}
                        />
                      )}
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
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#3ACA82' }}>
                          {formatCurrency(item.price)}
                        </Typography>
                        <Button
                          variant="contained"
                          disableElevation
                          startIcon={<ShoppingCartIcon />}
                          onClick={() => handleAddToCart(item.item_id)}
                          disabled={item.lowStock || availability === 'Busy'} // Always disable if lowStock
                          sx={{ 
                            borderRadius: '24px',
                            px: 2,
                            backgroundColor: item.lowStock || availability === 'Busy' ? '#e0e0e0' : '#3ACA82',
                            color: item.lowStock || availability === 'Busy' ? '#9e9e9e' : '#fff',
                            '&:hover': {
                              backgroundColor: item.lowStock || availability === 'Busy' ? '#e0e0e0' : alpha('#3ACA82', 0.8),
                            },
                          }}
                        >
                          {item.lowStock || availability === 'Busy' ? 'Unavailable' : 'Add'}
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Box sx={{ 
                  py: 8,
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  bgcolor: 'rgba(58, 202, 130, 0.05)',
                  borderRadius: 4,
                  minHeight: 300,
                }}>
                  <Typography variant="h1" sx={{ fontSize: '5rem', mb: 2 }}>
                    {emptyCategoryContent[selectedCategory]?.icon}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                    No items available in this category
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    fontStyle: 'italic',
                    color: 'text.secondary',
                    maxWidth: '80%',
                    mb: 3
                  }}>
                    "{emptyCategoryContent[selectedCategory]?.quote}"
                  </Typography>
                  <Button 
                    variant="outlined"
                    onClick={() => setSelectedCategory('Main-Dishes')}
                    sx={{
                      borderColor: '#3ACA82',
                      color: '#3ACA82',
                      borderRadius: 2,
                      '&:hover': {
                        backgroundColor: 'rgba(58, 202, 130, 0.05)',
                        borderColor: '#3ACA82',
                      }
                    }}
                  >
                    Browse Main Dishes
                  </Button>
                </Box>
              </Grid>
            )}
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
            backgroundColor: '#3ACA82',
            '&:hover': {
              backgroundColor: alpha('#3ACA82', 0.8),
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
          TransitionComponent={SlideTransition}
          PaperProps={{
            sx: {
              width: '380px', // Set a fixed width for the cart
              maxWidth: '100%',
              height: '100vh', // Full height
              position: 'fixed',
              right: 0,
              top: 0,
              margin: 0,
              borderRadius: 0, // Remove border radius
              boxShadow: '-5px 0 20px rgba(0,0,0,0.1)',
              overflowY: 'auto',
            }
          }}
          sx={{
            '& .MuiDialog-container': {
              justifyContent: 'flex-end', // Align to right side
            },
          }}
          hideBackdrop={false}
          transitionDuration={300}
        >
          <Box sx={{ 
            p: 0, 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100%',
            backgroundColor: '#f8f9fa',
          }}>
            {/* Cart Header - Fixed */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              p: 3,
              borderBottom: '1px solid #eaeaea',
              backgroundColor: 'white',
              position: 'sticky',
              top: 0,
              zIndex: 1,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ShoppingCartIcon sx={{ color: '#3ACA82', mr: 1.5 }} />
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Your Cart {cart.length > 0 && `(${cart.length})`}
                </Typography>
              </Box>
              <IconButton 
                onClick={() => setCartOpen(false)}
                sx={{ 
                  backgroundColor: 'rgba(0,0,0,0.05)',
                  '&:hover': { backgroundColor: 'rgba(0,0,0,0.1)' },
                  transition: 'all 0.2s'
                }}
              >
                <Box sx={{ fontSize: '1.5rem', fontWeight: 300 }}>×</Box>
              </IconButton>
            </Box>
            
            {/* Cart Items - Scrollable */}
            <Box sx={{ 
              flexGrow: 1, 
              overflowY: 'auto',
              px: 3,
              py: 2,
            }}>
              {cart.length === 0 ? (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  height: '100%',
                  opacity: 0.7,
                  py: 5
                }}>
                  <ShoppingCartIcon sx={{ fontSize: 80, mb: 3, color: '#d0d0d0' }} />
                  <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>Your cart is empty</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center', maxWidth: '80%' }}>
                    Explore our menu and add your favorite items
                  </Typography>
                  <Button 
                    variant="outlined" 
                    onClick={() => setCartOpen(false)} 
                    sx={{ 
                      mt: 3, 
                      borderRadius: 6, 
                      px: 3, 
                      borderColor: '#3ACA82', 
                      color: '#3ACA82',
                      '&:hover': { borderColor: '#3ACA82', backgroundColor: 'rgba(58, 202, 130, 0.05)' }
                    }}
                  >
                    Browse Menu
                  </Button>
                </Box>
              ) : (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, fontWeight: 500 }}>
                    ITEMS ({cart.length})
                  </Typography>
                  {cart.map((item, index) => (
                    <React.Fragment key={item.item_id}>
                      <Card sx={{ 
                        mb: 2, 
                        backgroundColor: 'white',
                        borderRadius: 3,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        overflow: 'hidden',
                        transition: 'all 0.2s',
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                          transform: 'translateY(-2px)',
                        }
                      }}>
                        <Box sx={{ display: 'flex', p: 0 }}>
                          <Box sx={{ 
                            width: 80, 
                            height: 80, 
                            borderRadius: '8px 0 0 8px', 
                            overflow: 'hidden',
                            flexShrink: 0
                          }}>
                            <img
                              src={item.image_url}
                              alt={item.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </Box>
                          <Box sx={{ 
                            flexGrow: 1, 
                            display: 'flex', 
                            flexDirection: 'column', 
                            justifyContent: 'center',
                            p: 2
                          }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                                {item.name}
                              </Typography>
                              <IconButton 
                                size="small" 
                                color="error"  
                                onClick={() => handleRemoveFromCart(item.item_id)}
                                sx={{ 
                                  p: 0.5, 
                                  ml: 1, 
                                  mt: -0.5, 
                                  color: 'text.secondary',
                                  '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.1)', color: '#d32f2f' }
                                }}
                              >
                                <Box component="span" sx={{ fontSize: '1rem', fontWeight: 400, lineHeight: 1 }}>×</Box>
                              </IconButton>
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                              {formatCurrency(item.price)}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                              <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                backgroundColor: 'rgba(0,0,0,0.03)',
                                borderRadius: 6,
                                overflow: 'hidden'
                              }}>
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleQuantityChange(item.item_id, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                  sx={{ 
                                    p: 0.5,
                                    color: item.quantity <= 1 ? 'rgba(0,0,0,0.2)' : 'text.secondary',
                                    '&:hover': { backgroundColor: 'transparent' }
                                  }}
                                >
                                  <Box component="span" sx={{ fontSize: '1.2rem', fontWeight: 400, lineHeight: 1 }}>−</Box>
                                </IconButton>
                                <Typography sx={{ 
                                  px: 1.5, 
                                  minWidth: 28, 
                                  textAlign: 'center',
                                  fontWeight: 500
                                }}>
                                  {item.quantity}
                                </Typography>
                                <IconButton 
                                  size="small"
                                  onClick={() => handleQuantityChange(item.item_id, item.quantity + 1)}
                                  sx={{ 
                                    p: 0.5,
                                    color: 'text.secondary',
                                    '&:hover': { backgroundColor: 'transparent' }
                                  }}
                                >
                                  <Box component="span" sx={{ fontSize: '1.2rem', fontWeight: 400, lineHeight: 1 }}>+</Box>
                                </IconButton>
                              </Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#3ACA82' }}>
                                {formatCurrency(item.price * item.quantity)}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Card>
                      {index === cart.length - 1 && (
                        <Box sx={{ height: 60 }} /> // Extra space at the end for better scrolling
                      )}
                    </React.Fragment>
                  ))}
                </Box>
              )}
            </Box>

            {/* Cart Notification Widget */}
            <Box 
              sx={{ 
                mt: 3, 
                mb: 4,
                p: 2.5, 
                borderRadius: 2, 
                border: '1px solid rgba(58, 202, 130, 0.3)',
                backgroundColor: 'rgba(58, 202, 130, 0.05)',
                display: 'flex',
                alignItems: 'center',
                boxShadow: '0 2px 8px rgba(58, 202, 130, 0.1)',
              }}
            >
              <Box sx={{ mr: 2, color: '#3ACA82' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="currentColor"/>
                </svg>
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#3ACA82', mb: 0.5 }}>
                  No Hidden Charges & Priority Processing
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Unlike other ordering services, we don't have any hidden fees. Orders placed through this website receive priority processing.
                </Typography>
              </Box>
            </Box>
            
            {/* Cart Footer - Fixed */}
            {cart.length > 0 && (
              <Box sx={{ 
                borderTop: '1px solid #eaeaea',
                p: 3,
                backgroundColor: 'white',
                position: 'sticky',
                bottom: 0,
                zIndex: 1,
              }}>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {formatCurrency(calculateTotal())}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>Total</Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#3ACA82' }}>
                      {formatCurrency(calculateTotal())}
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  disableElevation
                  startIcon={<PaymentIcon />}
                  onClick={() => {
                    fetchRecommendations();
                    setRecommendationDialogOpen(true);
                  }}
                  sx={{ 
                    py: 1.5, 
                    borderRadius: 6,
                    backgroundColor: '#3ACA82',
                    '&:hover': { backgroundColor: alpha('#3ACA82', 0.8) },
                    transition: 'all 0.3s',
                    boxShadow: '0 4px 12px rgba(58, 202, 130, 0.25)',
                    '&:hover': {
                      backgroundColor: '#2db873',
                      boxShadow: '0 6px 16px rgba(58, 202, 130, 0.35)',
                    }
                  }}
                >
                  Checkout
                </Button>
                <Button
                  color="inherit"
                  size="small"
                  fullWidth
                  sx={{ 
                    mt: 1.5, 
                    textTransform: 'none',
                    color: 'text.secondary',
                    '&:hover': { backgroundColor: 'transparent', color: 'text.primary' }
                  }}
                  onClick={() => setCartOpen(false)}
                >
                  Continue Shopping
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
                  backgroundColor: balance >= 0 ? 'rgba(58, 202, 130, 0.1)' : 'rgba(211, 47, 47, 0.1)',
                  color: balance >= 0 ? '#3ACA82' : '#d32f2f',
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
          <DialogTitle>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>Card Payment</Typography>
          </DialogTitle>
          <DialogContent>
            <Elements stripe={stripePromise}>
              <CardPaymentForm
                calculateTotal={calculateTotal}
                handlePayment={handlePayment}
                setPaymentDialogOpen={setPaymentDialogOpen}
                setNotification={setNotification}
                 orderNote={orderNote}
              />
            </Elements>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button onClick={() => setPaymentDialogOpen(false)} color="inherit" sx={{ textTransform: 'none' }}>
              Cancel
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog 
          open={recommendationDialogOpen} 
          onClose={() => setRecommendationDialogOpen(false)} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3 }
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>Review Your Order</Typography>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ py: 2 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
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
                  {formatCurrency(calculateTotal())}
                </Typography>
              </Box>
              
              <Typography variant="h6" sx={{ mb: 2 }}>
                <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocalBarIcon sx={{ mr: 1, color: '#3ACA82' }} />
                  Recommended for you
                </Box>
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {recommendations.map(item => (
                  <Grid item xs={12} sm={4} key={item.item_id}>
                    <Card sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      height: '100%',
                      borderRadius: 2,
                      overflow: 'hidden',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      transition: 'transform 0.3s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      }
                    }}>
                      <CardMedia
                        component="img"
                        image={item.image_url}
                        alt={item.name}
                        sx={{ height: 120, objectFit: 'cover', objectPosition: 'center' }}
                      />
                      <CardContent sx={{ flexGrow: 1, p: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{item.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatCurrency(item.price)}
                        </Typography>
                        {item.category === 'Beverage' && (
                          <Box sx={{ 
                            display: 'inline-block',
                            mt: 1,
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            backgroundColor: 'rgba(58, 202, 130, 0.1)',
                            color: '#3ACA82',
                            fontSize: '0.75rem',
                          }}>
                            Beverage
                          </Box>
                        )}
                      </CardContent>
                      <Button 
                        size="small" 
                        onClick={() => {
                          handleAddToCart(item.item_id);
                          setNotification({ open: true, message: `${item.name} added to cart`, severity: 'success' });
                        }}
                        disabled={item.lowStock} // Disable button if item is low stock
                        sx={{ 
                          m: 1,
                          borderRadius: '24px',
                          px: 2,
                          backgroundColor: item.lowStock ? '#e0e0e0' : '#3ACA82', // Greyed out if low stock
                          color: item.lowStock ? '#9e9e9e' : '#fff', // Adjust text color
                          '&:hover': {
                            backgroundColor: item.lowStock 
                              ? '#e0e0e0'
                              : alpha('#3ACA82', 0.8),
                            boxShadow: item.lowStock
                              ? undefined
                              : '0 2px 8px rgba(58, 202, 130, 0.1)',
                          },
                        }}
                      >
                        {item.lowStock ? 'Unavailable' : 'Add to Order'}
                      </Button>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              <Box sx={{ mt: 3, mb: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                  Add a note to your order (optional)
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Special instructions, allergies, preferences..."
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button 
              onClick={() => setRecommendationDialogOpen(false)} 
              color="inherit"
            >
              Back to Cart
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setRecommendationDialogOpen(false);
                setPaymentDialogOpen(true);
              }}
              sx={{
                px: 3,
                py: 1,
                borderRadius: 2,
                backgroundColor: '#3ACA82',
                '&:hover': { backgroundColor: alpha('#3ACA82', 0.8) },
              }}
            >
              Continue to Payment
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={busyDialogOpen} onClose={() => setBusyDialogOpen(false)}>
          <DialogTitle>Staff is Busy</DialogTitle>
          <DialogContent>
            <Typography>
              Staff is busy and unable to get your order right now. Sorry!
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setBusyDialogOpen(false)}>OK</Button>
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
              backgroundColor: notification.severity === 'success' ? '#3ACA82' : '#d32f2f',
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
