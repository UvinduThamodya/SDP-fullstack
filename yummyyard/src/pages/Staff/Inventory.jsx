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
  ThemeProvider,
  DialogContentText,
  Select,
  MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import WarningIcon from '@mui/icons-material/Warning';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import SidebarStaff from '../../components/SidebarStaff';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import MenuService from '../../services/menuService';
import MenuIcon from '@mui/icons-material/Menu';

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
  palette: {
    primary: {
      main: '#3ACA82',
    },
    success: {
      main: '#3ACA82', // Change success color to match the theme
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
        containedPrimary: {
          backgroundColor: '#3ACA82',
          '&:hover': {
            backgroundColor: '#2d9e68',
          },
        },
        outlinedPrimary: {
          color: '#3ACA82',
          borderColor: '#3ACA82',
          '&:hover': {
            borderColor: '#2d9e68',
            backgroundColor: 'rgba(58, 202, 130, 0.08)',
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

const allowedUnits = ['kg', 'L', 'packets', 'pieces', 'bottles'];

const Inventory = () => {
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
  const [addErrors, setAddErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});

  // --- Menu Item Ingredient Management State ---
  const [menuItems, setMenuItems] = useState([]);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [menuItemIngredients, setMenuItemIngredients] = useState([]);
  const [ingredientDialogOpen, setIngredientDialogOpen] = useState(false);
  const [ingredientEdit, setIngredientEdit] = useState(null);
  const [ingredientDelete, setIngredientDelete] = useState(null);
  const [ingredientForm, setIngredientForm] = useState({ inventory_id: '', quantity_required: '' });
  const [ingredientFormError, setIngredientFormError] = useState('');
  const [ingredientEditError, setIngredientEditError] = useState('');

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
    let val = value;
    let errors = { ...addErrors };

    // Prevent negative values for numeric fields
    if ((name === 'quantity' || name === 'unit_price' || name === 'threshold') && value !== '') {
      if (Number(value) < 0) {
        errors[name] = 'Value cannot be negative';
        setAddErrors(errors);
        return;
      } else {
        delete errors[name];
      }
      // Optionally, prevent leading zeros
      val = value.replace(/^(-)?0+(\d)/, '$1$2');
    }
    setAddErrors(errors);
    setNewIngredient({ ...newIngredient, [name]: val });
  };

  const handleAddIngredient = async () => {
    // Validate before submit
    const errors = {};
    ['quantity', 'unit_price', 'threshold'].forEach(field => {
      if (newIngredient[field] !== '' && Number(newIngredient[field]) < 0) {
        errors[field] = 'Value cannot be negative';
      }
    });
    setAddErrors(errors);
    if (Object.keys(errors).length > 0) return;

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
    // Validate before submit
    const errors = {};
    ['quantity', 'unit_price', 'threshold'].forEach(field => {
      if (editIngredient[field] !== '' && Number(editIngredient[field]) < 0) {
        errors[field] = 'Value cannot be negative';
      }
    });
    setEditErrors(errors);
    if (Object.keys(errors).length > 0) return;

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
    let val = value;
    let errors = { ...editErrors };

    if ((name === 'quantity' || name === 'unit_price' || name === 'threshold') && value !== '') {
      if (Number(value) < 0) {
        errors[name] = 'Value cannot be negative';
        setEditErrors(errors);
        return;
      } else {
        delete errors[name];
      }
      val = value.replace(/^(-)?0+(\d)/, '$1$2');
    }
    setEditErrors(errors);
    setEditIngredient({
      ...editIngredient,
      [name]: val
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
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const data = await MenuService.getMenuItems();
      setMenuItems(data.menuItems || data);
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to fetch menu items', severity: 'error' });
    }
  };

  const fetchMenuItemIngredients = async (menuItemId) => {
    try {
      const data = await MenuService.getMenuItemIngredients(menuItemId);
      setMenuItemIngredients(data.ingredients || []);
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to fetch menu item ingredients', severity: 'error' });
    }
  };

  const handleOpenIngredientDialog = async (menuItem) => {
    setSelectedMenuItem(menuItem);
    await fetchMenuItemIngredients(menuItem.item_id);
    setIngredientDialogOpen(true);
  };

  const handleCloseIngredientDialog = () => {
    setIngredientDialogOpen(false);
    setSelectedMenuItem(null);
    setMenuItemIngredients([]);
    setIngredientEdit(null);
    setIngredientDelete(null);
    setIngredientForm({ inventory_id: '', quantity_required: '' });
  };

  const handleAddMenuItemIngredient = async () => {
    if (ingredientForm.quantity_required !== '' && Number(ingredientForm.quantity_required) < 0) {
      setIngredientFormError('Value cannot be negative');
      return;
    }
    setIngredientFormError('');
    try {
      await MenuService.addMenuItemIngredient(selectedMenuItem.item_id, ingredientForm);
      setSnackbar({ open: true, message: 'Ingredient added to menu item!', severity: 'success' });
      await fetchMenuItemIngredients(selectedMenuItem.item_id);
      setIngredientForm({ inventory_id: '', quantity_required: '' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to add ingredient', severity: 'error' });
    }
  };

  const handleEditMenuItemIngredient = async () => {
    if (ingredientEdit.quantity_required !== '' && Number(ingredientEdit.quantity_required) < 0) {
      setIngredientEditError('Value cannot be negative');
      return;
    }
    setIngredientEditError('');
    try {
      await MenuService.editMenuItemIngredient(selectedMenuItem.item_id, ingredientEdit.menu_item_ingredient_id, ingredientEdit);
      setSnackbar({ open: true, message: 'Ingredient updated!', severity: 'success' });
      await fetchMenuItemIngredients(selectedMenuItem.item_id);
      setIngredientEdit(null);
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to update ingredient', severity: 'error' });
    }
  };

  const handleDeleteMenuItemIngredient = async () => {
    try {
      await MenuService.deleteMenuItemIngredient(selectedMenuItem.item_id, ingredientDelete.menu_item_ingredient_id);
      setSnackbar({ open: true, message: 'Ingredient deleted!', severity: 'success' });
      await fetchMenuItemIngredients(selectedMenuItem.item_id);
      setIngredientDelete(null);
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to delete ingredient', severity: 'error' });
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
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
            backgroundColor: '#3ACA82',
            '&:hover': {
              backgroundColor: '#2d9e68',
            },
          }}
        >
          <MenuIcon />
        </Button>
        <Box component="main" sx={{ flexGrow: 1, backgroundColor: '#f5f7fa', p: { xs: 2, sm: 3 }, width: '100%' }}>
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
                  inputProps={{ min: 0 }}
                  error={!!addErrors.quantity}
                  helperText={addErrors.quantity}
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
                    native: false,
                  }}
                >
                  {allowedUnits.map((unit) => (
                    <MenuItem key={unit} value={unit}>{unit}</MenuItem>
                  ))}
                </TextField>
                <TextField
                  name="unit_price"
                  label="Unit Price (LKR)"
                  type="number"
                  fullWidth
                  margin="dense"
                  value={newIngredient.unit_price}
                  onChange={handleInputChange}
                  inputProps={{ min: 0 }}
                  error={!!addErrors.unit_price}
                  helperText={addErrors.unit_price}
                />
                <TextField
                  name="threshold"
                  label="Threshold"
                  type="number"
                  fullWidth
                  margin="dense"
                  value={newIngredient.threshold}
                  onChange={handleInputChange}
                  inputProps={{ min: 0 }}
                  error={!!addErrors.threshold}
                  helperText={addErrors.threshold}
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
                      inputProps={{ min: 0 }}
                      error={!!editErrors.quantity}
                      helperText={editErrors.quantity}
                    />
                    <TextField
                      name="unit"
                      label="Unit"
                      select
                      fullWidth
                      margin="dense"
                      value={editIngredient.unit}
                      onChange={handleEditInputChange}
                      SelectProps={{
                        native: false,
                      }}
                    >
                      {allowedUnits.map((unit) => (
                        <MenuItem key={unit} value={unit}>{unit}</MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      name="unit_price"
                      label="Unit Price"
                      type="number"
                      fullWidth
                      margin="dense"
                      value={editIngredient.unit_price}
                      onChange={handleEditInputChange}
                      inputProps={{ min: 0 }}
                      error={!!editErrors.unit_price}
                      helperText={editErrors.unit_price}
                    />
                    <TextField
                      name="threshold"
                      label="Threshold"
                      type="number"
                      fullWidth
                      margin="dense"
                      value={editIngredient.threshold}
                      onChange={handleEditInputChange}
                      inputProps={{ min: 0 }}
                      error={!!editErrors.threshold}
                      helperText={editErrors.threshold}
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

            {/* --- Menu Item Ingredients Section --- */}
            <Box sx={{ mt: 6 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                Menu Item Ingredients Management
              </Typography>
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Select a menu item to view and manage its ingredients:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                  {menuItems.map((item) => (
                    <Button
                      key={item.item_id}
                      variant={selectedMenuItem && selectedMenuItem.item_id === item.item_id ? 'contained' : 'outlined'}
                      onClick={() => handleOpenIngredientDialog(item)}
                    >
                      {item.name}
                    </Button>
                  ))}
                </Box>
              </Paper>
            </Box>

            {/* Dialog for viewing and editing menu item ingredients */}
            <Dialog open={ingredientDialogOpen} onClose={handleCloseIngredientDialog} maxWidth="md" fullWidth>
              <DialogTitle>
                Ingredients for: {selectedMenuItem?.name}
              </DialogTitle>
              <DialogContent>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Add Ingredient</Typography>
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <TextField
                      select
                      label="Ingredient"
                      value={ingredientForm.inventory_id}
                      onChange={e => setIngredientForm(f => ({ ...f, inventory_id: e.target.value }))}
                      SelectProps={{ native: true }}
                      sx={{ minWidth: 180 }}
                    >
                      <option value="">Select Ingredient</option>
                      {ingredients.map((ing) => (
                        <option key={ing.inventory_id} value={ing.inventory_id}>{ing.item_name}</option>
                      ))}
                    </TextField>
                    <TextField
                      label="Quantity Required"
                      type="number"
                      value={ingredientForm.quantity_required}
                      onChange={e => {
                        const val = e.target.value;
                        setIngredientFormError('');
                        if (val !== '' && Number(val) < 0) {
                          setIngredientFormError('Value cannot be negative');
                        }
                        setIngredientForm(f => ({ ...f, quantity_required: val }));
                      }}
                      sx={{ minWidth: 140 }}
                      inputProps={{ min: 0 }}
                      error={!!ingredientFormError}
                      helperText={ingredientFormError}
                    />
                    <Button variant="contained" onClick={handleAddMenuItemIngredient}>Add</Button>
                  </Box>
                </Box>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Ingredient</TableCell>
                        <TableCell>Quantity Required</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {menuItemIngredients.map((ing) => (
                        <TableRow key={ing.menu_item_ingredient_id}>
                          <TableCell>
                            {ingredientEdit && ingredientEdit.menu_item_ingredient_id === ing.menu_item_ingredient_id ? (
                              <TextField
                                select
                                value={ingredientEdit.inventory_id}
                                onChange={e => setIngredientEdit(edit => ({ ...edit, inventory_id: e.target.value }))}
                                SelectProps={{ native: true }}
                              >
                                {ingredients.map((i) => (
                                  <option key={i.inventory_id} value={i.inventory_id}>{i.item_name}</option>
                                ))}
                              </TextField>
                            ) : (
                              ing.item_name
                            )}
                          </TableCell>
                          <TableCell>
                            {ingredientEdit && ingredientEdit.menu_item_ingredient_id === ing.menu_item_ingredient_id ? (
                              <TextField
                                type="number"
                                value={ingredientEdit.quantity_required}
                                onChange={e => {
                                  const val = e.target.value;
                                  setIngredientEditError('');
                                  if (val !== '' && Number(val) < 0) {
                                    setIngredientEditError('Value cannot be negative');
                                  }
                                  setIngredientEdit(edit => ({ ...edit, quantity_required: val }));
                                }}
                                inputProps={{ min: 0 }}
                                error={!!ingredientEditError}
                                helperText={ingredientEditError}
                              />
                            ) : (
                              ing.quantity_required
                            )}
                          </TableCell>
                          <TableCell>
                            {ingredientEdit && ingredientEdit.menu_item_ingredient_id === ing.menu_item_ingredient_id ? (
                              <>
                                <Button size="small" onClick={handleEditMenuItemIngredient} variant="contained" color="primary">Save</Button>
                                <Button size="small" onClick={() => setIngredientEdit(null)} sx={{ ml: 1 }}>Cancel</Button>
                              </>
                            ) : (
                              <>
                                <Button size="small" onClick={() => setIngredientEdit({ ...ing })} variant="outlined">Edit</Button>
                                <Button size="small" color="error" sx={{ ml: 1 }} onClick={() => setIngredientDelete(ing)}>Delete</Button>
                              </>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      {menuItemIngredients.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} align="center">No ingredients for this menu item.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseIngredientDialog}>Close</Button>
              </DialogActions>
            </Dialog>

            {/* Confirm Delete Ingredient Dialog */}
            <Dialog open={!!ingredientDelete} onClose={() => setIngredientDelete(null)}>
              <DialogTitle>Delete Ingredient</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Are you sure you want to remove this ingredient from the menu item?
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setIngredientDelete(null)}>Cancel</Button>
                <Button color="error" variant="contained" onClick={handleDeleteMenuItemIngredient}>Delete</Button>
              </DialogActions>
            </Dialog>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Inventory;