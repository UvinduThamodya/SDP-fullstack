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
  Alert,
  createTheme,
  ThemeProvider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import WarningIcon from '@mui/icons-material/Warning';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import SidebarAdmin from '../../components/SidebarAdmin';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

// Custom theme with Poppins font
const theme = createTheme({
  typography: {
    fontFamily: 'Poppins, sans-serif',
    h4: {
      fontWeight: 600,
    },
    button: {
      fontFamily: 'Poppins, sans-serif',
      textTransform: 'none',
    },
  },
  components: {
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          backgroundColor: '#f5f5f5',
        },
        root: {
          fontFamily: 'Poppins, sans-serif',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

const AdminInventory = () => {
  const [ingredients, setIngredients] = useState([]);
  const [filteredIngredients, setFilteredIngredients] = useState([]);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
  const [openAddDialog, setOpenAddDialog] = useState(false);
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
  const [sidebarOpen, setSidebarOpen] = useState(false); // Default to hidden for mobile view

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const fetchInventory = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/inventory');
      
      const contentType = response.headers.get('content-type');
      console.log('Response content type:', contentType);
      
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        setIngredients(data.ingredients);
        setFilteredIngredients(data.ingredients);
      } else {
        const text = await response.text();
        console.log('Raw response:', text.substring(0, 50) + '...');
        console.log('Received non-JSON response');
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };
  
  const handleFilterChange = (filterType) => {
    setFilter(filterType);
    if (filterType === 'All') {
      setFilteredIngredients(ingredients);
    } else if (filterType === 'In Stock') {
      setFilteredIngredients(ingredients.filter((ingredient) => ingredient.quantity >= ingredient.threshold));
    } else if (filterType === 'Out of Stock') {
      setFilteredIngredients(ingredients.filter((ingredient) => ingredient.quantity < ingredient.threshold));
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    const filtered = ingredients.filter((ingredient) =>
      ingredient.item_name.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setFilteredIngredients(filtered);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedIngredients = [...filteredIngredients].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredIngredients(sortedIngredients);
  };

  const handleOpenAddDialog = () => setOpenAddDialog(true);
  const handleCloseAddDialog = () => setOpenAddDialog(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Prevent negative or zero values for numeric fields
    if ((name === 'quantity' || name === 'unit_price' || name === 'threshold') && value < 1) {
      return; // Do not update the state if the value is invalid
    }

    setNewIngredient({ ...newIngredient, [name]: value });
  };

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
        fetchInventory();
        handleCloseAddDialog();
      } else {
        setSnackbar({ open: true, message: data.error || 'Failed to add ingredient.', severity: 'error' });
      }
    } catch (error) {
      console.error('Error adding ingredient:', error);
      setSnackbar({ open: true, message: 'Server error. Please try again.', severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

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
        fetchInventory();
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
        fetchInventory();
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

  const downloadInventoryReport = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5000/api/inventory/report/pdf', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
      alert('Failed to download report');
      return;
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inventory-report-${new Date().toISOString().slice(0,10)}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <SidebarAdmin open={sidebarOpen} toggleSidebar={toggleSidebar} />

        <Box component="main" sx={{ flexGrow: 1, backgroundColor: '#f5f7fa', p: { xs: 2, sm: 3 } }}>
          <Button
            variant="contained"
            onClick={toggleSidebar}
            sx={{
              display: { xs: 'block', sm: 'none' }, // Show button only on mobile view
              mb: 2,
              backgroundColor: theme.palette.primary.main,
              color: '#fff',
            }}
          >
            {sidebarOpen ? 'Hide Menu' : 'Show Menu'}
          </Button>

          <Container maxWidth="lg">
            {/* Page Title */}
            <Typography
              variant="h4"
              gutterBottom
              sx={{
                fontWeight: 700,
                color: '#333',
                textAlign: 'center',
                mb: 4,
                letterSpacing: '0.5px',
              }}
            >
              Inventory Management
            </Typography>

            {/* Actions Row */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, flexWrap: 'wrap', gap: 2 }}>
              {/* Left side: Filter Buttons */}
              <Paper elevation={1} sx={{ p: 1, borderRadius: 2, display: 'flex', gap: 1, flexGrow: 1, maxWidth: 350 }}>
                <Button
                  variant={filter === 'All' ? 'contained' : 'outlined'}
                  onClick={() => handleFilterChange('All')}
                  size="small"
                >
                  All
                </Button>
                <Button
                  variant={filter === 'In Stock' ? 'contained' : 'outlined'}
                  onClick={() => handleFilterChange('In Stock')}
                  size="small"
                  color="success"
                >
                  In Stock
                </Button>
                <Button
                  variant={filter === 'Out of Stock' ? 'contained' : 'outlined'}
                  onClick={() => handleFilterChange('Out of Stock')}
                  size="small"
                  color="warning"
                >
                  Low Stock
                </Button>
              </Paper>

              {/* Right side: Search Bar */}
              <Paper elevation={1} sx={{ p: 1, borderRadius: 2, flexGrow: 1, maxWidth: { xs: '100%', sm: 400 } }}>
                <TextField
                  fullWidth
                  placeholder="Search ingredients..."
                  value={searchTerm}
                  onChange={handleSearch}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Paper>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleOpenAddDialog}
                sx={{ fontWeight: 600 }}
              >
                Add Ingredient
              </Button>
              
              <Button
                variant="contained"
                color="secondary"
                startIcon={<PictureAsPdfIcon />}
                onClick={downloadInventoryReport}
                sx={{ fontWeight: 600 }}
              >
                Download Report
              </Button>
            </Box>

            {/* Inventory Table */}
            <Paper elevation={2} sx={{ overflow: 'hidden', mb: 4 }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell onClick={() => handleSort('item_name')} sx={{ cursor: 'pointer', fontWeight: 600 }}>
                        Ingredient
                        {sortConfig.key === 'item_name' && (
                          sortConfig.direction === 'asc' ? <ArrowUpwardIcon fontSize="small" sx={{ ml: 0.5, verticalAlign: 'middle' }} /> : 
                                                        <ArrowDownwardIcon fontSize="small" sx={{ ml: 0.5, verticalAlign: 'middle' }} />
                        )}
                      </TableCell>
                      <TableCell onClick={() => handleSort('quantity')} sx={{ cursor: 'pointer', fontWeight: 600 }}>
                        Quantity
                        {sortConfig.key === 'quantity' && (
                          sortConfig.direction === 'asc' ? <ArrowUpwardIcon fontSize="small" sx={{ ml: 0.5, verticalAlign: 'middle' }} /> : 
                                                        <ArrowDownwardIcon fontSize="small" sx={{ ml: 0.5, verticalAlign: 'middle' }} />
                        )}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Unit</TableCell>
                      <TableCell onClick={() => handleSort('unit_price')} sx={{ cursor: 'pointer', fontWeight: 600 }}>
                        Unit Price
                        {sortConfig.key === 'unit_price' && (
                          sortConfig.direction === 'asc' ? <ArrowUpwardIcon fontSize="small" sx={{ ml: 0.5, verticalAlign: 'middle' }} /> : 
                                                        <ArrowDownwardIcon fontSize="small" sx={{ ml: 0.5, verticalAlign: 'middle' }} />
                        )}
                      </TableCell>
                      <TableCell onClick={() => handleSort('threshold')} sx={{ cursor: 'pointer', fontWeight: 600 }}>
                        Threshold
                        {sortConfig.key === 'threshold' && (
                          sortConfig.direction === 'asc' ? <ArrowUpwardIcon fontSize="small" sx={{ ml: 0.5, verticalAlign: 'middle' }} /> : 
                                                        <ArrowDownwardIcon fontSize="small" sx={{ ml: 0.5, verticalAlign: 'middle' }} />
                        )}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredIngredients.map((ingredient) => (
                      <TableRow
                        key={ingredient.inventory_id}
                        sx={{
                          backgroundColor: ingredient.quantity < ingredient.threshold ? '#fff8e1' : 'inherit',
                          '&:hover': { backgroundColor: '#f5f5f5' },
                        }}
                      >
                        <TableCell sx={{ fontWeight: 500 }}>{ingredient.item_name}</TableCell>
                        <TableCell>{ingredient.quantity}</TableCell>
                        <TableCell>{ingredient.unit}</TableCell>
                        <TableCell>LKR {ingredient.unit_price}</TableCell>
                        <TableCell>{ingredient.threshold}</TableCell>
                        <TableCell>
                          {ingredient.quantity < ingredient.threshold ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', color: 'warning.main' }}>
                              <WarningIcon fontSize="small" sx={{ mr: 1 }} />
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>Low Stock</Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="success.main" sx={{ fontWeight: 500 }}>
                              In Stock
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<EditIcon />}
                            onClick={() => handleEditIngredient(ingredient)}
                            sx={{ mr: 1 }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => handleOpenDeleteDialog(ingredient)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredIngredients.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                          <Typography variant="body1" color="text.secondary">
                            No ingredients found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {/* Add Ingredient Dialog */}
            <Dialog open={openAddDialog} onClose={handleCloseAddDialog}>
              <DialogTitle sx={{ fontWeight: 600 }}>Add New Ingredient</DialogTitle>
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
                  inputProps={{ min: 1 }} // Prevent negative or zero values
                />
                <TextField
                  name="unit"
                  label="Unit"
                  select
                  fullWidth
                  margin="dense"
                  value={newIngredient.unit}
                  onChange={handleInputChange}
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="kg">kg</option>
                  <option value="L">L</option>
                  <option value="packets">packets</option>
                  <option value="pieces">pieces</option>
                  <option value="bottles">bottles</option>
                </TextField>
                <TextField
                  name="unit_price"
                  label="Unit Price (LKR)"
                  type="number"
                  fullWidth
                  margin="dense"
                  value={newIngredient.unit_price}
                  onChange={handleInputChange}
                  inputProps={{ min: 1 }} // Prevent negative or zero values
                />
                <TextField
                  name="threshold"
                  label="Threshold"
                  type="number"
                  fullWidth
                  margin="dense"
                  value={newIngredient.threshold}
                  onChange={handleInputChange}
                  inputProps={{ min: 1 }} // Prevent negative or zero values
                />
              </DialogContent>
              <DialogActions sx={{ p: 2 }}>
                <Button onClick={handleCloseAddDialog}>Cancel</Button>
                <Button variant="contained" color="primary" onClick={handleAddIngredient}>
                  Add Ingredient
                </Button>
              </DialogActions>
            </Dialog>

            {/* Edit Ingredient Dialog */}
            <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
              <DialogTitle sx={{ fontWeight: 600 }}>Edit Ingredient</DialogTitle>
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
              <DialogActions sx={{ p: 2 }}>
                <Button onClick={handleCloseEditDialog}>Cancel</Button>
                <Button variant="contained" color="primary" onClick={handleUpdateIngredient}>
                  Update
                </Button>
              </DialogActions>
            </Dialog>

            {/* Delete Ingredient Dialog */}
            <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
              <DialogTitle sx={{ fontWeight: 600 }}>Confirm Delete</DialogTitle>
              <DialogContent>
                {deleteIngredient && (
                  <Typography>
                    Are you sure you want to delete "{deleteIngredient.item_name}"? This action cannot be undone.
                  </Typography>
                )}
              </DialogContent>
              <DialogActions sx={{ p: 2 }}>
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
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default AdminInventory;
