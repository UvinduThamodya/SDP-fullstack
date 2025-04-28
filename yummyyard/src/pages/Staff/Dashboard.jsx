import React, { useState, useEffect } from 'react';
import SidebarStaff from '../../components/SidebarStaff'; // Adjust path as needed
import {
  Box, Typography, Container, Grid, Paper, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl, InputLabel, Select, MenuItem, Divider, Alert
} from '@mui/material';
import {
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Inventory as InventoryIcon,
  Receipt as ReceiptIcon,
  ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import apiService from '../../services/api'; // Adjust path as needed

// Dummy data
const topItems = [
  { id: 1, name: 'Pizza', order_count: 120, revenue: 24000 },
  { id: 2, name: 'Burger', order_count: 90, revenue: 13500 },
  { id: 3, name: 'Pasta', order_count: 70, revenue: 10500 }
];

const leastOrderedItem = { id: 4, name: 'Salad', order_count: 2, category: 'Starter', price: 500 };

const recentOrder = {
  order_id: 101,
  order_date: new Date(),
  total_amount: 2500,
  status: 'Completed',
  items: [
    { id: 1, name: 'Pizza', quantity: 1, price: 1200, subtotal: 1200 },
    { id: 2, name: 'Burger', quantity: 1, price: 800, subtotal: 800 },
    { id: 3, name: 'Juice', quantity: 1, price: 500, subtotal: 500 }
  ]
};

const allIngredients = [
  { id: 1, name: 'Tomato', unit: 'kg', unit_price: 200 },
  { id: 2, name: 'Cheese', unit: 'kg', unit_price: 1500 },
  { id: 3, name: 'Bread', unit: 'loaf', unit_price: 100 }
];

export default function AdminDashboard() {
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState('');
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [stockOrders, setStockOrders] = useState([]);
  const [notification, setNotification] = useState(null);

  const currentDate = new Date();

  useEffect(() => {
    const fetchLowStock = async () => {
      setLoading(true);
      try {
        const data = await apiService.getLowStockItems();
        setLowStockItems(data.ingredients || []);
      } catch (err) {
        setError('Failed to load low stock data.');
      } finally {
        setLoading(false);
      }
    };
    fetchLowStock();
  }, []);

  // Inventory order handlers
  const handleAddToOrder = () => {
    if (!selectedIngredient || orderQuantity <= 0) return;
    const ingredient = allIngredients.find(i => i.id === selectedIngredient);
    if (!ingredient) return;
    setStockOrders([
      ...stockOrders,
      {
        id: Date.now(),
        ingredient_id: ingredient.id,
        name: ingredient.name,
        quantity: orderQuantity,
        unit: ingredient.unit,
        unit_price: ingredient.unit_price,
        total_price: ingredient.unit_price * orderQuantity
      }
    ]);
    setSelectedIngredient('');
    setOrderQuantity(1);
  };

  const handleRemoveFromOrder = (orderId) => {
    setStockOrders(stockOrders.filter(order => order.id !== orderId));
  };

  // Dummy PDF generation (replace with real PDF logic)
  const handleDownloadReceipt = () => {
    setNotification('Receipt would be downloaded here (implement PDF logic)');
    setStockOrders([]);
    setOrderDialogOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#f5f5f5' }}>
      <SidebarStaff/>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, ml: 0 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Admin Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {format(currentDate, 'EEEE, MMMM dd, yyyy')}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<ShoppingCartIcon />}
            onClick={() => setOrderDialogOpen(true)}
          >
            Order Inventory
          </Button>
        </Box>

        {/* Low Stock Alert */}
        <Paper sx={{ p: 2, mb: 3, backgroundColor: lowStockItems.length > 0 ? '#fff8e1' : 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            {lowStockItems.length > 0 && <WarningIcon sx={{ color: 'warning.main', mr: 1 }} />}
            <Typography variant="h6">
              {lowStockItems.length > 0
                ? `Low Stock Alert: ${lowStockItems.length} items below threshold`
                : 'Inventory Status: All items in stock'}
            </Typography>
          </Box>
          {loading && <Typography>Loading...</Typography>}
          {error && <Alert severity="error">{error}</Alert>}
          {lowStockItems.length > 0 && !loading && (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Ingredient</TableCell>
                    <TableCell align="right">Current Quantity</TableCell>
                    <TableCell align="right">Threshold</TableCell>
                    <TableCell align="right">Unit</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lowStockItems.map(item => (
                    <TableRow key={item.inventory_id}>
                      <TableCell>{item.item_name}</TableCell>
                      <TableCell align="right" sx={{ color: 'error.main', fontWeight: 'bold' }}>
                        {item.quantity}
                      </TableCell>
                      <TableCell align="right">{item.threshold}</TableCell>
                      <TableCell align="right">{item.unit}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        {/* Analytics Section */}
        <Grid container spacing={3}>
          {/* Top Ordered Items */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon sx={{ color: 'success.main', mr: 1 }} />
                <Typography variant="h6">Top 3 Ordered Items</Typography>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Rank</TableCell>
                      <TableCell>Item</TableCell>
                      <TableCell align="right">Orders</TableCell>
                      <TableCell align="right">Revenue</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topItems.map((item, idx) => (
                      <TableRow key={item.id}>
                        <TableCell>#{idx + 1}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell align="right">{item.order_count}</TableCell>
                        <TableCell align="right">LKR {item.revenue.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Least Ordered Item */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingDownIcon sx={{ color: 'error.main', mr: 1 }} />
                <Typography variant="h6">Least Ordered Item</Typography>
              </Box>
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6">{leastOrderedItem.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Category: {leastOrderedItem.category}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Price: LKR {leastOrderedItem.price}
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    Orders: <strong>{leastOrderedItem.order_count}</strong>
                  </Typography>
                </CardContent>
              </Card>
            </Paper>
          </Grid>

          {/* Recent Order */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Most Recent Order by Staff
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Order #{recentOrder.order_id} - {format(recentOrder.order_date, 'MMM dd, yyyy HH:mm')}
                </Typography>
                <Typography variant="body1">
                  Total: LKR {recentOrder.total_amount.toLocaleString()}
                </Typography>
                <Typography variant="body2">
                  Status: <strong>{recentOrder.status}</strong>
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="subtitle2">Order Items:</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="right">Subtotal</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentOrder.items.map(item => (
                      <TableRow key={item.id}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">LKR {item.price.toLocaleString()}</TableCell>
                        <TableCell align="right">LKR {item.subtotal.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>

        {/* Inventory Order Dialog */}
        <Dialog
          open={orderDialogOpen}
          onClose={() => setOrderDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <InventoryIcon sx={{ mr: 1 }} />
              Order Inventory Stock
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 3, mt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="ingredient-select-label">Ingredient</InputLabel>
                    <Select
                      labelId="ingredient-select-label"
                      value={selectedIngredient}
                      label="Ingredient"
                      onChange={e => setSelectedIngredient(e.target.value)}
                    >
                      {allIngredients.map(ingredient => (
                        <MenuItem key={ingredient.id} value={ingredient.id}>
                          {ingredient.name} ({ingredient.unit})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Quantity"
                    type="number"
                    fullWidth
                    value={orderQuantity}
                    onChange={e => setOrderQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                    InputProps={{ inputProps: { min: 1 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{ height: '56px' }}
                    onClick={handleAddToOrder}
                    disabled={!selectedIngredient}
                  >
                    Add
                  </Button>
                </Grid>
              </Grid>
            </Box>
            {stockOrders.length > 0 ? (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Ingredient</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Unit</TableCell>
                      <TableCell align="right">Unit Price</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell align="center">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stockOrders.map(order => (
                      <TableRow key={order.id}>
                        <TableCell>{order.name}</TableCell>
                        <TableCell align="right">{order.quantity}</TableCell>
                        <TableCell align="right">{order.unit}</TableCell>
                        <TableCell align="right">LKR {order.unit_price.toLocaleString()}</TableCell>
                        <TableCell align="right">LKR {order.total_price.toLocaleString()}</TableCell>
                        <TableCell align="center">
                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleRemoveFromOrder(order.id)}
                          >
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={4} align="right" sx={{ fontWeight: 'bold' }}>
                        Total:
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        LKR {stockOrders.reduce((sum, order) => sum + order.total_price, 0).toLocaleString()}
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No items added to order yet
              </Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setOrderDialogOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              startIcon={<ReceiptIcon />}
              onClick={handleDownloadReceipt}
              disabled={stockOrders.length === 0}
            >
              Generate Receipt
            </Button>
          </DialogActions>
        </Dialog>

        {/* Notification */}
        {notification && (
          <Alert
            severity="info"
            onClose={() => setNotification(null)}
            sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 9999 }}
          >
            {notification}
          </Alert>
        )}
      </Container>
    </Box>
  );
}
