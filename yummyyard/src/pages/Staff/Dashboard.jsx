import React, { useEffect, useState, useRef } from 'react';
import apiService from '../../services/api';
import io from 'socket.io-client';
import Swal from 'sweetalert2';
import {
  Box, Container, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, Chip, Snackbar, Alert, Dialog, 
  DialogTitle, DialogContent, DialogActions, Select, MenuItem, FormControl,
  InputLabel, Divider, Grid, Card, CardContent, Tooltip
} from '@mui/material';
import { ThemeProvider, createTheme, styled } from '@mui/material/styles';
import SidebarStaff from '../../components/SidebarStaff';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import EditIcon from '@mui/icons-material/Edit';
import DownloadIcon from '@mui/icons-material/Download';
import MenuIcon from '@mui/icons-material/Menu';

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
      main: '#3ACA82', // Changed from '#1976d2' to green
      dark: '#2d9e68', // Darker shade of green
      light: '#4dd496', // Lighter shade of green
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
    status === 'Cancelled' ? '#ffebee' :
    '#f5f5f5',
  color: 
    status === 'Completed' ? theme.palette.status.completed :
    status === 'Pending' ? theme.palette.status.pending :
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
  backgroundColor: color === 'primary' ? '#3ACA82' : undefined,
  '&:hover': {
    backgroundColor: color === 'primary' ? '#2d9e68' : undefined,
  }
}));

const MenuItemChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  backgroundColor: theme.palette.primary.light,
  color: 'white',
  fontWeight: 500,
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
  }
}));

const OrderDetailsContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5),
  backgroundColor: '#f8f9fa',
  borderRadius: theme.shape.borderRadius,
  border: '1px solid #e0e0e0',
  maxHeight: '120px',
  overflowY: 'auto',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    boxShadow: '0 0 0 1px rgba(58, 202, 130, 0.2)',
  }
}));

const formatCurrency = (price, currency = 'LKR', locale = 'en-LK') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(price);
};

const statusOptions = ['Pending', 'Accepted', 'Completed', 'Cancelled'];

const getStatusColor = (status) => {
  switch (status) {
    case 'Completed': return 'success';
    case 'Pending': return 'warning';
    case 'Cancelled': return 'error';
    default: return 'default';
  }
};

const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
  },
}));

const ResponsiveGrid = styled(Grid)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
}));

const ResponsiveTableContainer = styled(TableContainer)(({ theme }) => ({
  '& .MuiTableCell-root': {
    [theme.breakpoints.down('sm')]: {
      fontSize: '0.75rem',
      padding: theme.spacing(0.5),
    },
  },
  '& .MuiTableRow-root': {
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      borderBottom: `1px solid ${theme.palette.divider}`,
      marginBottom: theme.spacing(1),
    },
  },
}));

export default function StaffDashboard() {
  const [orders, setOrders] = useState([]);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusDialog, setStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false); // Default to hidden for mobile view
  const [availability, setAvailability] = useState('Accepting');
  const socketRef = useRef(null);
  // Add new state for the note popup
  const [notePopup, setNotePopup] = useState({
    open: false,
    note: '',
    orderId: null
  });

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  // Daily stats counters
  const [dailyStats, setDailyStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
  });

  // Calculate daily stats based on orders
  useEffect(() => {
    if (!orders.length) return;

    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
    const dailyOrders = orders.filter(order => order.order_date.startsWith(today));

    const totalOrders = dailyOrders.length;
    const pendingOrders = dailyOrders.filter(order => order.status === 'Pending').length;
    const completedOrders = dailyOrders.filter(order => order.status === 'Completed').length;
    const cancelledOrders = dailyOrders.filter(order => order.status === 'Cancelled').length;
    const acceptedOrders = dailyOrders.filter(order => order.status === 'Accepted').length;

    setDailyStats({
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
    });
  }, [orders]);

  // Function to handle "Change Status" button click
  const handleChangeStatus = (order) => {
    setSelectedOrder(order); // Set the selected order
    setNewStatus(order.status); // Set the current status as the default value
    setStatusDialog(true); // Open the status change dialog
  };

  // Function to show notification for new orders
  const showNewOrderAlert = (orderData) => {
    Swal.fire({
      title: 'New Order Request!',
      text: `New order placed to the system.}`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Accept',
      cancelButtonText: 'Review Details',
      confirmButtonColor: '#3ACA82',
    }).then((result) => {
      if (result.isConfirmed) {
        handleAcceptOrder(orderData);
      } else {
        // Optionally select or highlight this order in the table
      }
    });
  };

  // Function to handle accepting orders directly from notification
  const handleAcceptOrder = (orderData) => {
    // Broadcast status update via WebSocket
    const socket = new WebSocket('ws://localhost:5000/orders');
    socket.onopen = () => {
      socket.send(JSON.stringify({
        type: 'order_status_update',
        orderId: orderData.orderId || orderData.order_id,
        status: 'Accepted'
      }));

      // Update in database
      apiService.updateOrderStatus(orderData.orderId || orderData.order_id, 'Accepted')
        .then(() => {
          setNotification({ 
            open: true, 
            message: `Order #${orderData.orderId || orderData.order_id} accepted!`, 
            severity: 'success' 
          });
        })
        .catch(error => {
          console.error('Error accepting order:', error);
          setNotification({ 
            open: true, 
            message: 'Failed to update order status', 
            severity: 'error' 
          });
        });

      socket.close();
    };
  };

  // Connect to Socket.IO and fetch orders on mount
  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on('orderCreated', (order) => {
      setOrders(prev => {
        if (prev.some(o => o.order_id === order.order_id)) return prev; // Prevent duplicate
        return [order, ...prev];
      });
      setNotification({ open: true, message: `New order #${order.order_id} placed!`, severity: 'info' });
      showNewOrderAlert(order); // <-- Show popup immediately when order is created
    });

    socket.on('orderUpdated', (order) => {
      setOrders(prev => prev.map(o => o.order_id === order.order_id ? order : o));
      setNotification({ open: true, message: `Order #${order.order_id} updated!`, severity: 'success' });
    });

    // Initial fetch using apiService
    fetchOrders();

    return () => socket.disconnect();
  }, []);

  // Connect to WebSocket for real-time updates
  useEffect(() => {
    const socket = new WebSocket('ws://localhost:5000/orders'); // Replace with your backend WebSocket URL

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'new_order') {
        showNewOrderAlert(data.order);
      }
    };

    return () => socket.close();
  }, []);

  useEffect(() => {
    // Socket.IO for backend events
    const socketIO = io(SOCKET_URL);
  
    socketIO.on('orderCreated', (order) => {
      setOrders(prev => [order, ...prev]);
      setNotification({ open: true, message: `New order #${order.order_id} placed!`, severity: 'info' });
      // Only show alert for pending orders
      if (order.status === 'Pending') showNewOrderAlert(order);
    });
  
    socketIO.on('orderUpdated', (order) => {
      setOrders(prev => prev.map(o => o.order_id === order.order_id ? order : o));
      setNotification({ open: true, message: `Order #${order.order_id} updated!`, severity: 'success' });
    });
  
    // WebSocket for custom events (new order requests, status updates)
    const ws = new WebSocket('ws://localhost:5000/orders');
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'new_order_request') {
        showNewOrderAlert(data);
        fetchOrders();
      } else if (data.type === 'order_status_update') {
        setOrders(prev => prev.map(order => 
          order.order_id === data.orderId ? {...order, status: data.status} : order
        ));
      }
    };
  
    // Initial fetch using apiService
    fetchOrders();
  
    return () => {
      socketIO.disconnect();
      ws.close();
    };
  }, []);

  useEffect(() => {
    fetch('http://localhost:5000/api/availability')
      .then(res => res.json())
      .then(data => setAvailability(data.availability));
    const socket = io(SOCKET_URL);
    socketRef.current = socket;
    socket.on('availabilityChanged', data => setAvailability(data.availability));
    return () => socket.disconnect();
  }, []);

  const handleSetAvailability = async (mode) => {
    const token = localStorage.getItem('token');
    await fetch('http://localhost:5000/api/availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ mode })
    });
    // No need to set state here, will update via socket
  };
  const fetchOrders = async () => {
    try {
      const response = await apiService.getAllOrdersWithDetails();
      console.log('Fetched orders with details:', response);
      
      // Add this debug to check if notes and menu items are included in the API response
      if (response.orders && response.orders.length > 0) {
        console.log('Sample order note:', response.orders[0].note);
        console.log('Sample order menu items:', response.orders[0].menuItems);
      }
      
      setOrders(response.orders);
    } catch (error) {
      console.error('Error fetching orders with details:', error);
      // Fallback to the old method if the new endpoint fails
      try {
        const fallbackResponse = await apiService.getAllOrders();
        console.log('Fallback to basic orders:', fallbackResponse);
        setOrders(fallbackResponse.orders);
      } catch (fallbackError) {
        setNotification({ open: true, message: 'Failed to fetch orders', severity: 'error' });
      }
    }
  };

  const handleStatusUpdate = async () => {
    try {
      await apiService.updateOrderStatus(selectedOrder.order_id, newStatus);

      // Broadcast status update via WebSocket
      const socket = new WebSocket('ws://localhost:5000/orders');
      socket.onopen = () => {
        socket.send(JSON.stringify({
          type: 'order_status_update',
          orderId: selectedOrder.order_id,
          status: newStatus
        }));

        // NEW: If cancelled, emit a cancellation reason
        if (newStatus === 'Cancelled') {
          socket.send(JSON.stringify({
            type: 'order_cancelled',
            orderId: selectedOrder.order_id,
            reason: 'Order was cancelled due to staff being busy. Sorry for the inconvenience.'
          }));
        }

        socket.close();
      };

      setStatusDialog(false);
      setSelectedOrder(null);
      setNotification({ 
        open: true, 
        message: `Order status updated to ${newStatus}!`, 
        severity: 'success' 
      });
    } catch (error) {
      console.error('Error updating status:', error);
      setNotification({ 
        open: true, 
        message: 'Failed to update status', 
        severity: 'error' 
      });
    }
  };

  const handleDownloadReport = async () => {
    try {
      const token = localStorage.getItem('token');
      // Create a link to download the PDF
      const link = document.createElement('a');
      link.href = `http://localhost:5000/api/orders/report?token=${token}`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setNotification({ open: true, message: 'Generating report...', severity: 'info' });
    } catch (error) {
      setNotification({ open: true, message: 'Failed to download report', severity: 'error' });
    }
  };

  const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
  const todayOrders = orders.filter(order => order.order_date.startsWith(today));

  // Before rendering, filter out duplicate orders by order_id
  const uniqueOrders = todayOrders.filter((order, index, self) =>
    index === self.findIndex((o) => o.order_id === order.order_id)
  );

  // Add new function to handle opening the note popup
  const handleOpenNotePopup = (note, orderId) => {
    setNotePopup({
      open: true,
      note,
      orderId
    });
  };

  // Add function to close the note popup
  const handleCloseNotePopup = () => {
    setNotePopup({
      open: false,
      note: '',
      orderId: null
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', minHeight: '100vh', position: 'relative', background: theme.palette.background.default }}>
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
        <Box component="main" sx={{ flexGrow: 1, backgroundColor: '#f5f7fa', p: { xs: 2, sm: 3 }, width: '100%' }}>
          {/* Remove the "Show Menu" button */}
          <StyledContainer maxWidth="lg">
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mb: 4 }}>
              <Button
                variant={availability === 'Accepting' ? 'contained' : 'outlined'}
                color="success"
                size="large"
                sx={{ px: 6, py: 2, fontSize: 22, fontWeight: 700 }}
                onClick={() => handleSetAvailability('Accepting')}
              >
                Accepting
              </Button>
              <Button
                variant={availability === 'Busy' ? 'contained' : 'outlined'}
                color="error"
                size="large"
                sx={{ px: 6, py: 2, fontSize: 22, fontWeight: 700 }}
                onClick={() => handleSetAvailability('Busy')}
              >
                Busy
              </Button>
            </Box>
            <PageHeader>
              <DashboardIcon />
              <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' } }}>
                Staff Dashboard
              </Typography>
            </PageHeader>
            
            {/* Daily Stats Cards */}
            <ResponsiveGrid container spacing={3} sx={{ mb: 4 }}>
              {/* Total Orders */}
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Total Orders (Today)
                    </Typography>
                    <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
                      {dailyStats.totalOrders}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Pending Orders */}
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Pending Orders (Today)
                    </Typography>
                    <Typography variant="h5" component="div" sx={{ fontWeight: 600, color: theme.palette.status.pending }}>
                      {dailyStats.pendingOrders}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Completed Orders */}
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Completed Orders (Today)
                    </Typography>
                    <Typography variant="h5" component="div" sx={{ fontWeight: 600, color: theme.palette.status.completed }}>
                      {dailyStats.completedOrders}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Cancelled Orders */}
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Cancelled Orders (Today)
                    </Typography>
                    <Typography variant="h5" component="div" sx={{ fontWeight: 600, color: theme.palette.status.cancelled }}>
                      {dailyStats.cancelledOrders}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </ResponsiveGrid>
            
            <Paper sx={{ p: { xs: 2, sm: 3 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, sm: 0 } }}>
                  <ReceiptLongIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                  <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.15rem' } }}>All Orders</Typography>
                </Box>
                
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadReport}
                  sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}
                >
                  Download Report
                </Button>
              </Box>
              
              <Divider sx={{ mb: 2 }} />
                <ResponsiveTableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Order ID</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Customer/Staff</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Details</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Note</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {uniqueOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                          <Typography color="textSecondary">No orders available</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      uniqueOrders.map(order => (
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
                          <TableCell>
                            {order.menuItems && order.menuItems.length > 0 ? (
                              <Box sx={{ maxWidth: 300 }}>
                                <Typography variant="body2" fontWeight={600} mb={0.5}>
                                  Menu Items:
                                </Typography>
                                <Box 
                                  sx={{ 
                                    display: 'flex', 
                                    flexWrap: 'wrap', 
                                    gap: 0.5,
                                    maxHeight: '100px',
                                    overflowY: 'auto',
                                    p: 1,
                                    border: '1px solid #e0e0e0',
                                    borderRadius: 1,
                                    backgroundColor: '#f9f9f9'
                                  }}
                                >
                                  {order.menuItems.map((item, idx) => (
                                    <Chip
                                      key={idx}
                                      label={`${item.name} x${item.quantity}`}
                                      size="small"
                                      sx={{ 
                                        fontSize: '0.7rem',
                                        backgroundColor: '#3ACA82',
                                        color: 'white',
                                        fontWeight: 500,
                                        '& .MuiChip-label': { px: 1 }
                                      }}
                                    />
                                  ))}
                                </Box>
                              </Box>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                No details available
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '1rem', color: theme.palette.primary.main }}>
                            {formatCurrency(order.total_amount)}
                          </TableCell>
                          <TableCell> {/* Note cell */}
                            {order.note ? (
                              <Button
                                variant="text"
                                onClick={() => handleOpenNotePopup(order.note, order.order_id)}
                                sx={{ 
                                  p: 1, 
                                  bgcolor: 'rgba(58, 202, 130, 0.08)', 
                                  borderRadius: 1,
                                  maxWidth: 150,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  justifyContent: 'flex-start',
                                  textTransform: 'none',
                                  fontWeight: 'normal',
                                  '&:hover': {
                                    bgcolor: 'rgba(58, 202, 130, 0.15)',
                                  }
                                }}
                              >
                                {order.note}
                              </Button>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                No note
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <ActionButton 
                              variant="outlined" 
                              size="small" 
                              startIcon={<EditIcon />}
                              onClick={() => handleChangeStatus(order)}
                              sx={{ fontSize: { xs: '0.7rem', sm: '0.9rem' } }}
                            >
                              Change Status
                            </ActionButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </ResponsiveTableContainer>
            </Paper>

            {/* Status Change Dialog */}
            <Dialog 
              open={statusDialog} 
              onClose={() => setStatusDialog(false)}
              PaperProps={{
                sx: {
                  borderRadius: 2,
                  width: { xs: '90%', sm: '400px' },
                  maxWidth: '100%'
                }
              }}
            >
              <DialogTitle sx={{ 
                borderBottom: '1px solid #e0e0e0',
                fontWeight: 600
              }}>
                Change Order Status
              </DialogTitle>              <DialogContent sx={{ pt: 3, pb: 1 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
                  Order #{selectedOrder?.order_id}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  {selectedOrder && new Date(selectedOrder.order_date).toLocaleString()}
                </Typography>
                
                {/* Order menu items - enhanced visibility */}
                {selectedOrder?.menuItems && selectedOrder.menuItems.length > 0 && (
                  <Box sx={{ 
                    mt: 2, 
                    p: 2, 
                    bgcolor: '#f5f5f5', 
                    borderRadius: 2,
                    border: '1px solid #e0e0e0',
                    mb: 3
                  }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
                      Order Items:
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {selectedOrder.menuItems.map((item, idx) => (
                        <Box key={idx} sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          p: 1,
                          borderBottom: idx < selectedOrder.menuItems.length - 1 ? '1px solid #e0e0e0' : 'none'
                        }}>
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {item.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {item.description ? item.description.substring(0, 50) + (item.description.length > 50 ? '...' : '') : 'No description'}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              x{item.quantity}
                            </Typography>
                            <Typography variant="body2" sx={{ color: theme.palette.primary.main, fontWeight: 500 }}>
                              {formatCurrency(item.price)}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                    <Box sx={{ 
                      mt: 2, 
                      pt: 1, 
                      borderTop: '2px solid #e0e0e0', 
                      display: 'flex', 
                      justifyContent: 'flex-end',
                      alignItems: 'center'
                    }}>
                      <Typography variant="subtitle1" sx={{ mr: 1 }}>
                        Total:
                      </Typography>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 600, 
                        color: theme.palette.primary.main 
                      }}>
                        {formatCurrency(selectedOrder.total_amount)}
                      </Typography>
                    </Box>
                  </Box>
                )}
                
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

                {/* Order note - enhanced visibility */}
                {selectedOrder?.note && (
                  <Box sx={{ 
                    mt: 3, 
                    p: 2, 
                    bgcolor: 'rgba(58, 202, 130, 0.1)', 
                    borderRadius: 2,
                    border: '2px solid rgba(58, 202, 130, 0.5)',
                    boxShadow: '0 2px 8px rgba(58, 202, 130, 0.15)'
                  }}>
                    <Typography variant="subtitle1" sx={{ 
                      fontWeight: 700, 
                      mb: 1,
                      color: '#2a8e5d',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <span style={{ 
                        display: 'inline-block',
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#3ACA82',
                        borderRadius: '50%',
                        marginRight: '8px'
                      }}></span>
                      Customer Note:
                    </Typography>
                    <Typography variant="body1" sx={{ 
                      fontWeight: 500,
                      fontSize: '1.05rem',
                      color: '#333'
                    }}>
                      {selectedOrder.note}
                    </Typography>
                  </Box>
                )}
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

            {/* Note Popup Dialog */}
            <Dialog
              open={notePopup.open}
              onClose={handleCloseNotePopup}
              PaperProps={{
                sx: {
                  borderRadius: 2,
                  width: { xs: '90%', sm: '500px' },
                  maxWidth: '100%',
                  overflow: 'hidden'
                }
              }}
            >
              <Box sx={{ 
                bgcolor: '#3ACA82', 
                color: 'white',
                py: 2,
                px: 3,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Customer Note - Order #{notePopup.orderId}
                </Typography>
                <Button 
                  onClick={handleCloseNotePopup}
                  sx={{ color: 'white', minWidth: 'auto', p: 1 }}
                >
                  ✕
                </Button>
              </Box>
              <Box sx={{ 
                p: 3,
                backgroundColor: 'rgba(58, 202, 130, 0.05)',
                borderLeft: '4px solid #3ACA82',
                m: 3,
                borderRadius: 1,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
              }}>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontSize: '1.1rem',
                    fontWeight: 500,
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {notePopup.note}
                </Typography>
              </Box>
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #e0e0e0' }}>
                <Button
                  variant="contained"
                  onClick={handleCloseNotePopup}
                  sx={{ minWidth: 100 }}
                >
                  Close
                </Button>
              </Box>
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
                  fontSize: { xs: '0.8rem', sm: '1rem' },
                }}
              >
                {notification.message}
              </Alert>
            </Snackbar>
          </StyledContainer>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
