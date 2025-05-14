// pages/Customer/OrderHistory.jsx
import React, { useState, useEffect } from 'react';
import {
  Container, Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, Chip,
  Snackbar, Alert, Divider
} from '@mui/material';
import { styled, ThemeProvider, createTheme } from '@mui/material/styles';
import ReceiptIcon from '@mui/icons-material/Receipt';
import InfoIcon from '@mui/icons-material/Info';
import HistoryIcon from '@mui/icons-material/History';
import Navbar from '../../components/Navbar';

// We'll use Google Fonts instead of @fontsource
// Add this to your index.html or App.js:
// <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

// Create a custom theme with Poppins font
const theme = createTheme({
  typography: {
    fontFamily: 'Poppins, Arial, sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
    subtitle1: {
      fontSize: '0.95rem',
    },
  },
  palette: {
    primary: {
      main: '#1976d2',
      dark: '#0d47a1',
      light: '#42a5f5',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f8f9fa',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            fontWeight: 600,
            backgroundColor: '#e3f2fd',
          },
        },
      },
    },
  },
});

const formatCurrency = (price, currency = 'LKR', locale = 'en-LK') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(price);
};

const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontFamily: 'Poppins, Arial, sans-serif',
  fontWeight: 500,
  borderRadius: 16,
  padding: '0 6px',
  backgroundColor: 
    status === 'Completed' ? theme.palette.success.light :
    status === 'Pending' ? theme.palette.warning.light :
    status === 'Preparing' ? theme.palette.info.light :
    status === 'Accepted' ? theme.palette.primary.light : // Add this line
    theme.palette.error.light,
  color: 
    status === 'Completed' ? theme.palette.success.dark :
    status === 'Pending' ? theme.palette.warning.dark :
    status === 'Preparing' ? theme.palette.info.dark :
    status === 'Accepted' ? theme.palette.primary.dark : // Add this line
    theme.palette.error.dark,
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  borderRadius: 12,
  overflow: 'hidden',
  marginBottom: 24,
  border: '1px solid rgba(0, 0, 0, 0.05)',
}));

const OrderCardHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
  gap: theme.spacing(1.5),
  '& svg': {
    color: theme.palette.primary.main,
    fontSize: 32,
  },
}));

const ActionButton = styled(Button)(({ theme, color }) => ({
  boxShadow: 'none',
  textTransform: 'none',
  fontWeight: 500,
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.08)',
    transform: 'translateY(-2px)',
  },
}));

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch('/api/orders/history', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const data = await response.json();
        console.log("Fetched orders:", data); // Debug log
        setOrders(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleViewDetails = async (orderId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }

      const data = await response.json();
      setSelectedOrder(data);
      setOpenDialog(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      
      // Make a direct fetch request with CORS credentials
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/receipt`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include' // Important for CORS with authentication
      });
      
      if (!response.ok) {
        // Try to parse error response as JSON
        try {
          const errorData = await response.json();
          throw new Error(errorData.message || errorData.error || 'Failed to download receipt');
        } catch (jsonError) {
          // If response is not JSON, use status text
          throw new Error(`Failed to download receipt: ${response.statusText}`);
        }
      }
      
      // Get the PDF as a blob
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt-order-${orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      setNotification({
        open: true,
        message: 'Receipt downloaded successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error("Error downloading receipt:", error);
      setNotification({
        open: true,
        message: `Error downloading receipt: ${error.message}`,
        severity: 'error'
      });
    }
  };
  
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default
      }}>
        <Navbar />
        <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3, md: 4 } }}>
          <Container maxWidth="lg">
            <OrderCardHeader>
              <HistoryIcon />
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                My Order History
              </Typography>
            </OrderCardHeader>

            {loading && !orders.length ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
                <CircularProgress size={60} thickness={4} />
              </Box>
            ) : error ? (
              <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: '#fff4f4', color: '#d32f2f' }}>
                <Typography variant="h6">{error}</Typography>
              </Paper>
            ) : orders.length === 0 ? (
              <Paper sx={{ 
                p: 6, 
                textAlign: 'center', 
                bgcolor: 'white',
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              }}>
                <Typography variant="h6" sx={{ color: '#757575', fontWeight: 500 }}>
                  You haven't placed any orders yet.
                </Typography>
              </Paper>
            ) : (
              <StyledTableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Order ID</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Payment Method</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow 
                        key={order.order_id}
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                          '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.02)' },
                          transition: 'background-color 0.2s'
                        }}
                      >
                        <TableCell sx={{ fontWeight: 500 }}>{order.order_id}</TableCell>
                        <TableCell>{new Date(order.order_date).toLocaleString()}</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>{formatCurrency(order.total_amount)}</TableCell>
                        <TableCell>
                          <StatusChip 
                            label={order.status} 
                            status={order.status} 
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{order.payment_method || 'N/A'}</TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                            <ActionButton
                              size="small"
                              variant="outlined"
                              startIcon={<InfoIcon />}
                              onClick={() => handleViewDetails(order.order_id)}
                            >
                              Details
                            </ActionButton>
                            <ActionButton
                              size="small"
                              variant="contained"
                              color="primary"
                              startIcon={<ReceiptIcon />}
                              onClick={() => handleDownloadReceipt(order.order_id)}
                            >
                              Receipt
                            </ActionButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </StyledTableContainer>
            )}

            {/* Order Details Dialog */}
            <Dialog
              open={openDialog}
              onClose={() => setOpenDialog(false)}
              maxWidth="md"
              fullWidth
              PaperProps={{
                sx: {
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                }
              }}
            >
              <DialogTitle sx={{ 
                backgroundColor: theme.palette.primary.main, 
                color: 'white',
                fontWeight: 600,
                py: 2,
              }}>
                Order Details
              </DialogTitle>
              <DialogContent dividers sx={{ p: 3 }}>
                {selectedOrder && (
                  <Box>
                    <Box sx={{ 
                      display: 'grid', 
                      gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                      gap: 3,
                      mb: 3,
                      p: 2,
                      backgroundColor: 'rgba(0, 0, 0, 0.02)',
                      borderRadius: 2
                    }}>
                      <Typography variant="subtitle1" gutterBottom>
                        <strong>Order ID:</strong> {selectedOrder.orderInfo.order_id}
                      </Typography>
                      <Typography variant="subtitle1" gutterBottom>
                        <strong>Date:</strong> {new Date(selectedOrder.orderInfo.order_date).toLocaleString()}
                      </Typography>
                      <Typography variant="subtitle1" gutterBottom>
                        <strong>Status:</strong> 
                        <StatusChip 
                          label={selectedOrder.orderInfo.status} 
                          status={selectedOrder.orderInfo.status} 
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      </Typography>
                      <Typography variant="subtitle1" gutterBottom>
                        <strong>Payment Method:</strong> {selectedOrder.orderInfo.payment_method || 'N/A'}
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ my: 3 }} />
                    
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                      <ReceiptIcon sx={{ mr: 1 }} /> Order Items
                    </Typography>
                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Item</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell align="right">Price</TableCell>
                            <TableCell align="right">Quantity</TableCell>
                            <TableCell align="right">Subtotal</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedOrder.items.map((item) => (
                            <TableRow key={item.order_item_id}>
                              <TableCell sx={{ fontWeight: 500 }}>{item.name}</TableCell>
                              <TableCell>{item.category}</TableCell>
                              <TableCell align="right">{formatCurrency(item.price)}</TableCell>
                              <TableCell align="right">{item.quantity}</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 500 }}>{formatCurrency(item.subtotal)}</TableCell>
                            </TableRow>
                          ))}
                          <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.03)' }}>
                            <TableCell colSpan={4} align="right" sx={{ fontWeight: 600 }}>
                              Total:
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                              {formatCurrency(selectedOrder.orderInfo.total_amount)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}
              </DialogContent>
              <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
                <Button 
                  onClick={() => setOpenDialog(false)}
                  variant="outlined"
                  sx={{ borderRadius: 8, px: 3 }}
                >
                  Close
                </Button>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => handleDownloadReceipt(selectedOrder.orderInfo.order_id)}
                  startIcon={<ReceiptIcon />}
                  sx={{ borderRadius: 8, px: 3 }}
                >
                  Download Receipt
                </Button>
              </DialogActions>
            </Dialog>

            {/* Notification Snackbar */}
            <Snackbar
              open={notification.open}
              autoHideDuration={4000}
              onClose={() => setNotification({...notification, open: false})}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
              <Alert 
                onClose={() => setNotification({...notification, open: false})} 
                severity={notification.severity}
                sx={{ 
                  width: '100%',
                  fontFamily: 'Poppins, Arial, sans-serif',
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                }}
              >
                {notification.message}
              </Alert>
            </Snackbar>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default OrderHistory;