// test-order-status.js - Test script for order status update and email notification
const dotenv = require('dotenv');
const db = require('./config/db');
const emailService = require('./services/emailService');

// Ensure environment variables are loaded
dotenv.config();

// Order ID to test with - change this to an existing order in your database
const TEST_ORDER_ID = 115;

// Status to update to - valid values: 'Accepted', 'Completed', 'Cancelled'
const NEW_STATUS = 'Accepted';

async function testOrderStatusUpdate() {
  console.log(`Starting order status update test for Order #${TEST_ORDER_ID} to ${NEW_STATUS}...`);
  
  try {
    // 1. Update the order status in the database
    console.log(`Updating order status to ${NEW_STATUS}...`);
    await db.query('UPDATE Orders SET status = ? WHERE order_id = ?', [NEW_STATUS, TEST_ORDER_ID]);
    
    // 2. Fetch the updated order with customer details
    const [orderRows] = await db.query(`
      SELECT o.*, c.name AS customer_name, c.email AS customer_email 
      FROM Orders o
      LEFT JOIN Customers c ON o.customer_id = c.customer_id
      WHERE o.order_id = ?
    `, [TEST_ORDER_ID]);
    
    if (!orderRows.length) {
      console.error('Error: Order not found!');
      process.exit(1);
    }
    
    const updatedOrder = orderRows[0];
    console.log('Order details:', {
      order_id: updatedOrder.order_id,
      customer_name: updatedOrder.customer_name,
      customer_email: updatedOrder.customer_email,
      status: updatedOrder.status,
      total_amount: updatedOrder.total_amount
    });
    
    // 3. Get order items
    const [orderItems] = await db.query(`
      SELECT oi.*, mi.name as item_name 
      FROM OrderItems oi
      JOIN MenuItems mi ON oi.item_id = mi.item_id
      WHERE oi.order_id = ?
    `, [TEST_ORDER_ID]);
    
    console.log(`Found ${orderItems.length} items in the order`);
    
    // 4. Prepare order data for the email
    const orderData = {
      ...updatedOrder,
      items: orderItems.map(item => ({
        item_name: item.item_name,
        quantity: item.quantity,
        price: item.subtotal / item.quantity
      }))
    };
    
    // 5. Send email notification
    console.log('Sending email notification...');
    const emailResult = await emailService.notifyOrderStatusChange(orderData, NEW_STATUS);
    
    if (emailResult) {
      console.log(`✓ Email notification sent successfully to ${updatedOrder.customer_email}`);
    } else {
      console.error(`✗ Failed to send email notification`);
    }
    
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    // Close database connection
    db.end();
  }
}

// Run the test
testOrderStatusUpdate();
