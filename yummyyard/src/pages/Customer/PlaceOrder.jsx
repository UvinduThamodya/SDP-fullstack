import React, { useState, useEffect } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Box,
  MenuItem,
  Select,
} from "@mui/material";
import Navbar from '../../components/Navbar'; // Import the Navbar component

const PlaceOrder  = () => {
  const [quantity, setQuantity] = useState(1);
  const [customerName] = useState("John Doe");
  const [orderId] = useState(`ORD-${Date.now()}`);
  const [productName, setProductName] = useState("");
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products");
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
        // Handle error appropriately (e.g., display an error message)
      }
    };
    fetchProducts();
  }, []);

  const handleCancelOrder = () => {
    setQuantity(1);
    setProductName("");
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Poppins, sans-serif',
        minHeight: '100vh',
        backgroundSize: 'cover',
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Navbar /> {/* Add the Navbar component */}
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
        }}
      >
        <Container maxWidth="md">
          <Card sx={{ borderRadius: 3, boxShadow: 6, p: 3 }}>
            <CardContent>
              <Typography variant="h4" align="center" sx={{ mb: 3, fontWeight: 'bold' }}>
                Place Order
              </Typography>
              <TextField
                fullWidth
                label="Customer Name"
                value={customerName}
                disabled
                margin="normal"
                sx={{ mb: 3 }}
              />
              <Select
                fullWidth
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                displayEmpty
                margin="normal"
                sx={{ mb: 3 }}
              >
                <MenuItem value="" disabled>
                  Select Product
                </MenuItem>
                {products.map((product) => (
                  <MenuItem key={product.id} value={product.name}>
                    {product.name}
                  </MenuItem>
                ))}
              </Select>
              <TextField
                fullWidth
                label="Order ID"
                value={orderId}
                disabled
                margin="normal"
                sx={{ mb: 3 }}
              />
              <Typography variant="h6" sx={{ mt: 3, textAlign: 'center', fontWeight: 'bold' }}>
                Select Quantity
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
                {[1, 2, 3, 4, 5].map((num) => (
                  <Button
                    key={num}
                    variant={quantity === num ? "contained" : "outlined"}
                    onClick={() => setQuantity(num)}
                    sx={{ width: 50, height: 50 }}
                  >
                    {num}
                  </Button>
                ))}
              </Box>

              

              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, gap: 3 }}>
                <Button variant="contained" color="primary" sx={{ backgroundColor: 'black', width: 150 }}>
                  Place Order
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleCancelOrder}
                  sx={{ width: 150 }}
                >
                  Cancel Order
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </Box>
  );
};

export default PlaceOrder ;
