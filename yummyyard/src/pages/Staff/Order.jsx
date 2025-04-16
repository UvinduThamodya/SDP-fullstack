// import React, { useState, useEffect } from 'react';
// import { Box, Typography, Container, Grid, Paper, Button, Tabs, Tab, Snackbar, Alert, IconButton, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Divider } from '@mui/material';
// import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
// import CreditCardIcon from '@mui/icons-material/CreditCard';
// import SidebarStaff from '../../components/SidebarStaff';
// import MenuService from '../../services/menuService';
// import apiService from '../../services/api';
// import { Elements } from '@stripe/react-stripe-js';
// import { loadStripe } from '@stripe/stripe-js';
// import StripePayment from '../../components/StripePayment';

// const stripePromise = loadStripe('pk_test_51RBXHE2eTzT1rj33KqvHxzVBUeBpoDrtgtrs0rV8hvprNBZv4ny1YmaNH0mpB21AVCmf7sBeDmVvp1sYUn7YP7kX00GYfePn5k');

// const formatCurrency = (price, currency = 'LKR', locale = 'en-LK') =>
//   new Intl.NumberFormat(locale, { style: 'currency', currency }).format(price);

// const Order = () => {
//   const [menuItems, setMenuItems] = useState([]);
//   const [selectedCategory, setSelectedCategory] = useState('Main-Dishes');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
//   const [order, setOrder] = useState({}); // To track quantities of items in the order
//   const [openCheckoutDialog, setOpenCheckoutDialog] = useState(false);
//   const [openCashDialog, setOpenCashDialog] = useState(false);
//   const [amountGiven, setAmountGiven] = useState('');
//   const [balance, setBalance] = useState(0);
//   const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
//   const [paymentType, setPaymentType] = useState('');

//   useEffect(() => {
//     const fetchMenuItems = async () => {
//       try {
//         setLoading(true);
//         const items = await MenuService.getMenuItems();
//         setMenuItems(items);
//       } catch (error) {
//         setError('Failed to fetch menu items');
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchMenuItems();
//   }, []);

//   const handleCategoryChange = (event, newCategory) => {
//     setSelectedCategory(newCategory);
//   };

//   const handleQuantityChange = (itemId, quantity) => {
//     setOrder((prevOrder) => ({
//       ...prevOrder,
//       [itemId]: Math.max(0, quantity), // Ensure quantity is not negative
//     }));
//   };

//   const handleCheckout = () => {
//     const orderItems = Object.entries(order)
//       .filter(([_, quantity]) => quantity > 0)
//       .map(([itemId, quantity]) => {
//         const item = menuItems.find((menuItem) => menuItem.item_id === parseInt(itemId));
//         return { ...item, quantity };
//       });

//     if (orderItems.length === 0) {
//       setNotification({ open: true, message: 'No items in the order!', severity: 'warning' });
//       return;
//     }

//     setOpenCheckoutDialog(true); // Open the dialog
//   };

//   const handlePaymentOption = (option) => {
//     console.log(`Selected payment option: ${option}`);
//     setOpenCheckoutDialog(false); // Close the dialog
//     if (option === 'Cash') {
//       handleCashPayment();
//     } else if (option === 'Card') {
//       setPaymentType('card');
//       setPaymentDialogOpen(true);
//     }
//   };

//   const handleCashPayment = () => {
//     setOpenCheckoutDialog(false); // Close the checkout dialog
//     setOpenCashDialog(true); // Open the cash payment dialog
//   };

//   const handleCalculateBalance = () => {
//     const totalAmount = Object.entries(order)
//       .filter(([_, quantity]) => quantity > 0)
//       .reduce((total, [itemId, quantity]) => {
//         const item = menuItems.find((menuItem) => menuItem.item_id === parseInt(itemId));
//         return total + item.price * quantity;
//       }, 0);

//     const balanceAmount = parseFloat(amountGiven) - totalAmount;
//     setBalance(balanceAmount);
//   };

//   const handlePayment = async (paymentData) => {
//     try {
//       // Prepare order items with price (needed for backend subtotal)
//       const orderItems = Object.entries(order)
//         .filter(([_, quantity]) => quantity > 0)
//         .map(([itemId, quantity]) => {
//           const item = menuItems.find((menuItem) => menuItem.item_id === parseInt(itemId));
//           return { item_id: item.item_id, quantity, price: item.price };
//         });

//       const orderData = {
//         items: orderItems,
//         payment: paymentData,
//       };

//       // Send to backend (JWT token is sent in apiService)
//       await apiService.createOrder(orderData);

//       // Show success notification
//       setNotification({ open: true, message: 'Order placed successfully!', severity: 'success' });

//       // Clear the order and close dialogs
//       setOrder({});
//       setOpenCashDialog(false);
//       setPaymentDialogOpen(false);
//     } catch (error) {
//       // Show error notification
//       setNotification({ open: true, message: 'Payment failed. Please try again.', severity: 'error' });
//     }
//   };

//   const filteredItems = menuItems.filter((item) => item.category === selectedCategory);
//   const displayItems = loading || filteredItems.length === 0 ? [] : filteredItems;

//   const totalAmount = Object.entries(order)
//     .filter(([_, quantity]) => quantity > 0)
//     .reduce((total, [itemId, quantity]) => {
//       const item = menuItems.find((menuItem) => menuItem.item_id === parseInt(itemId));
//       return total + item.price * quantity;
//     }, 0);

//   return (
//     <Box sx={{ display: 'flex', backgroundColor: '#F2F2F2' }}>
//       <SidebarStaff />
//       <Container maxWidth="lg" sx={{ pt: 5, pb: 8 }}>
//         <Box sx={{ textAlign: 'center', mb: 4 }}>
//           <Typography variant="subtitle1" sx={{ mb: 1, color: '#8a6d3b' }}>
//             FOOD MENU
//           </Typography>
          
//           <Button
//             variant="contained"
//             color="primary"
//             sx={{ mt: 3, mb: 2 }}
//             onClick={handleCheckout}
//           >
//             Checkout
            
//           </Button>
//         </Box>

//         {/* <Box sx={{ width: '100%', bgcolor: 'background.paper', mb: 5 }}>
//           <Tabs value={selectedCategory} onChange={handleCategoryChange} centered>
//             <Tab label="Main Dishes" value="Main-Dishes" />
//             <Tab label="Sea Food" value="Sea-Food" />
//             <Tab label="Desserts" value="Desserts" />
//             <Tab label="Beverage" value="Beverage" />
//           </Tabs>
//         </Box> */}

//         {error && (
//           <Alert severity="error" sx={{ mb: 3 }}>
//             {error}
//           </Alert>
//         )}

//         <Grid container spacing={3}>
//           {displayItems.map((item) => (
//             <Grid item xs={12} sm={6} md={4} key={item.item_id}>
//               <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
//                 <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
//                   {item.name}
//                 </Typography>
//                 <Typography variant="body1" sx={{ mb: 2 }}>
//                   {item.description}
//                 </Typography>
//                 <Typography variant="h5" sx={{ mb: 2 }}>
//                   {formatCurrency(item.price, 'LKR', 'en-LK')}
//                 </Typography>
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                   <IconButton
//                     onClick={() => handleQuantityChange(item.item_id, (order[item.item_id] || 0) - 1)}
//                     color="primary"
//                   >
//                     -
//                   </IconButton>
//                   <TextField
//                     value={order[item.item_id] || 0}
//                     onChange={(e) => handleQuantityChange(item.item_id, parseInt(e.target.value) || 0)}
//                     type="number"
//                     inputProps={{ min: 0 }}
//                     sx={{ width: 60, textAlign: 'center' }}
//                   />
//                   <IconButton
//                     onClick={() => handleQuantityChange(item.item_id, (order[item.item_id] || 0) + 1)}
//                     color="primary"
//                   >
//                     +
//                   </IconButton>
//                 </Box>
//               </Paper>
//             </Grid>
//           ))}
//         </Grid>

//         <Snackbar
//           open={notification.open}
//           autoHideDuration={4000}
//           onClose={() => setNotification({ ...notification, open: false })}
//         >
//           <Alert severity={notification.severity} sx={{ width: '100%' }}>
//             {notification.message}
//           </Alert>
//         </Snackbar>

//         <Dialog open={openCheckoutDialog} onClose={() => setOpenCheckoutDialog(false)} maxWidth="sm" fullWidth>
//           <DialogTitle>Order Summary</DialogTitle>
//           <DialogContent>
//             <Box sx={{ mb: 2 }}>
//               {Object.entries(order)
//                 .filter(([_, quantity]) => quantity > 0)
//                 .map(([itemId, quantity]) => {
//                   const item = menuItems.find((menuItem) => menuItem.item_id === parseInt(itemId));
//                   return (
//                     <Box
//                       key={itemId}
//                       sx={{
//                         display: 'flex',
//                         justifyContent: 'space-between',
//                         alignItems: 'center',
//                         mb: 2,
//                         p: 2,
//                         border: '1px solid #ddd',
//                         borderRadius: 1,
//                       }}
//                     >
//                       <Box>
//                         <Typography variant="h6">{item.name}</Typography>
//                         <Typography variant="body2" color="text.secondary">
//                           Price: {formatCurrency(item.price, 'LKR', 'en-LK')}
//                         </Typography>
//                       </Box>
//                       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                         <IconButton
//                           onClick={() => handleQuantityChange(itemId, quantity - 1)}
//                           color="primary"
//                         >
//                           -
//                         </IconButton>
//                         <TextField
//                           value={quantity}
//                           onChange={(e) => handleQuantityChange(itemId, parseInt(e.target.value) || 0)}
//                           type="number"
//                           inputProps={{ min: 0 }}
//                           sx={{ width: 60, textAlign: 'center' }}
//                         />
//                         <IconButton
//                           onClick={() => handleQuantityChange(itemId, quantity + 1)}
//                           color="primary"
//                         >
//                           +
//                         </IconButton>
//                       </Box>
//                       <Button
//                         variant="outlined"
//                         color="error"
//                         onClick={() => {
//                           setOrder((prevOrder) => {
//                             const updatedOrder = { ...prevOrder };
//                             delete updatedOrder[itemId];
//                             return updatedOrder;
//                           });
//                         }}
//                       >
//                         Remove
//                       </Button>
//                     </Box>
//                   );
//                 })}
//             </Box>
//             <Divider sx={{ mb: 2 }} />
//             <Typography variant="h6" sx={{ textAlign: 'right', mb: 2 }}>
//               Total: {formatCurrency(
//                 Object.entries(order)
//                   .filter(([_, quantity]) => quantity > 0)
//                   .reduce((total, [itemId, quantity]) => {
//                     const item = menuItems.find((menuItem) => menuItem.item_id === parseInt(itemId));
//                     return total + item.price * quantity;
//                   }, 0),
//                 'LKR',
//                 'en-LK'
//               )}
//             </Typography>
//             <Typography variant="h6" sx={{ textAlign: 'center', mb: 2 }}>
//               Choose Payment Method
//             </Typography>
//             <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2 }}>
//               <Button
//                 variant="contained"
//                 color="success"
//                 startIcon={<AttachMoneyIcon />}
//                 onClick={() => handlePaymentOption('Cash')}
//                 sx={{ px: 4 }}
//               >
//                 Cash
//               </Button>
//               <Button
//                 variant="contained"
//                 color="primary"
//                 startIcon={<CreditCardIcon />}
//                 onClick={() => handlePaymentOption('Card')}
//                 sx={{ px: 4 }}
//               >
//                 Card Payment
//               </Button>
//             </Box>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setOpenCheckoutDialog(false)} color="error">
//               Cancel
//             </Button>
//           </DialogActions>
//         </Dialog>

//         <Dialog open={openCashDialog} onClose={() => setOpenCashDialog(false)} maxWidth="sm" fullWidth>
//           <DialogTitle>Cash Payment</DialogTitle>
//           <DialogContent>
//             <Box sx={{ mb: 2 }}>
//               <Typography variant="h6" sx={{ mb: 2 }}>
//                 Total Amount: {formatCurrency(totalAmount, 'LKR', 'en-LK')}
//               </Typography>
//               <TextField
//                 label="Amount Given"
//                 type="number"
//                 value={amountGiven}
//                 onChange={(e) => setAmountGiven(e.target.value)}
//                 fullWidth
//                 sx={{ mb: 2 }}
//                 inputProps={{ min: 0 }} // Ensure only positive numbers can be entered
//               />
//               <Typography variant="h6" sx={{ mt: 2 }}>
//                 Balance: {balance >= 0 ? formatCurrency(balance, 'LKR', 'en-LK') : 'Insufficient Amount'}
//               </Typography>
//             </Box>
//           </DialogContent>
//           <DialogActions>
//             {/* Show Confirm Order button only if balance is calculated and valid */}
//             {balance >= 0 && amountGiven !== '' && (
//               <Button
//                 variant="contained"
//                 color="success"
//                 onClick={() => handlePayment({
//                   method: 'cash',
//                   amount: totalAmount,
//                   cashReceived: parseFloat(amountGiven),
//                   change: parseFloat(amountGiven) - totalAmount,
//                 })}
//                 sx={{ mb: 2 }}
//               >
//                 Confirm Order
//               </Button>
//             )}
//             <Button onClick={() => setOpenCashDialog(false)} color="error">
//               Close
//             </Button>
//           </DialogActions>
//         </Dialog>

//         <Dialog open={paymentType === 'card' && paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)} maxWidth="sm" fullWidth>
//           <DialogTitle>Card Payment</DialogTitle>
//           <DialogContent>
//             <Elements stripe={stripePromise}>
//               <StripePayment
//                 amount={totalAmount}
//                 onSuccess={(paymentIntent) => handlePayment({
//                   method: 'card',
//                   amount: totalAmount,
//                   stripeToken: paymentIntent.id, // Pass the Stripe payment intent ID
//                 })}
//                 onError={() => setNotification({ open: true, message: 'Card payment failed.', severity: 'error' })}
//               />
//             </Elements>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setPaymentDialogOpen(false)} color="error">
//               Cancel
//             </Button>
//           </DialogActions>
//         </Dialog>
//       </Container>
//     </Box>
//   );
// };

// export default Order;

import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Grid, Paper, Button, Snackbar, Alert, IconButton, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Divider } from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import SidebarStaff from '../../components/SidebarStaff';
import MenuService from '../../services/menuService';
import apiService from '../../services/api';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import StripePayment from '../../components/StripePayment';

const stripePromise = loadStripe('pk_test_51RBXHE2eTzT1rj33KqvHxzVBUeBpoDrtgtrs0rV8hvprNBZv4ny1YmaNH0mpB21AVCmf7sBeDmVvp1sYUn7YP7kX00GYfePn5k');

const formatCurrency = (price, currency = 'LKR', locale = 'en-LK') =>
  new Intl.NumberFormat(locale, { style: 'currency', currency }).format(price);

const Order = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Main-Dishes');
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

  // Automatic balance calculation for cash payments
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

  const handleQuantityChange = (itemId, quantity) => {
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
    <Box sx={{ display: 'flex', backgroundColor: '#F2F2F2' }}>
      <SidebarStaff />
      <Container maxWidth="lg" sx={{ pt: 5, pb: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, color: '#8a6d3b' }}>
            FOOD MENU
          </Typography>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 3, mb: 2 }}
            onClick={handleCheckout}
          >
            Checkout
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {displayItems.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.item_id}>
              <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {item.name}
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {item.description}
                </Typography>
                <Typography variant="h5" sx={{ mb: 2 }}>
                  {formatCurrency(item.price, 'LKR', 'en-LK')}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton
                    onClick={() => handleQuantityChange(item.item_id, (order[item.item_id] || 0) - 1)}
                    color="primary"
                  >
                    -
                  </IconButton>
                  <TextField
                    value={order[item.item_id] || 0}
                    onChange={(e) => handleQuantityChange(item.item_id, parseInt(e.target.value) || 0)}
                    type="number"
                    inputProps={{ min: 0 }}
                    sx={{ width: 60, textAlign: 'center' }}
                  />
                  <IconButton
                    onClick={() => handleQuantityChange(item.item_id, (order[item.item_id] || 0) + 1)}
                    color="primary"
                  >
                    +
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
        >
          <Alert severity={notification.severity} sx={{ width: '100%' }}>
            {notification.message}
          </Alert>
        </Snackbar>

        <Dialog open={openCheckoutDialog} onClose={() => setOpenCheckoutDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Order Summary</DialogTitle>
          <DialogContent>
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
                        border: '1px solid #ddd',
                        borderRadius: 1,
                      }}
                    >
                      <Box>
                        <Typography variant="h6">{item.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Price: {formatCurrency(item.price, 'LKR', 'en-LK')}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton
                          onClick={() => handleQuantityChange(itemId, quantity - 1)}
                          color="primary"
                        >
                          -
                        </IconButton>
                        <TextField
                          value={quantity}
                          onChange={(e) => handleQuantityChange(itemId, parseInt(e.target.value) || 0)}
                          type="number"
                          inputProps={{ min: 0 }}
                          sx={{ width: 60, textAlign: 'center' }}
                        />
                        <IconButton
                          onClick={() => handleQuantityChange(itemId, quantity + 1)}
                          color="primary"
                        >
                          +
                        </IconButton>
                      </Box>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => {
                          setOrder((prevOrder) => {
                            const updatedOrder = { ...prevOrder };
                            delete updatedOrder[itemId];
                            return updatedOrder;
                          });
                        }}
                      >
                        Remove
                      </Button>
                    </Box>
                  );
                })}
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="h6" sx={{ textAlign: 'right', mb: 2 }}>
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
                sx={{ px: 4 }}
              >
                Cash
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<CreditCardIcon />}
                onClick={() => handlePaymentOption('Card')}
                sx={{ px: 4 }}
              >
                Card Payment
              </Button>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCheckoutDialog(false)} color="error">
              Cancel
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={openCashDialog} onClose={() => setOpenCashDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Cash Payment</DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Total Amount: {formatCurrency(totalAmount, 'LKR', 'en-LK')}
              </Typography>
              <TextField
                label="Amount Given"
                type="number"
                value={amountGiven}
                onChange={(e) => setAmountGiven(e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
                inputProps={{ min: 0 }}
              />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Balance: {balance >= 0 ? formatCurrency(balance, 'LKR', 'en-LK') : 'Insufficient Amount'}
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              color="success"
              onClick={() => handlePayment({
                method: 'cash',
                amount: totalAmount,
                cashReceived: parseFloat(amountGiven),
                change: parseFloat(amountGiven) - totalAmount,
              })}
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

        <Dialog open={paymentType === 'card' && paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Card Payment</DialogTitle>
          <DialogContent>
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
          <DialogActions>
            <Button onClick={() => setPaymentDialogOpen(false)} color="error">
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Order;
