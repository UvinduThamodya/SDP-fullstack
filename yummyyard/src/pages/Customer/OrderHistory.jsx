// // pages/Customer/OrderHistory.jsx
// import React, { useState, useEffect } from 'react';
// import {
//   Container, Box, Typography, Paper, Table, TableBody, TableCell,
//   TableContainer, TableHead, TableRow, Button, CircularProgress,
//   Dialog, DialogTitle, DialogContent, DialogActions, Chip
// } from '@mui/material';
// import { styled } from '@mui/material/styles';
// import ReceiptIcon from '@mui/icons-material/Receipt';
// import InfoIcon from '@mui/icons-material/Info';
// import Navbar from '../../components/Navbar';

// const formatCurrency = (price, currency = 'LKR', locale = 'en-LK') => {
//   return new Intl.NumberFormat(locale, {
//     style: 'currency',
//     currency,
//   }).format(price);
// };

// const StatusChip = styled(Chip)(({ theme, status }) => ({
//   backgroundColor: 
//     status === 'Completed' ? theme.palette.success.light :
//     status === 'Pending' ? theme.palette.warning.light :
//     status === 'Preparing' ? theme.palette.info.light :
//     theme.palette.error.light,
//   color: 
//     status === 'Completed' ? theme.palette.success.dark :
//     status === 'Pending' ? theme.palette.warning.dark :
//     status === 'Preparing' ? theme.palette.info.dark :
//     theme.palette.error.dark,
// }));

// const OrderHistory = () => {
//   const [orders, setOrders] = useState([]);
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [openDialog, setOpenDialog] = useState(false);

//   useEffect(() => {
//     const fetchOrders = async () => {
//       try {
//         setLoading(true);
//         const token = localStorage.getItem('token');
//         const response = await fetch('/api/orders/history', {
//           headers: {
//             'Authorization': `Bearer ${token}`
//           }
//         });

//         if (!response.ok) {
//           throw new Error('Failed to fetch orders');
//         }

//         const data = await response.json();
//         setOrders(data);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchOrders();
//   }, []);

//   const handleViewDetails = async (orderId) => {
//     try {
//       setLoading(true);
//       const token = localStorage.getItem('token');
//       const response = await fetch(`/api/orders/${orderId}`, {
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });

//       if (!response.ok) {
//         throw new Error('Failed to fetch order details');
//       }

//       const data = await response.json();
//       setSelectedOrder(data);
//       setOpenDialog(true);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDownloadReceipt = async (orderId) => {
//   try {
//     const token = localStorage.getItem('token');
    
//     // Create a link element to download the file
//     const link = document.createElement('a');
//     link.href = `http://localhost:5000/api/orders/${orderId}/receipt?token=${token}`;
//     link.target = '_blank';
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
    
//     setNotification({
//       open: true,
//       message: 'Receipt download started',
//       severity: 'success'
//     });
//   } catch (error) {
//     console.error("Error downloading receipt:", error);
//     setNotification({
//       open: true,
//       message: `Error downloading receipt: ${error.message}`,
//       severity: 'error'
//     });
//   }
// };


//   return (
//     <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
//       <Navbar />
//       <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
//         <Container maxWidth="lg">
//           <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
//             My Order History
//           </Typography>

//           {loading && !orders.length ? (
//             <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
//               <CircularProgress />
//             </Box>
//           ) : error ? (
//             <Typography color="error">{error}</Typography>
//           ) : orders.length === 0 ? (
//             <Paper sx={{ p: 4, textAlign: 'center' }}>
//               <Typography variant="h6">You haven't placed any orders yet.</Typography>
//             </Paper>
//           ) : (
//             <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
//               <Table>
//                 <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
//                   <TableRow>
//                     <TableCell sx={{ fontWeight: 'bold' }}>Order ID</TableCell>
//                     <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
//                     <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
//                     <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
//                     <TableCell sx={{ fontWeight: 'bold' }}>Payment Method</TableCell>
//                     <TableCell sx={{ fontWeight: 'bold' }} align="center">Actions</TableCell>
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {orders.map((order) => (
//                     <TableRow key={order.order_id}>
//                       <TableCell>{order.order_id}</TableCell>
//                       <TableCell>{new Date(order.order_date).toLocaleString()}</TableCell>
//                       <TableCell>{formatCurrency(order.total_amount)}</TableCell>
//                       <TableCell>
//                         <StatusChip 
//                           label={order.status} 
//                           status={order.status} 
//                           size="small"
//                         />
//                       </TableCell>
//                       <TableCell>{order.payment_method || 'N/A'}</TableCell>
//                       <TableCell align="center">
//                         <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
//                           <Button
//                             size="small"
//                             variant="outlined"
//                             startIcon={<InfoIcon />}
//                             onClick={() => handleViewDetails(order.order_id)}
//                           >
//                             Details
//                           </Button>
//                           <Button
//                             size="small"
//                             variant="contained"
//                             color="primary"
//                             startIcon={<ReceiptIcon />}
//                             onClick={() => handleDownloadReceipt(order.order_id)}
//                           >
//                             Receipt
//                           </Button>
//                         </Box>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </TableContainer>
//           )}

//           {/* Order Details Dialog */}
//           <Dialog
//             open={openDialog}
//             onClose={() => setOpenDialog(false)}
//             maxWidth="md"
//             fullWidth
//           >
//             <DialogTitle>Order Details</DialogTitle>
//             <DialogContent dividers>
//               {selectedOrder && (
//                 <Box>
//                   <Typography variant="subtitle1" gutterBottom>
//                     <strong>Order ID:</strong> {selectedOrder.orderInfo.order_id}
//                   </Typography>
//                   <Typography variant="subtitle1" gutterBottom>
//                     <strong>Date:</strong> {new Date(selectedOrder.orderInfo.order_date).toLocaleString()}
//                   </Typography>
//                   <Typography variant="subtitle1" gutterBottom>
//                     <strong>Status:</strong> {selectedOrder.orderInfo.status}
//                   </Typography>
//                   <Typography variant="subtitle1" gutterBottom>
//                     <strong>Payment Method:</strong> {selectedOrder.orderInfo.payment_method || 'N/A'}
//                   </Typography>
                  
//                   <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
//                     Order Items
//                   </Typography>
//                   <TableContainer component={Paper} variant="outlined">
//                     <Table size="small">
//                       <TableHead>
//                         <TableRow>
//                           <TableCell><strong>Item</strong></TableCell>
//                           <TableCell><strong>Category</strong></TableCell>
//                           <TableCell align="right"><strong>Price</strong></TableCell>
//                           <TableCell align="right"><strong>Quantity</strong></TableCell>
//                           <TableCell align="right"><strong>Subtotal</strong></TableCell>
//                         </TableRow>
//                       </TableHead>
//                       <TableBody>
//                         {selectedOrder.items.map((item) => (
//                           <TableRow key={item.order_item_id}>
//                             <TableCell>{item.name}</TableCell>
//                             <TableCell>{item.category}</TableCell>
//                             <TableCell align="right">{formatCurrency(item.price)}</TableCell>
//                             <TableCell align="right">{item.quantity}</TableCell>
//                             <TableCell align="right">{formatCurrency(item.subtotal)}</TableCell>
//                           </TableRow>
//                         ))}
//                         <TableRow>
//                           <TableCell colSpan={4} align="right" sx={{ fontWeight: 'bold' }}>
//                             Total:
//                           </TableCell>
//                           <TableCell align="right" sx={{ fontWeight: 'bold' }}>
//                             {formatCurrency(selectedOrder.orderInfo.total_amount)}
//                           </TableCell>
//                         </TableRow>
//                       </TableBody>
//                     </Table>
//                   </TableContainer>
//                 </Box>
//               )}
//             </DialogContent>
//             <DialogActions>
//               <Button onClick={() => setOpenDialog(false)}>Close</Button>
//               <Button 
//                 variant="contained" 
//                 color="primary"
//                 onClick={() => handleDownloadReceipt(selectedOrder.orderInfo.order_id)}
//                 startIcon={<ReceiptIcon />}
//               >
//                 Download Receipt
//               </Button>
//             </DialogActions>
//           </Dialog>
//         </Container>
//       </Box>
//     </Box>
//   );
// };

// export default OrderHistory;

// pages/Customer/OrderHistory.jsx
import React, { useState, useEffect } from 'react';
import {
  Container, Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, Chip,
  Snackbar, Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ReceiptIcon from '@mui/icons-material/Receipt';
import InfoIcon from '@mui/icons-material/Info';
import Navbar from '../../components/Navbar';

const formatCurrency = (price, currency = 'LKR', locale = 'en-LK') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(price);
};

const StatusChip = styled(Chip)(({ theme, status }) => ({
  backgroundColor: 
    status === 'Completed' ? theme.palette.success.light :
    status === 'Pending' ? theme.palette.warning.light :
    status === 'Preparing' ? theme.palette.info.light :
    theme.palette.error.light,
  color: 
    status === 'Completed' ? theme.palette.success.dark :
    status === 'Pending' ? theme.palette.warning.dark :
    status === 'Preparing' ? theme.palette.info.dark :
    theme.palette.error.dark,
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
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
            My Order History
          </Typography>

          {loading && !orders.length ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : orders.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6">You haven't placed any orders yet.</Typography>
            </Paper>
          ) : (
            <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
              <Table>
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Order ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Payment Method</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.order_id}>
                      <TableCell>{order.order_id}</TableCell>
                      <TableCell>{new Date(order.order_date).toLocaleString()}</TableCell>
                      <TableCell>{formatCurrency(order.total_amount)}</TableCell>
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
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<InfoIcon />}
                            onClick={() => handleViewDetails(order.order_id)}
                          >
                            Details
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            startIcon={<ReceiptIcon />}
                            onClick={() => handleDownloadReceipt(order.order_id)}
                          >
                            Receipt
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Order Details Dialog */}
          <Dialog
            open={openDialog}
            onClose={() => setOpenDialog(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>Order Details</DialogTitle>
            <DialogContent dividers>
              {selectedOrder && (
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Order ID:</strong> {selectedOrder.orderInfo.order_id}
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Date:</strong> {new Date(selectedOrder.orderInfo.order_date).toLocaleString()}
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Status:</strong> {selectedOrder.orderInfo.status}
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Payment Method:</strong> {selectedOrder.orderInfo.payment_method || 'N/A'}
                  </Typography>
                  
                  <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                    Order Items
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Item</strong></TableCell>
                          <TableCell><strong>Category</strong></TableCell>
                          <TableCell align="right"><strong>Price</strong></TableCell>
                          <TableCell align="right"><strong>Quantity</strong></TableCell>
                          <TableCell align="right"><strong>Subtotal</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedOrder.items.map((item) => (
                          <TableRow key={item.order_item_id}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.category}</TableCell>
                            <TableCell align="right">{formatCurrency(item.price)}</TableCell>
                            <TableCell align="right">{item.quantity}</TableCell>
                            <TableCell align="right">{formatCurrency(item.subtotal)}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={4} align="right" sx={{ fontWeight: 'bold' }}>
                            Total:
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                            {formatCurrency(selectedOrder.orderInfo.total_amount)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Close</Button>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => handleDownloadReceipt(selectedOrder.orderInfo.order_id)}
                startIcon={<ReceiptIcon />}
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
              sx={{ width: '100%' }}
            >
              {notification.message}
            </Alert>
          </Snackbar>
        </Container>
      </Box>
    </Box>
  );
};

export default OrderHistory;
