// models/orderModel.js
const db = require('../config/db');

class OrderModel {
  static async getCustomerOrders(customerId) {
    const [orders] = await db.query(
      `SELECT o.order_id, o.order_date, o.total_amount, o.status, 
       p.payment_id, p.method AS payment_method, p.payment_date 
       FROM Orders o
       LEFT JOIN Payments p ON o.order_id = p.order_id
       WHERE o.customer_id = ?
       ORDER BY o.order_date DESC`,
      [customerId]
    );
    return orders;
  }

  static async getOrderDetails(orderId) {
    // Get basic order info
    const [orderInfo] = await db.query(
      `SELECT o.*, c.name AS customer_name, c.email, c.phone, c.address, 
       p.method AS payment_method, p.payment_date
       FROM Orders o
       JOIN Customers c ON o.customer_id = c.customer_id
       LEFT JOIN Payments p ON o.order_id = p.order_id
       WHERE o.order_id = ?`,
      [orderId]
    );

    // Get order items with product details
    const [orderItems] = await db.query(
      `SELECT oi.*, m.name, m.price, m.description, m.category
       FROM OrderItems oi
       JOIN MenuItems m ON oi.item_id = m.item_id
       WHERE oi.order_id = ?`,
      [orderId]
    );

    return {
      orderInfo: orderInfo[0],
      items: orderItems
    };
  }
}

module.exports = OrderModel;
