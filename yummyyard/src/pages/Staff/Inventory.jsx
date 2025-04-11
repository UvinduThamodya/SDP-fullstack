import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';

const Inventory = () => {
  const [ingredients, setIngredients] = useState([]); // To store inventory data
  const [searchTerm, setSearchTerm] = useState(''); // For searching
  const [openAddDialog, setOpenAddDialog] = useState(false); // Add ingredient dialog
  const [newIngredient, setNewIngredient] = useState({
    item_name: '',
    quantity: '',
    unit: 'grams',
    unit_price: '',
    threshold: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' });

  const fetchInventory = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/inventory');
      
      // Log the content type to debug
      const contentType = response.headers.get('content-type');
      console.log('Response content type:', contentType);
      
      // Check if response is JSON before parsing
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        setIngredients(data.ingredients);
      } else {
        // For debugging: log the raw response
        const text = await response.text();
        console.log('Raw response:', text.substring(0, 50) + '...');
        console.log('Received non-JSON response');
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };
  
  
  // Handle search functionality
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value.trim() === '') {
      fetchInventory(); // Reset to full list if search is empty
    } else {
      const filtered = ingredients.filter((ingredient) =>
        ingredient.item_name.toLowerCase().includes(e.target.value.toLowerCase())
      );
      setIngredients(filtered);
    }
  };

  // Open and close add ingredient dialog
  const handleOpenAddDialog = () => setOpenAddDialog(true);
  const handleCloseAddDialog = () => setOpenAddDialog(false);

  // Handle input changes for new ingredient form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewIngredient({ ...newIngredient, [name]: value });
  };

  // Add a new ingredient to the inventory
  const handleAddIngredient = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newIngredient)
      });
      const data = await response.json();
      if (data.success) {
        setSnackbar({ open: true, message: 'Ingredient added successfully!', severity: 'success' });
        fetchInventory(); // Refresh inventory list
        handleCloseAddDialog();
      } else {
        setSnackbar({ open: true, message: data.error || 'Failed to add ingredient.', severity: 'error' });
      }
    } catch (error) {
      console.error('Error adding ingredient:', error);
      setSnackbar({ open: true, message: 'Server error. Please try again.', severity: 'error' });
    }
  };

  // Close snackbar notification
  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  // Fetch inventory on component mount
  useEffect(() => {
    fetchInventory();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      {/* Page Title */}
      <Typography variant="h4" gutterBottom>
        Inventory Management
      </Typography>

      {/* Search Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search ingredients..."
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <SearchIcon sx={{ mr: 1 }} />
            )
          }}
        />
      </Paper>

      {/* Add Ingredient Button */}
      <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpenAddDialog}>
        Add Ingredient
      </Button>

      {/* Inventory Table */}
      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Ingredient</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell>Unit Price</TableCell>
              <TableCell>Threshold</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ingredients.map((ingredient) => (
              <TableRow key={ingredient.inventory_id}>
                <TableCell>{ingredient.item_name}</TableCell>
                <TableCell>{ingredient.quantity}</TableCell>
                <TableCell>{ingredient.unit}</TableCell>
                <TableCell>${ingredient.unit_price}</TableCell>
                <TableCell>{ingredient.threshold}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Ingredient Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog}>
        <DialogTitle>Add New Ingredient</DialogTitle>
        <DialogContent>
          <TextField
            name="item_name"
            label="Ingredient Name"
            fullWidth
            margin="dense"
            value={newIngredient.item_name}
            onChange={handleInputChange}
          />
          <TextField
            name="quantity"
            label="Quantity"
            type="number"
            fullWidth
            margin="dense"
            value={newIngredient.quantity}
            onChange={handleInputChange}
          />
          <TextField
            name="unit"
            label="Unit"
            fullWidth
            margin="dense"
            value={newIngredient.unit}
            onChange={handleInputChange}
          />
          <TextField
            name="unit_price"
            label="Unit Price"
            type="number"
            fullWidth
            margin="dense"
            value={newIngredient.unit_price}
            onChange={handleInputChange}
          />
          <TextField
            name="threshold"
            label="Threshold"
            type="number"
            fullWidth
            margin="dense"
            value={newIngredient.threshold}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleAddIngredient}>
            Add Ingredient
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notifications */}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Inventory;
