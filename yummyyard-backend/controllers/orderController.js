const db = require('../config/db');

const createOrder = async (req, res) => {
  try {
    const customerId = req.user.id; // From JWT token
    const { items, totalAmount } = req.body;
    
    // Insert order into database
    const [orderResult] = await db.query(
      'INSERT INTO Orders (customer_id, total_amount, order_date, status) VALUES (?, ?, NOW(), ?)',
      [customerId, totalAmount, 'Pending']
    );
    
    const orderId = orderResult.insertId;
    
    // Insert order items
    for (const item of items) {
      await db.query(
        'INSERT INTO OrderItems (order_id, item_id, quantity, subtotal) VALUES (?, ?, ?, ?)',
        [orderId, item.item_id || item.itemId, item.quantity, item.price * item.quantity]
      );
    }
    
    // Clear customer's cart after order is placed
    console.log("Customer id from JWT:", customerId);
    
    // Get the cart_id for this customer first, then delete items
    const [cartResult] = await db.query(
      'SELECT cart_id FROM Cart WHERE customer_id = ?',
      [customerId]
    );
    
    if (cartResult && cartResult.length > 0) {
      await db.query('DELETE FROM CartItems WHERE cart_id = ?', [cartResult[0].cart_id]);
    }
    
    res.status(201).json({ message: 'Order created successfully', orderId });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order', details: error.message });
  }
};


module.exports = { createOrder };
