import React, { useState, useEffect } from "react";
import {
  Box, Typography, Container, Grid, Card, CardMedia, CardContent, CardActions,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, 
  Snackbar, Alert, FormControl, InputLabel, Select, MenuItem, Paper, Divider,
  ThemeProvider, createTheme, CssBaseline, Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import MenuService from "../../services/menuService";
import AdminSidebar from "../../components/SidebarAdmin";
import DeleteIcon from "@mui/icons-material/Delete";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import WarningIcon from "@mui/icons-material/Warning";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

// Create a custom theme with Poppins font
const theme = createTheme({
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
    button: {
      fontWeight: 500,
      textTransform: 'none',
    },
  },
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f7',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 3px 10px rgba(0,0,0,0.08)',
          transition: 'transform 0.2s',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 3px 8px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
});

const UPLOAD_PRESET = "menuitem_upload_preset";
const CLOUDINARY_CLOUD_NAME = "ddly9e3qr";

function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  
  return fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: formData,
  })
    .then(res => res.json())
    .then(data => data.secure_url);
}

export default function AdminMenu() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    category: "",
    price: "",
    description: "",
    image_url: ""
  });  
  const [addForm, setAddForm] = useState({ 
    name: "", 
    price: "", 
    image_url: "", 
    category: "",
    description: "" 
  });
  const [imageUploading, setImageUploading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [notificationSeverity, setNotificationSeverity] = useState("info");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // --- Menu Item Ingredient Management State ---
  const [ingredients, setIngredients] = useState([]);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [menuItemIngredients, setMenuItemIngredients] = useState([]);
  const [ingredientDialogOpen, setIngredientDialogOpen] = useState(false);
  const [ingredientEdit, setIngredientEdit] = useState(null);
  const [ingredientDelete, setIngredientDelete] = useState(null);
  const [ingredientForm, setIngredientForm] = useState({ inventory_id: '', quantity_required: '' });

  useEffect(() => {
    fetchMenu();
    fetchIngredients();
  }, []);

  const fetchMenu = async () => {
    setLoading(true);
    try {
      const items = await MenuService.getMenuItems();
      setMenuItems(items);
    } catch (err) {
      showNotification("Failed to load menu items.", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchIngredients = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/inventory');
      const data = await response.json();
      setIngredients(data.ingredients || []);
    } catch (error) {
      showNotification('Failed to fetch ingredients', 'error');
    }
  };

  const showNotification = (message, severity = "info") => {
    setNotification(message);
    setNotificationSeverity(severity);
  };

  // Fetch ingredients for a menu item
  const fetchMenuItemIngredients = async (menuItemId) => {
    try {
      const data = await MenuService.getMenuItemIngredients(menuItemId);
      setMenuItemIngredients(data.ingredients || []);
    } catch (error) {
      showNotification('Failed to fetch menu item ingredients', 'error');
    }
  };

  // Open ingredient dialog for a menu item
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

  // Add ingredient to menu item
  const handleAddMenuItemIngredient = async () => {
    try {
      await MenuService.addMenuItemIngredient(selectedMenuItem.item_id, ingredientForm);
      showNotification('Ingredient added to menu item!', 'success');
      await fetchMenuItemIngredients(selectedMenuItem.item_id);
      setIngredientForm({ inventory_id: '', quantity_required: '' });
    } catch (error) {
      showNotification('Failed to add ingredient', 'error');
    }
  };

  // Edit ingredient for menu item
  const handleEditMenuItemIngredient = async () => {
    try {
      await MenuService.editMenuItemIngredient(selectedMenuItem.item_id, ingredientEdit.menu_item_ingredient_id, ingredientEdit);
      showNotification('Ingredient updated!', 'success');
      await fetchMenuItemIngredients(selectedMenuItem.item_id);
      setIngredientEdit(null);
    } catch (error) {
      showNotification('Failed to update ingredient', 'error');
    }
  };

  // Delete ingredient from menu item
  const handleDeleteMenuItemIngredient = async () => {
    try {
      await MenuService.deleteMenuItemIngredient(selectedMenuItem.item_id, ingredientDelete.menu_item_ingredient_id);
      showNotification('Ingredient deleted!', 'success');
      await fetchMenuItemIngredients(selectedMenuItem.item_id);
      setIngredientDelete(null);
    } catch (error) {
      showNotification('Failed to delete ingredient', 'error');
    }
  };

  // --- Edit ---
  const handleEditOpen = (item) => {
    setCurrentItem(item);
    setEditForm({
        name: item.name || "",
        price: item.price || "",
        image_url: item.image_url || "",
        category: item.category || "",
        description: item.description || ""
    });      
    setEditDialogOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((f) => ({ ...f, [name]: value }));
  };

  const handleEditImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setEditForm((f) => ({ ...f, image_url: url }));
    } catch {
      showNotification("Image upload failed.", "error");
    } finally {
      setImageUploading(false);
    }
  };

  const handleEditSubmit = async () => {
    const { name, price, category, image_url } = editForm;
    if (!name || !price || !category || !image_url) {
      showNotification("All fields are required.", "warning");
      return;
    }
    try {
      await MenuService.updateMenuItem(currentItem.item_id, {
        name,
        price,
        category,
        image_url,
        description: editForm.description || ""
      });
      showNotification("Menu item updated successfully.", "success");
      setEditDialogOpen(false);
      fetchMenu();
    } catch {
      showNotification("Update failed. Please try again.", "error");
    }
  };  
  
  // --- Add ---
  const handleAddOpen = () => {
    setAddForm({ name: "", price: "", image_url: "", category: "", description: "" });
    setAddDialogOpen(true);
  };

  const handleAddChange = (event) => {
    const { name, value } = event.target;
    setAddForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setAddForm((f) => ({ ...f, image_url: url }));
    } catch {
      showNotification("Image upload failed.", "error");
    } finally {
      setImageUploading(false);
    }
  };

  const handleAddSubmit = async () => {
    const { name, price, category, image_url } = addForm;
  
    if (!name || !price || !category || !image_url) {
      showNotification("All fields are required.", "warning");
      return;
    }
  
    try {
      await MenuService.addMenuItem({
        name,
        price,
        category,
        image_url,
        description: addForm.description || ""
      });
      showNotification("Menu item added successfully.", "success");
      setAddDialogOpen(false);
      fetchMenu();
    } catch (error) {
      console.error("Add error:", error);
      showNotification("Failed to add item. Please try again.", "error");
    }
  };

  const handleDeleteMenuItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this menu item?")) return;
    try {
      await MenuService.deleteMenuItem(id);
      showNotification("Menu item deleted.", "success");
      fetchMenu();
    } catch (error) {
      showNotification("Delete failed. Please try again.", "error");
    }
  };

  // Get unique categories for filtering
  const categories = [...new Set(menuItems.map(item => item.category))];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex", minHeight: "100vh", position: "relative", background: theme.palette.background.default }}>
        {/* Sidebar for desktop, Drawer-style for mobile */}
        <Box
          sx={{
            display: { xs: sidebarOpen ? 'block' : 'none', sm: 'block' },
            position: { xs: 'fixed', sm: 'relative' },
            zIndex: 1200,
            height: '100vh',
            minHeight: '100vh',
            width: { xs: 240, sm: 'auto' },
            background: { xs: '#fff', sm: 'none' },
            boxShadow: { xs: 3, sm: 'none' },
            transition: 'left 0.3s',
            left: { xs: sidebarOpen ? 0 : '-100%', sm: 0 },
            top: 0,
          }}
        >
          <AdminSidebar
            open={sidebarOpen}
            toggleSidebar={() => setSidebarOpen(false)}
            sx={{
              height: '100vh',
              minHeight: '100vh',
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
            width: 48,
            height: 48,
            borderRadius: '50%',
            boxShadow: 3,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MenuIcon />
        </Button>
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            p: { xs: 1, sm: 3 },
            backgroundColor: "background.default",
            minHeight: "100vh",
            width: '100%',
          }}
        >
          <Container maxWidth="lg" sx={{ py: 4 }}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                mb: 4, 
                borderRadius: 2,
                backgroundColor: '#fff'
              }}
            >
              <Box sx={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                mb: 2 
              }}>
                <Typography variant="h4" color="primary">
                  Menu Management
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<AddIcon />}
                  onClick={handleAddOpen}
                >
                  Add New Item
                </Button>
              </Box>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                {menuItems.map((item) => (
                  <Grid item xs={12} sm={6} md={4} key={item.item_id}>
                    <Card>
                      <CardMedia
                        component="img"
                        height="180"
                        image={item.image_url}
                        alt={item.name}
                        sx={{ objectFit: "cover" }}
                      />
                      <CardContent>
                        <Typography variant="h6">{item.name}</Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ mb: 1 }}
                        >
                          {item.category}
                        </Typography>
                        <Typography variant="subtitle1" color="primary" fontWeight="medium">
                          LKR {Number(item.price).toLocaleString()}
                        </Typography>
                        {item.description && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, height: 40, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.description}
                          </Typography>
                        )}
                      </CardContent>
                      <CardActions sx={{ justifyContent: 'flex-end' }}>
                        <IconButton 
                          onClick={() => handleEditOpen(item)}
                          color="primary"
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          color="error" 
                          size="small" 
                          onClick={() => handleDeleteMenuItem(item.item_id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Container>

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
                    onChange={e => setIngredientForm(f => ({ ...f, quantity_required: e.target.value }))}
                    sx={{ minWidth: 140 }}
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
                              onChange={e => setIngredientEdit(edit => ({ ...edit, quantity_required: e.target.value }))}
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
              <Typography>
                Are you sure you want to remove this ingredient from the menu item?
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setIngredientDelete(null)}>Cancel</Button>
              <Button color="error" variant="contained" onClick={handleDeleteMenuItemIngredient}>Delete</Button>
            </DialogActions>
          </Dialog>

          {/* Edit Dialog */}
          <Dialog 
            open={editDialogOpen} 
            onClose={() => setEditDialogOpen(false)} 
            maxWidth="sm" 
            fullWidth
            PaperProps={{
              sx: { borderRadius: 2 }
            }}
          >
            <DialogTitle sx={{ pb: 1 }}>
              <Typography variant="h5" fontWeight="medium">Edit Menu Item</Typography>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 0.5 }}>
                <Grid item xs={12}>
                  <TextField
                    label="Name"
                    fullWidth
                    name="name"
                    value={editForm.name}
                    onChange={handleEditChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Price (LKR)"
                    fullWidth
                    name="price"
                    type="number"
                    value={editForm.price}
                    onChange={handleEditChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Category</InputLabel>
                    <Select
                      name="category"
                      value={editForm.category}
                      label="Category"
                      onChange={handleEditChange}
                    >
                      <MenuItem value="Main-Dishes">Main Dishes</MenuItem>
                      <MenuItem value="Sea-Food">Sea Food</MenuItem>
                      <MenuItem value="Desserts">Desserts</MenuItem>
                      <MenuItem value="Beverage">Beverage</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Description"
                    fullWidth
                    multiline
                    rows={3}
                    name="description"
                    value={editForm.description}
                    onChange={handleEditChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<CloudUploadIcon />}
                      disabled={imageUploading}
                      fullWidth
                      sx={{ py: 1.5 }}
                    >
                      {imageUploading ? "Uploading..." : "Change Image"}
                      <input type="file" accept="image/*" hidden onChange={handleEditImage} />
                    </Button>
                  </Box>
                  {editForm.image_url && (
                    <Paper variant="outlined" sx={{ p: 1, mt: 2, borderRadius: 2 }}>
                      <img 
                        src={editForm.image_url} 
                        alt="Preview" 
                        style={{ 
                          width: "100%", 
                          height: 180, 
                          objectFit: "cover",
                          borderRadius: 8 
                        }} 
                      />
                    </Paper>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button 
                onClick={() => setEditDialogOpen(false)}
                variant="outlined"
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                onClick={handleEditSubmit} 
                disabled={imageUploading}
              >
                Save Changes
              </Button>
            </DialogActions>
          </Dialog>

          {/* Add Dialog */}
          <Dialog 
            open={addDialogOpen} 
            onClose={() => setAddDialogOpen(false)} 
            maxWidth="sm" 
            fullWidth
            PaperProps={{
              sx: { borderRadius: 2 }
            }}
          >
            <DialogTitle sx={{ pb: 1 }}>
              <Typography variant="h5" fontWeight="medium">Add New Menu Item</Typography>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 0.5 }}>
                <Grid item xs={12}>
                  <TextField
                    label="Name"
                    fullWidth
                    name="name"
                    value={addForm.name}
                    onChange={handleAddChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Price (LKR)"
                    fullWidth
                    name="price"
                    type="number"
                    value={addForm.price}
                    onChange={handleAddChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Category</InputLabel>
                    <Select
                      name="category"
                      value={addForm.category}
                      label="Category"
                      onChange={handleAddChange}
                    >
                      <MenuItem value="Main-Dishes">Main Dishes</MenuItem>
                      <MenuItem value="Sea-Food">Sea Food</MenuItem>
                      <MenuItem value="Desserts">Desserts</MenuItem>
                      <MenuItem value="Beverage">Beverage</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Description"
                    fullWidth
                    multiline
                    rows={3}
                    name="description"
                    value={addForm.description}
                    onChange={handleAddChange}
                    variant="outlined"
                    placeholder="Enter a brief description (optional)"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<CloudUploadIcon />}
                      disabled={imageUploading}
                      fullWidth
                      sx={{ py: 1.5 }}
                    >
                      {imageUploading ? "Uploading..." : "Upload Image"}
                      <input type="file" accept="image/*" hidden onChange={handleAddImage} />
                    </Button>
                  </Box>
                  {addForm.image_url && (
                    <Paper variant="outlined" sx={{ p: 1, mt: 2, borderRadius: 2 }}>
                      <img 
                        src={addForm.image_url} 
                        alt="Preview" 
                        style={{ 
                          width: "100%", 
                          height: 180, 
                          objectFit: "cover",
                          borderRadius: 8 
                        }} 
                      />
                    </Paper>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button 
                onClick={() => setAddDialogOpen(false)}
                variant="outlined"
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                onClick={handleAddSubmit} 
                disabled={imageUploading}
              >
                Add Item
              </Button>
            </DialogActions>
          </Dialog>

          {/* Notification */}
          <Snackbar
            open={!!notification}
            autoHideDuration={4000}
            onClose={() => setNotification(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Alert 
              onClose={() => setNotification(null)} 
              severity={notificationSeverity} 
              variant="filled"
              sx={{ width: '100%' }}
            >
              {notification}
            </Alert>
          </Snackbar>
        </Box>
      </Box>
    </ThemeProvider>
  );
}