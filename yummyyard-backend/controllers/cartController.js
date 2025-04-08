
const CartService = require('../services/cartService'); 

const addToCart = async (req, res) => {
  try {
    // Get customer ID from authenticated user instead of request body
    const customerId = req.user.id;
    const { itemId, quantity } = req.body;
    
    if (!itemId) {
      return res.status(400).json({ error: 'Item ID is required' });
    }
    
    const cartItems = await CartService.addToCart(customerId, itemId, quantity);
    res.status(200).json({ message: 'Item added to cart', cartItems });
  } catch (error) {
    console.error('Error in addToCart:', error);
    res.status(500).json({ error: 'Failed to add item to cart', details: error.message });
  }
};


const getCart = async (req, res) => {
  try {
    const { customerId } = req.params;
    const cart = await CartService.getCart(customerId);
    const cartItems = await CartService.getCartItems(cart.cart_id);
    res.status(200).json({ cart, items: cartItems });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get cart', details: error.message });
  }
};

const getCartItems = async (req, res) => {
  try {
    console.log("Getting cart items for customer:", req.user.id);
    // Your existing code
    console.log("Cart items retrieved successfully");
    res.status(200).json({ cartItems: [] });  // Return empty array to test
  } catch (error) {
    console.error("ERROR in getCartItems:", error);
    res.status(500).json({ error: 'Failed to get cart items', details: error.message });
  }
};

module.exports = { addToCart, getCart, getCartItems };