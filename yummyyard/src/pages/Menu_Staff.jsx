import Sidebar from '../components/Sidebar'; 
import React, { useState, useEffect } from 'react';
import MenuService from '../services/menuService';
import {
  Container,
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Button,
  Tabs,
  Tab,
  Rating,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

const formatCurrency = (price, currency = 'LKR', locale = 'en-LK') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(price);
};

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [newMenuItem, setNewMenuItem] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: null,
  });
  const [selectedCategory, setSelectedCategory] = useState('Main-Dishes');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMenuItem((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setNewMenuItem((prev) => ({
      ...prev,
      image: e.target.files[0],
    }));
  };

  const handleCategoryChange = (event, newCategory) => {
    setSelectedCategory(newCategory);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', newMenuItem.name);
    formData.append('description', newMenuItem.description);
    formData.append('price', newMenuItem.price);
    formData.append('category', newMenuItem.category);

    if (newMenuItem.image) {
      formData.append('image', newMenuItem.image);
    }

    try {
      const createdItem = await MenuService.createMenuItem(formData);
      setMenuItems((prev) => [...prev, createdItem]);
      setNewMenuItem({
        name: '',
        description: '',
        price: '',
        category: '',
        image: null,
      });
      alert('Menu item created successfully!');
    } catch (error) {
      alert('Failed to create menu item');
    }
  };

  const filteredItems = menuItems.filter((item) => item.category === selectedCategory);
  const displayItems = loading || filteredItems.length === 0 ? [] : filteredItems;

  if (error) {
    return <Typography color="error">Error: {error}</Typography>;
  }

  return (
    <Box sx={{ display: 'flex', backgroundColor: 'white' }}> {/* Set background color to white */}
      <Sidebar /> {/* Include the Sidebar component */}
      <Container maxWidth="lg" sx={{ pt: 5, pb: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="subtitle1" component="div" sx={{ mb: 1, color: '#8a6d3b' }}>
            FOOD MENU
          </Typography>
          <Typography variant="h2" component="h1" sx={{ fontWeight: 'bold', color: '#333' }}>
            Our Specials Menu
          </Typography>
        </Box>

        <Box sx={{ width: '100%', bgcolor: 'background.paper', mb: 5 }}>
          <Tabs value={selectedCategory} onChange={handleCategoryChange} centered>
            <Tab label="Main Dishes" value="Main-Dishes" />
            <Tab label="Sea Food" value="Sea-Food" />
            <Tab label="Desserts" value="Desserts" />
            <Tab label="Beverage" value="Beverage" />
          </Tabs>
        </Box>

        <Grid container spacing={3}>
          {displayItems.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card sx={{ display: 'flex', flexDirection: 'column' }}>
                <CardMedia component="img" height="200" image={item.image_url} alt={item.name} />
                <CardContent sx={{ flexGrow: 1, pt: 2 }}>
                  <Typography variant="h5">{item.name}</Typography>
                  <Typography variant="body2">{item.description}</Typography>
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    {formatCurrency(item.price, 'LKR', 'en-LK')} {/* Updated to LKR */}
                  </Typography>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<ShoppingCartIcon />}
                    onClick={() => console.log(`Added item ${item.id} to cart`)}
                  >
                    Add to cart
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 5 }}>
          <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
            Add a New Menu Item
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={newMenuItem.name}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={newMenuItem.description}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              fullWidth
              label="Price"
              name="price"
              value={newMenuItem.price}
              onChange={handleInputChange}
              type="number"
              sx={{ mb: 2 }}
              required
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={newMenuItem.category}
                onChange={handleInputChange}
                required
              >
                <MenuItem value="Main-Dishes">Main Dishes</MenuItem>
                <MenuItem value="Sea-Food">Sea Food</MenuItem>
                <MenuItem value="Desserts">Desserts</MenuItem>
                <MenuItem value="Beverage">Beverage</MenuItem>
              </Select>
            </FormControl>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ marginBottom: '20px' }}
            />
            <Button type="submit" variant="contained">
              Create Menu Item
            </Button>
          </form>
        </Box>
      </Container>
    </Box>
  );
};

export default Menu;
