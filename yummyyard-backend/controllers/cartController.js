
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

module.exports = { addToCart, getCart };