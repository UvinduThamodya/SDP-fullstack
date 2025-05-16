import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Container, Grid, Paper, Button, Snackbar, Alert, IconButton,
  TextField, Dialog, DialogTitle, DialogContent, DialogActions, Divider, Tabs, Tab,
    CssBaseline, ThemeProvider, createTheme, Chip
} from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SidebarStaff from '../../components/SidebarStaff';
import MenuService from '../../services/menuService';
import apiService from '../../services/api';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import StripePayment from '../../components/StripePayment';
import useMediaQuery from '@mui/material/useMediaQuery';
import MenuIcon from '@mui/icons-material/Menu';
import io from 'socket.io-client';

// Import Poppins font
const poppinsFont = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
`;

// Create theme with Poppins
const theme = createTheme({
  typography: {
    fontFamily: '"Poppins", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
    button: {
      fontWeight: 500,
      textTransform: 'none',
    },
  },
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
    success: {
      main: '#2e7d32',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          },
        },
      },
    },
  },
});

const stripePromise = loadStripe('pk_test_51RBXHE2eTzT1rj33KqvHxzVBUeBpoDrtgtrs0rV8hvprNBZv4ny1YmaNH0mpB21AVCmf7sBeDmVvp1sYUn7YP7kX00GYfePn5k');

const formatCurrency = (price, currency = 'LKR', locale = 'en-LK') =>
  new Intl.NumberFormat(locale, { style: 'currency', currency }).format(price);

const Order = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [order, setOrder] = useState({});
  const [openCheckoutDialog, setOpenCheckoutDialog] = useState(false);
  const [openCashDialog, setOpenCashDialog] = useState(false);
  const [amountGiven, setAmountGiven] = useState('');
  const [balance, setBalance] = useState(0);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentType, setPaymentType] = useState('');
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const [sidebarOpen, setSidebarOpen] = useState(false); // Default to hidden for mobile view
  const [availability, setAvailability] = useState('Accepting');
  const [busyDialogOpen, setBusyDialogOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Calculate balance for cash payments
  useEffect(() => {
    const total = Object.entries(order)
      .filter(([_, qty]) => qty > 0)
      .reduce((sum, [itemId, qty]) => {
        const item = menuItems.find(m => m.item_id === Number(itemId));
        return sum + (item?.price || 0) * qty;
      }, 0);
    const calculatedBalance = parseFloat(amountGiven || 0) - total;
    setBalance(calculatedBalance);
  }, [amountGiven, order, menuItems]);

  // Fetch menu items and set default category
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setLoading(true);
        const items = await MenuService.getMenuItems();
        setMenuItems(items);
        if (items.length > 0) {
          setSelectedCategory(items[0].category); // Default to first category
        }
      } catch (error) {
        setError('Failed to fetch menu items');
      } finally {
        setLoading(false);
      }
    };
    fetchMenuItems();
  }, []);

  useEffect(() => {
    const fetchLowStockItems = async () => {
      try {
        const lowStockItems = await MenuService.getLowStockMenuItems();
        setMenuItems(prevItems =>
          prevItems.map(item => ({
            ...item,
            lowStock: lowStockItems.some(lowStockItem => lowStockItem.menu_item_id === item.item_id),
          }))
        );
      } catch (error) {
        console.error('Failed to fetch low stock items:', error);
      }
    };

    fetchLowStockItems();
  }, []);

  useEffect(() => {
    fetch('http://localhost:5000/api/availability')
      .then(res => res.json())
      .then(data => setAvailability(data.availability));
    const socket = io('http://localhost:5000');
    socket.on('availabilityChanged', data => setAvailability(data.availability));
    return () => socket.disconnect();
  }, []);

  // Extract unique categories from menuItems
  const categories = [...new Set(menuItems.map(item => item.category))];

  const handleCategoryChange = (event, newCategory) => {
    setSelectedCategory(newCategory);
  };

  const handleQuantityChange = (itemId, quantity) => {
    if (availability === 'Busy') {
      setBusyDialogOpen(true);
      return;
    }
    setOrder((prevOrder) => ({
      ...prevOrder,
      [itemId]: Math.max(0, quantity),
    }));
  };

  const handleCheckout = () => {
    const orderItems = Object.entries(order)
      .filter(([_, quantity]) => quantity > 0)
      .map(([itemId, quantity]) => {
        const item = menuItems.find((menuItem) => menuItem.item_id === parseInt(itemId));
        return { ...item, quantity };
      });

    if (orderItems.length === 0) {
      setNotification({ open: true, message: 'No items in the order!', severity: 'warning' });
      return;
    }
    setOpenCheckoutDialog(true);
  };

  const handlePaymentOption = (option) => {
    setOpenCheckoutDialog(false);
    if (option === 'Cash') {
      setPaymentType('cash');
      setOpenCashDialog(true);
    } else if (option === 'Card') {
      setPaymentType('card');
      setPaymentDialogOpen(true);
    }
  };

  const handlePayment = async (paymentData) => {
    try {
      // Validate cash payments
      if (paymentData.method === 'cash') {
        const total = Object.entries(order)
          .filter(([_, qty]) => qty > 0)
          .reduce((sum, [itemId, qty]) => {
            const item = menuItems.find(m => m.item_id === Number(itemId));
            return sum + (item?.price || 0) * qty;
          }, 0);

        if (paymentData.cashReceived < total) {
          setNotification({
            open: true,
            message: 'Insufficient cash received',
            severity: 'error'
          });
          return;
        }
      }

      // Prepare order items with price
      const orderItems = Object.entries(order)
        .filter(([_, quantity]) => quantity > 0)
        .map(([itemId, quantity]) => {
          const item = menuItems.find((menuItem) => menuItem.item_id === parseInt(itemId));
          return { item_id: item.item_id, quantity, price: item.price };
        });

      const orderData = {
        items: orderItems,
        payment: paymentData,
      };

      await apiService.createOrder(orderData);

      setNotification({ open: true, message: 'Order placed successfully!', severity: 'success' });

      // Clear the order and close dialogs
      setOrder({});
      setAmountGiven('');
      setBalance(0);
      setOpenCashDialog(false);
      setPaymentDialogOpen(false);
    } catch (error) {
      setNotification({ open: true, message: 'Payment failed. Please try again.', severity: 'error' });
    }
  };

  const filteredItems = menuItems.filter((item) => item.category === selectedCategory);
  const displayItems = loading || filteredItems.length === 0 ? [] : filteredItems;

  const totalAmount = Object.entries(order)
    .filter(([_, quantity]) => quantity > 0)
    .reduce((total, [itemId, quantity]) => {
      const item = menuItems.find((menuItem) => menuItem.item_id === parseInt(itemId));
      return total + item.price * quantity;
    }, 0);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <style>{poppinsFont}</style>
      <Box sx={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
        {/* Sidebar for desktop, Drawer-style for mobile */}
        <Box
          sx={{
            display: { xs: sidebarOpen ? 'block' : 'none', sm: 'block' },
            position: { xs: 'fixed', sm: 'relative' },
            zIndex: 1200,
            height: '100vh',
            minHeight: '100vh',
            width: { xs: 220, sm: 'auto' },
            background: { xs: '#fff', sm: 'none' },
            boxShadow: { xs: 3, sm: 'none' },
            transition: 'left 0.3s',
            left: { xs: sidebarOpen ? 0 : '-100%', sm: 0 },
            top: 0,
          }}
        >
          <SidebarStaff
            open={sidebarOpen}
            toggleSidebar={() => setSidebarOpen(false)}
            sx={{
              minHeight: '100vh',
              height: '100vh',
              borderRight: 0,
            }}
          />
        </Box>
        {/* Mobile menu button */}
        <Button
          variant="contained"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          sx={{
            display: { xs: 'flex', sm: 'none' },
            position: 'fixed',
            top: 16,
            left: 16,
            zIndex: 1300,
            minWidth: 'auto',
            width: 44,
            height: 44,
            borderRadius: '50%',
            boxShadow: 3,
            alignItems: 'center',
            justifyContent: 'center',
            p: 0,
          }}
        >
          <MenuIcon />
        </Button>
        <Box component="main" sx={{ flexGrow: 1, backgroundColor: '#f5f5f5', p: { xs: 2, sm: 3 }, width: '100%' }}>
          <Container maxWidth="lg" sx={{ pt: 4, pb: 6 }}>
            {/* Availability Banner */}
            {availability === 'Busy' && (
              <Box sx={{ mb: 3, p: 2, bgcolor: '#fff3e0', borderRadius: 2, textAlign: 'center' }}>
                <Typography variant="h5" color="error" sx={{ fontWeight: 700 }}>
                  Staff is Busy - Orders are temporarily unavailable
                </Typography>
              </Box>
            )}
            <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
              <Typography variant="h5" sx={{ mb: 2, fontSize: 28, fontWeight: 600, color: '#333' }}>
                Food Menu
              </Typography>
              
              {/* Category Tabs */}
              <Box sx={{ width: '100%', bgcolor: 'background.paper', mb: 3 }}>
                <Tabs
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  variant={isSmall ? "scrollable" : "standard"}
                  centered={!isSmall}
                  scrollButtons={isSmall ? "auto" : false}
                  sx={{
                    '& .MuiTabs-indicator': {
                      backgroundColor: theme.palette.primary.main,
                    },
                    '& .MuiTab-root': {
                      fontWeight: 500,
                      fontSize: 29,
                      textTransform: 'none',
                    }
                  }}
                >
                  {categories.map(category => (
                    <Tab key={category} label={category} value={category} />
                  ))}
                </Tabs>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={handleCheckout}
                  disabled={Object.entries(order).filter(([_, qty]) => qty > 0).length === 0}
                  sx={{ 
                    px: 4, 
                    py: 1.2, 
                    fontSize: '1rem', 
                    fontWeight: 500 
                  }}
                >
                  Checkout ({Object.entries(order).filter(([_, qty]) => qty > 0).length} items)
                </Button>
              </Box>
            </Paper>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Grid container spacing={3}>
              {displayItems.map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item.item_id}>
                  <Paper 
                    sx={{ 
                      p: 3, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      height: '100%',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }
                    }}
                  >
                    <Typography variant="h6" sx={{ fontSize: 30, fontWeight: 600, mb: 1 }}>
                      {item.name}
                    </Typography>
                    {item.lowStock && ( // Check if the item is low stock
                      <Chip
                        label="Low Stock"
                        color="error"
                        size="small"
                        sx={{
                          backgroundColor: '#ff9800',
                          color: '#fff',
                          fontWeight: 'bold',
                          mb: 1,
                        }}
                      />
                    )}
                    <Typography variant="body2" sx={{ mb: 2, color: '#666', flexGrow: 1 }}>
                      {item.description}
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary.main, fontWeight: 600 }}>
                      {formatCurrency(item.price, 'LKR', 'en-LK')}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                      <IconButton
                        onClick={() => handleQuantityChange(item.item_id, (order[item.item_id] || 0) - 1)}
                        color="primary"
                        size="small"
                        disabled={availability === 'Busy' || item.lowStock}
                        sx={{ 
                          backgroundColor: '#f0f0f0', 
                          '&:hover': { backgroundColor: '#e0e0e0' } 
                        }}
                      >
                        <RemoveIcon />
                      </IconButton>
                      <TextField
                        value={order[item.item_id] || 0}
                        onChange={(e) => handleQuantityChange(item.item_id, parseInt(e.target.value) || 0)}
                        type="number"
                        variant="outlined"
                        size="small"
                        inputProps={{ 
                          min: 0, 
                          style: { textAlign: 'center', fontWeight: 500 }
                        }}
                        sx={{ width: 60 }}
                        disabled={availability === 'Busy' || item.lowStock}
                      />
                      <IconButton
                        onClick={() => handleQuantityChange(item.item_id, (order[item.item_id] || 0) + 1)}
                        color="primary"
                        size="small"
                        disabled={availability === 'Busy' || item.lowStock}
                        sx={{ 
                          backgroundColor: '#f0f0f0', 
                          '&:hover': { backgroundColor: '#e0e0e0' } 
                        }}
                      >
                        <AddIcon />
                      </IconButton>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Snackbar
              open={notification.open}
              autoHideDuration={4000}
              onClose={() => setNotification({ ...notification, open: false })}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
              <Alert 
                severity={notification.severity} 
                sx={{ width: '100%' }}
                onClose={() => setNotification({ ...notification, open: false })}
              >
                {notification.message}
              </Alert>
            </Snackbar>

            {/* Checkout Dialog */}
            <Dialog 
              open={openCheckoutDialog} 
              onClose={() => setOpenCheckoutDialog(false)} 
              maxWidth="sm" 
              fullWidth
              PaperProps={{
                sx: { borderRadius: 2 }
              }}
            >
              <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>Order Summary</DialogTitle>
              <DialogContent dividers>
                <Box sx={{ mb: 2 }}>
                  {Object.entries(order)
                    .filter(([_, quantity]) => quantity > 0)
                    .map(([itemId, quantity]) => {
                      const item = menuItems.find((menuItem) => menuItem.item_id === parseInt(itemId));
                      return (
                        <Box
                          key={itemId}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 2,
                            p: 2,
                            border: '1px solid #eee',
                            borderRadius: 1,
                            backgroundColor: '#f9f9f9',
                          }}
                        >
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>{item.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {formatCurrency(item.price, 'LKR', 'en-LK')} × {quantity} = {formatCurrency(item.price * quantity, 'LKR', 'en-LK')}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconButton
                              onClick={() => handleQuantityChange(itemId, quantity - 1)}
                              color="primary"
                              size="small"
                            >
                              <RemoveIcon fontSize="small" />
                            </IconButton>
                            <TextField
                              value={quantity}
                              onChange={(e) => handleQuantityChange(itemId, parseInt(e.target.value) || 0)}
                              type="number"
                              size="small"
                              inputProps={{ 
                                min: 0, 
                                style: { textAlign: 'center', width: '40px' } 
                              }}
                            />
                            <IconButton
                              onClick={() => handleQuantityChange(itemId, quantity + 1)}
                              color="primary"
                              size="small"
                            >
                              <AddIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              onClick={() => {
                                setOrder((prevOrder) => {
                                  const updatedOrder = { ...prevOrder };
                                  delete updatedOrder[itemId];
                                  return updatedOrder;
                                });
                              }}
                              color="error"
                              size="small"
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      );
                    })}
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="h6" sx={{ textAlign: 'right', mb: 3, fontWeight: 600 }}>
                  Total: {formatCurrency(
                    Object.entries(order)
                      .filter(([_, quantity]) => quantity > 0)
                      .reduce((total, [itemId, quantity]) => {
                        const item = menuItems.find((menuItem) => menuItem.item_id === parseInt(itemId));
                        return total + item.price * quantity;
                      }, 0),
                    'LKR',
                    'en-LK'
                  )}
                </Typography>
                <Typography variant="h6" sx={{ textAlign: 'center', mb: 2 }}>
                  Choose Payment Method
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2 }}>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<AttachMoneyIcon />}
                    onClick={() => handlePaymentOption('Cash')}
                    sx={{ px: 4, py: 1 }}
                  >
                    Cash
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<CreditCardIcon />}
                    onClick={() => handlePaymentOption('Card')}
                    sx={{ px: 4, py: 1 }}
                  >
                    Card Payment
                  </Button>
                </Box>
              </DialogContent>
              <DialogActions sx={{ p: 2 }}>
                <Button 
                  onClick={() => setOpenCheckoutDialog(false)} 
                  color="error"
                  variant="outlined"
                >
                  Cancel
                </Button>
              </DialogActions>
            </Dialog>

            {/* Cash Payment Dialog */}
            <Dialog 
              open={openCashDialog} 
              onClose={() => setOpenCashDialog(false)} 
              maxWidth="sm" 
              fullWidth
              PaperProps={{
                sx: { borderRadius: 2 }
              }}
            >
              <DialogTitle sx={{ fontWeight: 600 }}>Cash Payment</DialogTitle>
              <DialogContent dividers>
                <Box sx={{ py: 2 }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 500 }}>
                    Total Amount: {formatCurrency(totalAmount, 'LKR', 'en-LK')}
                  </Typography>
                  <TextField
                    label="Amount Given"
                    type="number"
                    value={amountGiven}
                    onChange={(e) => setAmountGiven(e.target.value)}
                    fullWidth
                    sx={{ mb: 3 }}
                    inputProps={{ min: 0 }}
                    variant="outlined"
                  />
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      mt: 2, 
                      p: 2, 
                      backgroundColor: balance >= 0 ? '#e8f5e9' : '#ffebee',
                      borderRadius: 2 
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 500, color: balance >= 0 ? '#2e7d32' : '#d32f2f' }}>
                      Balance: {balance >= 0 ? formatCurrency(balance, 'LKR', 'en-LK') : 'Insufficient Amount'}
                    </Typography>
                  </Paper>
                </Box>
              </DialogContent>
              <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
                <Button 
                  onClick={() => setOpenCashDialog(false)} 
                  color="error"
                  variant="outlined"
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => handlePayment({
                    method: 'cash',
                    amount: totalAmount,
                    cashReceived: parseFloat(amountGiven),
                    change: parseFloat(amountGiven) - totalAmount,
                  })}
                  disabled={balance < 0 || amountGiven === ''}
                >
                  Confirm Payment
                </Button>
              </DialogActions>
            </Dialog>

            {/* Card Payment Dialog */}
            <Dialog 
              open={paymentType === 'card' && paymentDialogOpen} 
              onClose={() => setPaymentDialogOpen(false)} 
              maxWidth="sm" 
              fullWidth
              PaperProps={{
                sx: { borderRadius: 2 }
              }}
            >
              <DialogTitle sx={{ fontWeight: 600 }}>Card Payment</DialogTitle>
              <DialogContent dividers>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 500 }}>
                  Total Amount: {formatCurrency(totalAmount, 'LKR', 'en-LK')}
                </Typography>
                <Elements stripe={stripePromise}>
                  <StripePayment
                    amount={totalAmount}
                    onSuccess={(paymentIntent) => handlePayment({
                      method: 'card',
                      amount: totalAmount,
                      stripeToken: paymentIntent.id,
                    })}
                    onError={() => setNotification({ open: true, message: 'Card payment failed.', severity: 'error' })}
                  />
                </Elements>
              </DialogContent>
              <DialogActions sx={{ p: 2 }}>
                <Button 
                  onClick={() => setPaymentDialogOpen(false)} 
                  color="error"
                  variant="outlined"
                >
                  Cancel
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
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Order;