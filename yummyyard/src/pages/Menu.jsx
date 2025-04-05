import Sidebar from '../components/Sidebar';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Grid,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const formatCurrency = (price, currency = 'LKR', locale = 'en-LK') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(price);
};

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Main-Dishes');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Check for authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (!token || !storedUser) {
      // If no token or user, redirect to login page
      navigate('/login');
      return;
    }
    
    setUser(JSON.parse(storedUser));
  }, [navigate]);

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

  const handleAddToCart = async (itemId) => {
    console.log("Adding to cart, itemId:", itemId);
    
    if (!user) {
      alert("Please login to add items to your cart");
      navigate('/login');
      return;
    }
    
    if (!itemId) {
      alert("Cannot add to cart: Item ID is missing");
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          itemId,
          quantity: 1,
          // customerId is no longer needed here as it will be extracted from the token on the server
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add to cart');
      }
      
      const data = await response.json();
      setCart(data.cartItems);
      alert('Item added to cart successfully!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      
      if (error.message === 'Not authorized' || error.message === 'Token is invalid') {
        // Handle auth errors
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        alert(`Failed to add item to cart: ${error.message}`);
      }
    }
  };

  const filteredItems = menuItems.filter((item) => item.category === selectedCategory);
  const displayItems = loading || filteredItems.length === 0 ? [] : filteredItems;

  if (error) {
    return <Typography color="error">Error: {error}</Typography>;
  }

  const CartSummary = () => (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6">Cart ({cart.length} items)</Typography>
      <List>
        {cart.map((cartItem) => (
          <ListItem key={cartItem.cart_item_id}>
            <ListItemText
              primary={cartItem.name}
              secondary={`${formatCurrency(cartItem.price)} x ${cartItem.quantity}`}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  // If user isn't loaded yet, don't render the full component
  if (!user) {
    return <Typography>Loading user data...</Typography>;
  }

  return (
    <Box sx={{ display: 'flex', backgroundColor: 'white' }}>
      <Sidebar />
      <Container maxWidth="lg" sx={{ pt: 5, pb: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="subtitle1" component="div" sx={{ mb: 1, color: '#8a6d3b' }}>
            FOOD MENU
          </Typography>
          <Typography variant="h2" component="h1" sx={{ fontWeight: 'bold', color: '#333' }}>
            Our Specials Menu
          </Typography>
          <Typography variant="subtitle1" color="primary">
            Welcome, {user.name}!
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
            <Grid item xs={12} sm={6} md={4} key={item.item_id}>
              <Card sx={{ display: 'flex', flexDirection: 'column' }}>
              <CardMedia 
              component="img" 
               height="200" 
              image={item.image_url.startsWith('/') ? `http://localhost:5000${item.image_url}` : `/assets/${item.image_url}`} 
               alt={item.name}
              onError={(e) => {
                 e.target.onerror = null;
                e.target.src = "../public/Background.jpg"; // Fallback image if loading fails
                }}
                />
                <CardContent sx={{ flexGrow: 1, pt: 2 }}>
                  <Typography variant="h5">{item.name}</Typography>
                  <Typography variant="body2">{item.description}</Typography>
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    {formatCurrency(item.price, 'LKR', 'en-LK')}
                  </Typography>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<ShoppingCartIcon />}
                    onClick={() => handleAddToCart(item.item_id)}
                  >
                    Add to cart
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <CartSummary />
      </Container>
    </Box>
  );
};

export default Menu;
