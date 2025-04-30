import React, { useState, useEffect } from 'react';
import SidebarAdmin from '../../components/SidebarAdmin';
import {
  Box, Typography, Container, Grid, Paper, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl, InputLabel, Select, MenuItem, Alert, CircularProgress, Snackbar
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
import apiService from '../../services/api';

// Chart.js imports and registration
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip,
  Legend
);

export default function AdminDashboard() {
  // State management
  const [lowStockItems, setLowStockItems] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [leastOrderedItem, setLeastOrderedItem] = useState(null);
  const [allIngredients, setAllIngredients] = useState([]);
  const [loading, setLoading] = useState({
    lowStock: true,
    topItems: true,
    leastOrdered: true,
    ingredients: true
  });
  const [error, setError] = useState({
    lowStock: null,
    topItems: null,
    leastOrdered: null,
    ingredients: null
  });
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState('');
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [stockOrders, setStockOrders] = useState([]);
  const [notification, setNotification] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Sales summary and chart
  const [salesSummary, setSalesSummary] = useState({ day: 0, month: 0, year: 0 });
  const [salesLoading, setSalesLoading] = useState(true);
  const [salesError, setSalesError] = useState(null);
  const [salesNotification, setSalesNotification] = useState(null);
  const [salesData, setSalesData] = useState([]);

  const currentDate = new Date();

  // Add this state variable
  const [topUsedIngredients, setTopUsedIngredients] = useState([]);

  // Fetch dashboard data on component mount
  useEffect(() => {
    fetchLowStockItems();
    fetchTopItems();
    fetchLeastOrderedItem();
    fetchAllIngredients();
  }, []);

  // Sales summary and chart data
  useEffect(() => {
    const fetchSalesSummary = async () => {
      setSalesLoading(true);
      try {
        const data = await apiService.getSalesSummary();
        setSalesSummary(data);
      } catch (err) {
        setSalesError("Failed to load sales summary.");
      } finally {
        setSalesLoading(false);
      }
    };
    fetchSalesSummary();
    apiService.getSalesByMonth().then(setSalesData);
  }, []);

  // Fetch the data in a `useEffect`
  useEffect(() => {
    const fetchTopUsedIngredients = async () => {
      try {
        const data = await apiService.getTopUsedIngredients();
        setTopUsedIngredients(data.ingredients || []);
      } catch (err) {
        console.error("Failed to fetch top used ingredients:", err);
      }
    };

    fetchTopUsedIngredients();
  }, []);

  // Data fetching functions
  const fetchLowStockItems = async () => {
    setLoading(prev => ({ ...prev, lowStock: true }));
    try {
      const data = await apiService.getLowStockItems();
      setLowStockItems(data.ingredients || []);
    } catch (err) {
      setError(prev => ({ ...prev, lowStock: 'Failed to load low stock data.' }));
    } finally {
      setLoading(prev => ({ ...prev, lowStock: false }));
    }
  };

  const fetchTopItems = async () => {
    setLoading(prev => ({ ...prev, topItems: true }));
    try {
      const data = await apiService.getTopOrderedItems(3);
      setTopItems(data.items || data.topItems || []);
    } catch (err) {
      setError(prev => ({ ...prev, topItems: 'Failed to load top items data.' }));
    } finally {
      setLoading(prev => ({ ...prev, topItems: false }));
    }
  };

  const fetchLeastOrderedItem = async () => {
    setLoading(prev => ({ ...prev, leastOrdered: true }));
    try {
      const data = await apiService.getLeastOrderedItem();
      setLeastOrderedItem(data.item || data.leastOrderedItem || null);
    } catch (err) {
      setError(prev => ({ ...prev, leastOrdered: 'Failed to load least ordered item data.' }));
    } finally {
      setLoading(prev => ({ ...prev, leastOrdered: false }));
    }
  };

  const fetchAllIngredients = async () => {
    setLoading(prev => ({ ...prev, ingredients: true }));
    try {
      const data = await apiService.getAllIngredients();
      // Map backend fields to frontend-friendly names
      const mapped = (data.ingredients || []).map(ing => ({
        id: ing.inventory_id,
        name: ing.item_name,
        unit: ing.unit,
        unit_price: ing.unit_price
      }));
      setAllIngredients(mapped);
    } catch (err) {
      setError(prev => ({ ...prev, ingredients: 'Failed to load ingredients data.' }));
    } finally {
      setLoading(prev => ({ ...prev, ingredients: false }));
    }
  };

  // Inventory order handlers
  const handleAddToOrder = () => {
    if (!selectedIngredient || orderQuantity <= 0) return;
    const ingredient = allIngredients.find(i => i.id === parseInt(selectedIngredient));
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

  // Submit stock order and download receipt
  const handleSubmitStockOrder = async () => {
    if (stockOrders.length === 0) return;
    setSubmitting(true);
    try {
      // Prepare order items
      const items = stockOrders.map(item => ({
        ingredient_id: item.ingredient_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price
      }));
      const totalAmount = items.reduce((sum, i) => sum + i.total_price, 0);
      // Submit order
      const result = await apiService.createStockOrder({ items, totalAmount });
      // Download receipt
      if (result.success && result.stockOrderId) {
        const receiptBlob = await apiService.downloadStockOrderReceipt(result.stockOrderId);
        // Create a download link
        const url = window.URL.createObjectURL(new Blob([receiptBlob]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `stock_order_${result.stockOrderId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        setNotification('Stock order created and receipt downloaded.');
        setStockOrders([]);
        setOrderDialogOpen(false);
      }
    } catch (error) {
      setNotification(`Error: ${error.message || 'Failed to process order'}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Sales chart data
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const chartData = {
    labels: months,
    datasets: [
      {
        label: 'Sales (LKR)',
        data: months.map((_, idx) => {
          const found = salesData.find(d => d.month === idx + 1);
          return found ? found.total : 0;
        }),
        fill: false,
        borderColor: '#1976d2',
        backgroundColor: '#1976d2',
        tension: 0.3,
      },
    ],
  };
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true },
      title: { display: true, text: 'Monthly Sales (LKR)' },
    },
  };

  // Sales report PDF download
  const handleDownloadSalesReport = async (period) => {
    try {
      const blob = await apiService.downloadSalesReport(period);
      const url = window.URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `sales-report-${period}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setSalesNotification("Sales report downloaded.");
    } catch (error) {
      setSalesNotification("Failed to download sales report.");
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#f5f5f5' }}>
      <SidebarAdmin />
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

        {/* --- Sales Reports Section --- */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>Sales Reports</Typography>
          {salesLoading ? (
            <CircularProgress />
          ) : salesError ? (
            <Alert severity="error">{salesError}</Alert>
          ) : (
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1">Today</Typography>
                <Typography variant="h6">LKR {Number(salesSummary.day).toLocaleString()}</Typography>
                <Button
                  onClick={() => handleDownloadSalesReport("day")}
                  variant="outlined"
                  sx={{ mt: 1 }}
                >
                  Download PDF
                </Button>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1">This Month</Typography>
                <Typography variant="h6">LKR {Number(salesSummary.month).toLocaleString()}</Typography>
                <Button
                  onClick={() => handleDownloadSalesReport("month")}
                  variant="outlined"
                  sx={{ mt: 1 }}
                >
                  Download PDF
                </Button>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1">This Year</Typography>
                <Typography variant="h6">LKR {Number(salesSummary.year).toLocaleString()}</Typography>
                <Button
                  onClick={() => handleDownloadSalesReport("year")}
                  variant="outlined"
                  sx={{ mt: 1 }}
                >
                  Download PDF
                </Button>
              </Grid>
            </Grid>
          )}
        </Paper>

        

        {/* Low Stock Alert */}
        <Paper sx={{ p: 2, mb: 3, backgroundColor: lowStockItems.length > 0 ? '#fff8e1' : 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            {lowStockItems.length > 0 && <WarningIcon sx={{ color: 'warning.main', mr: 1 }} />}
            <Typography variant="h6">
              {loading.lowStock
                ? 'Loading inventory status...'
                : lowStockItems.length > 0
                  ? `Low Stock Alert: ${lowStockItems.length} items below threshold`
                  : 'Inventory Status: All items in stock'}
            </Typography>
          </Box>
          {loading.lowStock && <CircularProgress size={24} sx={{ ml: 2 }} />}
          {error.lowStock && <Alert severity="error">{error.lowStock}</Alert>}
          {lowStockItems.length > 0 && !loading.lowStock && (
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

        {/* Sales Chart */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>Sales Overview</Typography>
          <Line data={chartData} options={chartOptions} />
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
              {loading.topItems && <CircularProgress size={24} sx={{ ml: 2 }} />}
              {error.topItems && <Alert severity="error">{error.topItems}</Alert>}
              {!loading.topItems && !error.topItems && (
                topItems.length > 0 ? (
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
                            <TableCell align="right">LKR {Number(item.total_revenue ?? item.revenue).toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No order data available yet.
                  </Typography>
                )
              )}
            </Paper>
          </Grid>

          {/* Least Ordered Item */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingDownIcon sx={{ color: 'error.main', mr: 1 }} />
                <Typography variant="h6">Least Ordered Item</Typography>
              </Box>
              {loading.leastOrdered && <CircularProgress size={24} sx={{ ml: 2 }} />}
              {error.leastOrdered && <Alert severity="error">{error.leastOrdered}</Alert>}
              {!loading.leastOrdered && !error.leastOrdered && leastOrderedItem && (
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6">{leastOrderedItem.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Category: {leastOrderedItem.category}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Price: LKR {Number(leastOrderedItem.price).toLocaleString()}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      Orders: <strong>{leastOrderedItem.order_count}</strong>
                    </Typography>
                  </CardContent>
                </Card>
              )}
              {!loading.leastOrdered && !error.leastOrdered && !leastOrderedItem && (
                <Typography variant="body2" color="text.secondary">
                  No menu items data available yet.
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Top Used Ingredients */}
        <Paper sx={{ p: 2, mb: 4 }}>
          <Typography variant="h5" gutterBottom>Top 3 Used Ingredients</Typography>
          {topUsedIngredients.length === 0 ? (
            <Typography>No ingredient usage data available.</Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Rank</TableCell>
                    <TableCell>Ingredient</TableCell>
                    <TableCell align="right">Total Used</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topUsedIngredients.slice(0, 3).map((ingredient, idx) => (
                    <TableRow key={ingredient.inventory_id}>
                      <TableCell>#{idx + 1}</TableCell>
                      <TableCell>{ingredient.item_name}</TableCell>
                      <TableCell align="right">{ingredient.total_used}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        {/* Inventory Order Dialog */}
        <Dialog
          open={orderDialogOpen}
          onClose={() => !submitting && setOrderDialogOpen(false)}
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
                      disabled={loading.ingredients || submitting}
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
                    disabled={submitting}
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{ height: '56px' }}
                    onClick={handleAddToOrder}
                    disabled={!selectedIngredient || loading.ingredients || submitting}
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
                        <TableCell align="right">LKR {Number(order.unit_price).toLocaleString()}</TableCell>
                        <TableCell align="right">LKR {Number(order.total_price).toLocaleString()}</TableCell>
                        <TableCell align="center">
                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleRemoveFromOrder(order.id)}
                            disabled={submitting}
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
            <Button onClick={() => setOrderDialogOpen(false)} disabled={submitting}>Cancel</Button>
            <Button
              variant="contained"
              startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <ReceiptIcon />}
              onClick={handleSubmitStockOrder}
              disabled={stockOrders.length === 0 || submitting}
            >
              {submitting ? 'Processing...' : 'Generate Receipt'}
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
        <Snackbar
          open={!!salesNotification}
          autoHideDuration={4000}
          onClose={() => setSalesNotification(null)}
        >
          <Alert onClose={() => setSalesNotification(null)} severity="info" sx={{ width: '100%' }}>
            {salesNotification}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}
