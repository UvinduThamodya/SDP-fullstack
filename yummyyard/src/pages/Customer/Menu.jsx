import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripePayment from '../../components/StripePayment';
import Sidebar from '../../components/Sidebar';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MenuService from '../../services/menuService';
import {
  Container,
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Button,
  Tabs,
  Tab,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
  Alert
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PaymentIcon from '@mui/icons-material/Payment';

const formatCurrency = (price, currency = 'LKR', locale = 'en-LK') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(price);
};

const stripePromise = loadStripe('pk_test_51RBXHE2eTzT1rj33KqvHxzVBUeBpoDrtgtrs0rV8hvprNBZv4ny1YmaNH0mpB21AVCmf7sBeDmVvp1sYUn7YP7kX00GYfePn5k');
console.log('stripePromise:', stripePromise);

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Main-Dishes');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const navigate = useNavigate();
  

  // Check for authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (!token || !storedUser) {
      // If no token or user, redirect to login page
      navigate('/login');
      return;
    }
    
    setUser(JSON.parse(storedUser));
    
    // Fetch cart items
    fetchCartItems(token);
  }, [navigate]);

  const fetchCartItems = async (token) => {
    try {
      const response = await fetch('http://localhost:5000/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCart(data.cartItems || []);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setLoading(true);
        const items = await MenuService.getMenuItems();
        setMenuItems(items);
      } catch (error) {
        setError('Failed to fetch menu items');
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  const handleCategoryChange = (event, newCategory) => {
    setSelectedCategory(newCategory);
  };

  const handleAddToCart = async (itemId) => {
    console.log("Adding to cart, itemId:", itemId);
    
    if (!user) {
      alert("Please login to add items to your cart");
      navigate('/login');
      return;
    }
    
    if (!itemId) {
      alert("Cannot add to cart: Item ID is missing");
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          itemId,
          quantity: 1,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add to cart');
      }
      
      const data = await response.json();
      setCart(data.cartItems);
      alert('Item added to cart successfully!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      
      if (error.message === 'Not authorized' || error.message === 'Token is invalid') {
        // Handle auth errors
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        alert(`Failed to add item to cart: ${error.message}`);
      }
    }
  };

  const handleCheckout = () => {
    setCheckoutOpen(true);
    setShowPayment(false);
  };

  const handleCloseCheckout = () => {
    setCheckoutOpen(false);
    setShowPayment(false);
  };

  // New function to save order to database
  const saveOrderToDatabase = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cart,
          totalAmount: calculateTotal()
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save order');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error saving order:', error);
      throw error;
    }
  };

  // Payment success handler
  const handlePaymentSuccess = (paymentIntent) => {
    // Save the order to database
    saveOrderToDatabase()
      .then(() => {
        // Show success message
        setNotification({
          open: true,
          message: 'Payment successful! Your order has been placed.',
          severity: 'success'
        });
        
        // Close the checkout dialog
        setCheckoutOpen(false);
        
        // Clear the cart
        setCart([]);
      })
      .catch(error => {
        setNotification({
          open: true,
          message: 'Payment was successful, but there was an error saving your order.',
          severity: 'warning'
        });
      });
  };

  // Handle notification close
  const handleNotificationClose = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  // Calculate total amount
  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  const filteredItems = menuItems.filter((item) => item.category === selectedCategory);
  const displayItems = loading || filteredItems.length === 0 ? [] : filteredItems;

  if (error) {
    return <Typography color="error">Error: {error}</Typography>;
  }

  // If user isn't loaded yet, don't render the full component
  if (!user) {
    return <Typography>Loading user data...</Typography>;
  }

  return (
    <Box sx={{ display: 'flex', backgroundColor: 'white' }}>
      <Sidebar />
      <Container maxWidth="lg" sx={{ pt: 5, pb: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="subtitle1" component="div" sx={{ mb: 1, color: '#8a6d3b' }}>
            FOOD MENU
          </Typography>
          <Typography variant="h2" component="h1" sx={{ fontWeight: 'bold', color: '#333' }}>
            Our Specials Menu
          </Typography>
          <Typography variant="subtitle1" color="primary">
            Welcome, {user.name}!
          </Typography>
        </Box>

        <Box sx={{ width: '100%', bgcolor: 'background.paper', mb: 5 }}>
          <Tabs value={selectedCategory} onChange={handleCategoryChange} centered>
            <Tab label="Main Dishes" value="Main-Dishes" />
            <Tab label="Sea Food" value="Sea-Food" />
            <Tab label="Desserts" value="Desserts" />
            <Tab label="Beverage" value="Beverage" />
          </Tabs>
        </Box>

        <Grid container spacing={3}>
          {displayItems.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.item_id}>
              <Card sx={{ display: 'flex', flexDirection: 'column' }}>
                <CardMedia 
                  component="img" 
                  height="200" 
                  image={item.image_url.startsWith('/') ? `http://localhost:5000${item.image_url}` : `/assets/${item.image_url}`} 
                  alt={item.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "../public/Background.jpg"; // Fallback image if loading fails
                  }}
                />
                <CardContent sx={{ flexGrow: 1, pt: 2 }}>
                  <Typography variant="h5">{item.name}</Typography>
                  <Typography variant="body2">{item.description}</Typography>
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    {formatCurrency(item.price, 'LKR', 'en-LK')}
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

        {/* Checkout Button */}
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            onClick={handleCheckout}
            startIcon={<ShoppingCartIcon />}
            disabled={cart.length === 0}
          >
            Checkout ({cart.length} items)
          </Button>
        </Box>

        {/* Checkout Dialog */}
        <Dialog
          open={checkoutOpen}
          onClose={handleCloseCheckout}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>{showPayment ? "Payment" : "Your Order"}</DialogTitle>
          <DialogContent>
            {showPayment ? (
              <Box sx={{ py: 2 }}>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Total amount: {formatCurrency(calculateTotal())}
                </Typography>
                {stripePromise ? (
                  <Elements stripe={stripePromise}>
                    <StripePayment 
                      amount={calculateTotal()} 
                      onSuccess={handlePaymentSuccess} 
                    />
                  </Elements>
                ) : (
                  <Typography>Loading payment system...</Typography>
                )}
              </Box>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Subtotal</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cart.map((item) => (
                      <TableRow key={item.cart_item_id}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell align="right">{formatCurrency(item.price)}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">{formatCurrency(item.price * item.quantity)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3} align="right" sx={{ fontWeight: 'bold' }}>Total:</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>{formatCurrency(calculateTotal())}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DialogContent>
          <DialogActions sx={{ display: 'flex', justifyContent: 'space-between', px: 3, pb: 3 }}>
            <Button onClick={handleCloseCheckout} variant="outlined">
              Cancel
            </Button>
            {!showPayment && (
              <Button 
                onClick={() => setShowPayment(true)} 
                variant="contained" 
                color="primary" 
                startIcon={<PaymentIcon />}
              >
                Proceed to Payment
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Notifications */}
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleNotificationClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleNotificationClose} 
            severity={notification.severity}
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default Menu;
