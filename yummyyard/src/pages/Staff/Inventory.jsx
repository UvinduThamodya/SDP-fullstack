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
import WarningIcon from '@mui/icons-material/Warning';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

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
  const [editIngredient, setEditIngredient] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [deleteIngredient, setDeleteIngredient] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

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

  // Edit functions
  const handleEditIngredient = (ingredient) => {
    setEditIngredient(ingredient);
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setEditIngredient(null);
  };

  const handleUpdateIngredient = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/inventory/${editIngredient.inventory_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editIngredient)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSnackbar({
          open: true,
          message: 'Ingredient updated successfully!',
          severity: 'success'
        });
        fetchInventory(); // Refresh the list
        handleCloseEditDialog();
      } else {
        setSnackbar({
          open: true,
          message: data.error || 'Failed to update ingredient',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error updating ingredient:', error);
      setSnackbar({
        open: true,
        message: 'Server error. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditIngredient({
      ...editIngredient,
      [name]: value
    });
  };

  // Delete functions
  const handleOpenDeleteDialog = (ingredient) => {
    setDeleteIngredient(ingredient);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setDeleteIngredient(null);
  };

  const handleDeleteIngredient = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/inventory/${deleteIngredient.inventory_id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSnackbar({
          open: true,
          message: 'Ingredient deleted successfully!',
          severity: 'success'
        });
        fetchInventory(); // Refresh the list
        handleCloseDeleteDialog();
      } else {
        setSnackbar({
          open: true,
          message: data.error || 'Failed to delete ingredient',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error deleting ingredient:', error);
      setSnackbar({
        open: true,
        message: 'Server error. Please try again.',
        severity: 'error'
      });
    }
  };

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
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell> {/* New column */}
            </TableRow>
          </TableHead>
          <TableBody>
            {ingredients.map((ingredient) => (
              <TableRow
                key={ingredient.inventory_id}
                sx={{
                  backgroundColor: ingredient.quantity < ingredient.threshold ? '#fff8e1' : 'inherit', // Highlight if below threshold
                  '&:hover': { backgroundColor: '#f5f5f5' }, // Add hover effect
                }}
              >
                <TableCell>{ingredient.item_name}</TableCell>
                <TableCell>{ingredient.quantity}</TableCell>
                <TableCell>{ingredient.unit}</TableCell>
                <TableCell>${ingredient.unit_price}</TableCell>
                <TableCell>{ingredient.threshold}</TableCell>
                <TableCell>
                  {ingredient.quantity < ingredient.threshold ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'warning.main' }}>
                      <WarningIcon fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2">Low Stock</Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="success.main">
                      In Stock
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleEditIngredient(ingredient)}
                    sx={{ mr: 1 }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleOpenDeleteDialog(ingredient)}
                  >
                    Delete
                  </Button>
                </TableCell>
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

      {/* Edit Ingredient Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
        <DialogTitle>Edit Ingredient</DialogTitle>
        <DialogContent>
          {editIngredient && (
            <>
              <TextField
                name="item_name"
                label="Ingredient Name"
                fullWidth
                margin="dense"
                value={editIngredient.item_name}
                onChange={handleEditInputChange}
              />
              <TextField
                name="quantity"
                label="Quantity"
                type="number"
                fullWidth
                margin="dense"
                value={editIngredient.quantity}
                onChange={handleEditInputChange}
              />
              <TextField
                name="unit"
                label="Unit"
                fullWidth
                margin="dense"
                value={editIngredient.unit}
                onChange={handleEditInputChange}
              />
              <TextField
                name="unit_price"
                label="Unit Price"
                type="number"
                fullWidth
                margin="dense"
                value={editIngredient.unit_price}
                onChange={handleEditInputChange}
              />
              <TextField
                name="threshold"
                label="Threshold"
                type="number"
                fullWidth
                margin="dense"
                value={editIngredient.threshold}
                onChange={handleEditInputChange}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleUpdateIngredient}>
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Ingredient Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          {deleteIngredient && (
            <Typography>
              Are you sure you want to delete "{deleteIngredient.item_name}"? This action cannot be undone.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteIngredient}>
            Delete
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
