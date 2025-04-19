
const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const createOrder = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Get user info from JWT
    const userRole = req.user.role;
    const userId = req.user.id;
    const { items, payment } = req.body;

    // 2. Validate input
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Invalid order items' });
    }

    // 3. Create order record
    const [orderResult] = await connection.query(
      `INSERT INTO Orders 
      (customer_id, staff_id, total_amount, status) 
      VALUES (?, ?, ?, ?)`,
      [
        userRole === 'customer' ? userId : null,  // Set customer_id if customer
        userRole === 'Staff' ? userId : null,     // Set staff_id if staff
        payment.amount,
        userRole === 'Staff' ? 'Completed' : 'Pending'
      ]
    );
    const orderId = orderResult.insertId;

    // 4. Add order items
    for (const item of items) {
      await connection.query(
        `INSERT INTO OrderItems 
        (order_id, item_id, quantity, subtotal) 
        VALUES (?, ?, ?, ?)`,
        [
          orderId,
          item.item_id || item.itemId,
          item.quantity,
          item.price * item.quantity
        ]
      );
    }

    // 5. Generate payment ID (Stripe ID for cards, UUID for cash)
    const paymentId = payment.method === 'card' 
      ? payment.stripeToken 
      : `cash-${uuidv4()}`;

    // 6. Record payment
    await connection.query(
      `INSERT INTO Payments 
      (order_id, amount, method, payment_id) 
      VALUES (?, ?, ?, ?)`,
      [
        orderId,
        payment.amount,
        payment.method,
        paymentId
      ]
    );

    // 7. Clear cart only for customers
    if (userRole === 'customer') {
      const [cartResult] = await connection.query(
        'SELECT cart_id FROM Cart WHERE customer_id = ?',
        [userId]
      );
      
      if (cartResult?.length > 0) {
        await connection.query(
          'DELETE FROM CartItems WHERE cart_id = ?',
          [cartResult[0].cart_id]
        );
      }
    }

    await connection.commit();
    
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      orderId,
      orderType: userRole
    });

  } catch (error) {
    await connection.rollback();
    console.error('Order creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Order processing failed',
      details: error.message
    });
  } finally {
    connection.release();
  }
};

module.exports = { createOrder };
