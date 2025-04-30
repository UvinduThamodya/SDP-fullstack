import React, { useEffect, useState } from 'react';
import apiService from '../../services/api';
import io from 'socket.io-client';
import {
  Box, Container, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, Chip, Snackbar, Alert, Dialog, 
  DialogTitle, DialogContent, DialogActions, Select, MenuItem, FormControl,
  InputLabel, Divider, Grid, Card, CardContent
} from '@mui/material';
import { ThemeProvider, createTheme, styled } from '@mui/material/styles';
import SidebarStaff from '../../components/SidebarStaff';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import EditIcon from '@mui/icons-material/Edit';

// Note: Add this link to your index.html:
// <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">

const SOCKET_URL = 'http://localhost:5000'; // Change to your backend URL

// Create a custom theme with Poppins font
const theme = createTheme({
  typography: {
    fontFamily: 'Poppins, Arial, sans-serif',
    h4: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1.15rem',
    },
    body1: {
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
      default: '#f5f7fa',
      paper: '#ffffff',
    },
    status: {
      completed: '#388e3c',
      pending: '#f57c00',
      readyToPickUp: '#0288d1',
      cancelled: '#d32f2f',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 6,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: '#f3f4f6',
            fontWeight: 600,
          },
        },
      },
    },
  },
});

const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontFamily: 'Poppins, Arial, sans-serif',
  fontWeight: 500,
  backgroundColor: 
    status === 'Completed' ? '#e8f5e9' :
    status === 'Pending' ? '#fff3e0' :
    status === 'Ready to Pick up' ? '#e1f5fe' :
    status === 'Cancelled' ? '#ffebee' :
    '#f5f5f5',
  color: 
    status === 'Completed' ? theme.palette.status.completed :
    status === 'Pending' ? theme.palette.status.pending :
    status === 'Ready to Pick up' ? theme.palette.status.readyToPickUp :
    status === 'Cancelled' ? theme.palette.status.cancelled :
    '#616161',
}));

const PageHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
  '& svg': {
    marginRight: theme.spacing(1.5),
    fontSize: '2rem',
    color: theme.palette.primary.main,
  },
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  marginTop: theme.spacing(2),
  '& .MuiTableRow-root': {
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.03)',
    },
  },
}));

const ActionButton = styled(Button)(({ theme, color }) => ({
  boxShadow: 'none',
  minWidth: '130px',
}));

const formatCurrency = (price, currency = 'LKR', locale = 'en-LK') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(price);
};

const statusOptions = ['Pending', 'Ready to Pick up', 'Completed', 'Cancelled'];

const getStatusColor = (status) => {
  switch (status) {
    case 'Completed': return 'success';
    case 'Pending': return 'warning';
    case 'Ready to Pick up': return 'info';
    case 'Cancelled': return 'error';
    default: return 'default';
  }
};

export default function StaffDashboard() {
  const [orders, setOrders] = useState([]);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusDialog, setStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  
  // Stats counters
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0
  });

  // Calculate stats based on orders
  useEffect(() => {
    if (!orders.length) return;
    
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(order => order.status === 'Pending').length;
    const completedOrders = orders.filter(order => order.status === 'Completed').length;
    const cancelledOrders = orders.filter(order => order.status === 'Cancelled').length;
    
    setStats({
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders
    });
  }, [orders]);

  // Function to handle "Change Status" button click
  const handleChangeStatus = (order) => {
    setSelectedOrder(order); // Set the selected order
    setNewStatus(order.status); // Set the current status as the default value
    setStatusDialog(true); // Open the status change dialog
  };

  // Connect to Socket.IO and fetch orders on mount
  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on('orderCreated', (order) => {
      setOrders(prev => [order, ...prev]);
      setNotification({ open: true, message: `New order #${order.order_id} placed!`, severity: 'info' });
    });

    socket.on('orderUpdated', (order) => {
      setOrders(prev => prev.map(o => o.order_id === order.order_id ? order : o));
      setNotification({ open: true, message: `Order #${order.order_id} updated!`, severity: 'success' });
    });

    // Initial fetch using apiService
    fetchOrders();

    return () => socket.disconnect();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await apiService.getAllOrders();
      console.log('Fetched orders:', response);
      setOrders(response.orders); // Access the actual array
    } catch (error) {
      setNotification({ open: true, message: 'Failed to fetch orders', severity: 'error' });
    }
  };

  const handleStatusUpdate = async () => {
    try {
      await apiService.updateOrderStatus(selectedOrder.order_id, newStatus);
      setStatusDialog(false);
      setSelectedOrder(null);
      // No need to refetch; socket will update state
    } catch (error) {
      setNotification({ open: true, message: 'Failed to update status', severity: 'error' });
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', backgroundColor: theme.palette.background.default, minHeight: '100vh' }}>
        <SidebarStaff />
        
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <PageHeader>
              <DashboardIcon />
              <Typography variant="h4">Staff Dashboard</Typography>
            </PageHeader>
            
            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Total Orders
                    </Typography>
                    <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
                      {stats.totalOrders}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Pending Orders
                    </Typography>
                    <Typography variant="h5" component="div" sx={{ fontWeight: 600, color: theme.palette.status.pending }}>
                      {stats.pendingOrders}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Completed Orders
                    </Typography>
                    <Typography variant="h5" component="div" sx={{ fontWeight: 600, color: theme.palette.status.completed }}>
                      {stats.completedOrders}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Cancelled Orders
                    </Typography>
                    <Typography variant="h5" component="div" sx={{ fontWeight: 600, color: theme.palette.status.cancelled }}>
                      {stats.cancelledOrders}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ReceiptLongIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                  <Typography variant="h6">All Orders</Typography>
                </Box>

              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              <StyledTableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Order ID</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Customer/Staff</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                          <Typography color="textSecondary">No orders available</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      orders.map(order => (
                        <TableRow key={order.order_id}>
                          <TableCell sx={{ fontWeight: 500 }}>{order.order_id}</TableCell>
                          <TableCell>{new Date(order.order_date).toLocaleString()}</TableCell>
                          <TableCell>{order.customer_id ? `Customer #${order.customer_id}` : `Staff #${order.staff_id}`}</TableCell>
                          <TableCell>
                            <StatusChip 
                              label={order.status} 
                              status={order.status} 
                              size="small"
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 500 }}>{formatCurrency(order.total_amount)}</TableCell>
                          <TableCell align="center">
                            <ActionButton 
                              variant="outlined" 
                              size="small" 
                              startIcon={<EditIcon />}
                              onClick={() => handleChangeStatus(order)}
                            >
                              Change Status
                            </ActionButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </StyledTableContainer>
            </Paper>

            {/* Status Change Dialog */}
            <Dialog 
              open={statusDialog} 
              onClose={() => setStatusDialog(false)}
              PaperProps={{
                sx: {
                  borderRadius: 2,
                  width: '400px',
                  maxWidth: '100%'
                }
              }}
            >
              <DialogTitle sx={{ 
                borderBottom: '1px solid #e0e0e0',
                fontWeight: 600
              }}>
                Change Order Status
              </DialogTitle>
              <DialogContent sx={{ pt: 3, pb: 1 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
                  Order #{selectedOrder?.order_id}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  {selectedOrder && new Date(selectedOrder.order_date).toLocaleString()}
                </Typography>
                
                <FormControl fullWidth variant="outlined" sx={{ mt: 2 }}>
                  <InputLabel id="status-select-label">Status</InputLabel>
                  <Select
                    labelId="status-select-label"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    label="Status"
                  >
                    {statusOptions.map(status => (
                      <MenuItem key={status} value={status}>
                        <StatusChip 
                          label={status} 
                          status={status} 
                          size="small" 
                        />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </DialogContent>
              <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
                <Button onClick={() => setStatusDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleStatusUpdate} 
                  variant="contained"
                  color="primary"
                >
                  Update
                </Button>
              </DialogActions>
            </Dialog>

            {/* Notification Snackbar */}
            <Snackbar
              open={notification.open}
              autoHideDuration={4000}
              onClose={() => setNotification({ ...notification, open: false })}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
              <Alert 
                severity={notification.severity}
                sx={{ 
                  width: '100%',
                  fontFamily: 'Poppins, sans-serif',
                  borderRadius: 2,
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
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
}