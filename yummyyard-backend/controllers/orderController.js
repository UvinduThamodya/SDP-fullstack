
// // const db = require('../config/db');
// // const { v4: uuidv4 } = require('uuid');

// // const createOrder = async (req, res) => {
// //   const connection = await db.getConnection();
// //   try {
// //     await connection.beginTransaction();

// //     // 1. Get user info from JWT
// //     const userRole = req.user.role;
// //     const userId = req.user.id;
// //     const { items, payment } = req.body;

// //     // 2. Validate input
// //     if (!items || !Array.isArray(items) || items.length === 0) {
// //       return res.status(400).json({ error: 'Invalid order items' });
// //     }

// //     // 3. Create order record
// //     const [orderResult] = await connection.query(
// //       `INSERT INTO Orders 
// //       (customer_id, staff_id, total_amount, status) 
// //       VALUES (?, ?, ?, ?)`,
// //       [
// //         userRole === 'customer' ? userId : null,  // Set customer_id if customer
// //         userRole === 'Staff' ? userId : null,     // Set staff_id if staff
// //         payment.amount,
// //         userRole === 'Staff' ? 'Completed' : 'Pending'
// //       ]
// //     );
// //     const orderId = orderResult.insertId;

// //     // 4. Add order items
// //     for (const item of items) {
// //       await connection.query(
// //         `INSERT INTO OrderItems 
// //         (order_id, item_id, quantity, subtotal) 
// //         VALUES (?, ?, ?, ?)`,
// //         [
// //           orderId,
// //           item.item_id || item.itemId,
// //           item.quantity,
// //           item.price * item.quantity
// //         ]
// //       );
// //     }

// //     // 5. Generate payment ID (Stripe ID for cards, UUID for cash)
// //     const paymentId = payment.method === 'card' 
// //       ? payment.stripeToken 
// //       : `cash-${uuidv4()}`;

// //     // 6. Record payment
// //     await connection.query(
// //       `INSERT INTO Payments 
// //       (order_id, amount, method, payment_id) 
// //       VALUES (?, ?, ?, ?)`,
// //       [
// //         orderId,
// //         payment.amount,
// //         payment.method,
// //         paymentId
// //       ]
// //     );

// //     // 7. Clear cart only for customers
// //     if (userRole === 'customer') {
// //       const [cartResult] = await connection.query(
// //         'SELECT cart_id FROM Cart WHERE customer_id = ?',
// //         [userId]
// //       );
      
// //       if (cartResult?.length > 0) {
// //         await connection.query(
// //           'DELETE FROM CartItems WHERE cart_id = ?',
// //           [cartResult[0].cart_id]
// //         );
// //       }
// //     }

// //     await connection.commit();
    
// //     res.status(201).json({
// //       success: true,
// //       message: 'Order created successfully',
// //       orderId,
// //       orderType: userRole
// //     });

// //   } catch (error) {
// //     await connection.rollback();
// //     console.error('Order creation error:', error);
// //     res.status(500).json({
// //       success: false,
// //       error: 'Order processing failed',
// //       details: error.message
// //     });
// //   } finally {
// //     connection.release();
// //   }
// // };

// // module.exports = { createOrder };


// const db = require('../config/db');
// const { v4: uuidv4 } = require('uuid');
// const PDFDocument = require('pdfkit');

// // Existing createOrder function
// const createOrder = async (req, res) => {
//   const connection = await db.getConnection();
//   try {
//     await connection.beginTransaction();

//     // 1. Get user info from JWT
//     const userRole = req.user.role;
//     const userId = req.user.id;
//     const { items, payment } = req.body;

//     // 2. Validate input
//     if (!items || !Array.isArray(items) || items.length === 0) {
//       return res.status(400).json({ error: 'Invalid order items' });
//     }

//     // 3. Create order record
//     const [orderResult] = await connection.query(
//       `INSERT INTO Orders 
//       (customer_id, staff_id, total_amount, status) 
//       VALUES (?, ?, ?, ?)`,
//       [
//         userRole === 'customer' ? userId : null,  // Set customer_id if customer
//         userRole === 'Staff' ? userId : null,     // Set staff_id if staff
//         payment.amount,
//         userRole === 'Staff' ? 'Completed' : 'Pending'
//       ]
//     );
//     const orderId = orderResult.insertId;

//     // 4. Add order items
//     for (const item of items) {
//       await connection.query(
//         `INSERT INTO OrderItems 
//         (order_id, item_id, quantity, subtotal) 
//         VALUES (?, ?, ?, ?)`,
//         [
//           orderId,
//           item.item_id || item.itemId,
//           item.quantity,
//           item.price * item.quantity
//         ]
//       );
//     }

//     // 5. Generate payment ID (Stripe ID for cards, UUID for cash)
//     const paymentId = payment.method === 'card' 
//       ? payment.stripeToken 
//       : `cash-${uuidv4()}`;

//     // 6. Record payment
//     await connection.query(
//       `INSERT INTO Payments 
//       (order_id, amount, method, payment_id) 
//       VALUES (?, ?, ?, ?)`,
//       [
//         orderId,
//         payment.amount,
//         payment.method,
//         paymentId
//       ]
//     );

//     // 7. Clear cart only for customers
//     if (userRole === 'customer') {
//       const [cartResult] = await connection.query(
//         'SELECT cart_id FROM Cart WHERE customer_id = ?',
//         [userId]
//       );
      
//       if (cartResult?.length > 0) {
//         await connection.query(
//           'DELETE FROM CartItems WHERE cart_id = ?',
//           [cartResult[0].cart_id]
//         );
//       }
//     }

//     await connection.commit();
    
//     res.status(201).json({
//       success: true,
//       message: 'Order created successfully',
//       orderId,
//       orderType: userRole
//     });

//   } catch (error) {
//     await connection.rollback();
//     console.error('Order creation error:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Order processing failed',
//       details: error.message
//     });
//   } finally {
//     connection.release();
//   }
// };

// // New function: Get order history for logged-in customer
// const getCustomerOrders = async (req, res) => {
//   try {
//     const customerId = req.user.id;
    
//     const [orders] = await db.query(
//       `SELECT o.order_id, o.order_date, o.total_amount, o.status, 
//        p.payment_id, p.method AS payment_method, p.payment_date 
//        FROM Orders o
//        LEFT JOIN Payments p ON o.order_id = p.order_id
//        WHERE o.customer_id = ?
//        ORDER BY o.order_date DESC`,
//       [customerId]
//     );
    
//     res.json(orders);
//   } catch (error) {
//     console.error('Error fetching customer orders:', error);
//     res.status(500).json({ error: 'Failed to retrieve order history' });
//   }
// };

// // New function: Get details for a specific order
// const getOrderDetails = async (req, res) => {
//   try {
//     const { orderId } = req.params;
//     const customerId = req.user.id;
    
//     // Get basic order info
//     const [orderInfo] = await db.query(
//       `SELECT o.*, c.name AS customer_name, c.email, c.phone, c.address, 
//        p.method AS payment_method, p.payment_date
//        FROM Orders o
//        JOIN Customers c ON o.customer_id = c.customer_id
//        LEFT JOIN Payments p ON o.order_id = p.order_id
//        WHERE o.order_id = ?`,
//       [orderId]
//     );
    
//     if (!orderInfo.length) {
//       return res.status(404).json({ error: 'Order not found' });
//     }
    
//     // Verify this order belongs to the customer (unless admin/staff)
//     if (req.user.role === 'customer' && orderInfo[0].customer_id !== customerId) {
//       return res.status(403).json({ error: 'Not authorized to view this order' });
//     }
    
//     // Get order items
//     const [orderItems] = await db.query(
//       `SELECT oi.*, m.name, m.price, m.description, m.category
//        FROM OrderItems oi
//        JOIN MenuItems m ON oi.item_id = m.item_id
//        WHERE oi.order_id = ?`,
//       [orderId]
//     );
    
//     res.json({
//       orderInfo: orderInfo[0],
//       items: orderItems
//     });
//   } catch (error) {
//     console.error('Error fetching order details:', error);
//     res.status(500).json({ error: 'Failed to retrieve order details' });
//   }
// };

// // New function: Generate PDF receipt for an order
// const generateOrderReceipt = async (req, res) => {
//   try {
//     const { orderId } = req.params;
//     const customerId = req.user.id;
    
//     // Get order details
//     const [orderInfo] = await db.query(
//       `SELECT o.*, c.name AS customer_name, c.email, c.phone, c.address, 
//        p.method AS payment_method, p.payment_date
//        FROM Orders o
//        JOIN Customers c ON o.customer_id = c.customer_id
//        LEFT JOIN Payments p ON o.order_id = p.order_id
//        WHERE o.order_id = ?`,
//       [orderId]
//     );
    
//     if (!orderInfo.length) {
//       return res.status(404).json({ error: 'Order not found' });
//     }
    
//     // Verify this order belongs to the customer (unless admin/staff)
//     if (req.user.role === 'customer' && orderInfo[0].customer_id !== customerId) {
//       return res.status(403).json({ error: 'Not authorized to access this order' });
//     }
    
//     // Get order items
//     const [orderItems] = await db.query(
//       `SELECT oi.*, m.name, m.price, m.description, m.category
//        FROM OrderItems oi
//        JOIN MenuItems m ON oi.item_id = m.item_id
//        WHERE oi.order_id = ?`,
//       [orderId]
//     );
    
//     // Create PDF document
//     const doc = new PDFDocument({ margin: 50 });
    
//     // Set response headers for PDF download
//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Content-Disposition', `attachment; filename=order-${orderId}.pdf`);
    
//     // Pipe the PDF to the response
//     doc.pipe(res);
    
//     // Add content to PDF
//     formatPDFReceipt(doc, { orderInfo: orderInfo[0], items: orderItems });
    
//     // Finalize PDF
//     doc.end();
//   } catch (error) {
//     console.error('Error generating receipt:', error);
//     res.status(500).json({ error: 'Failed to generate receipt' });
//   }
// };

// // Helper function to format PDF receipt
// const formatPDFReceipt = (doc, orderDetails) => {
//   const { orderInfo, items } = orderDetails;
  
//   // Restaurant header
//   doc.fontSize(20).text('YummyYard', { align: 'center' });
//   doc.fontSize(15).text('Order Receipt', { align: 'center' });
//   doc.moveDown();
  
//   // Order info
//   doc.fontSize(12).text(`Order ID: ${orderInfo.order_id}`);
//   doc.text(`Date: ${new Date(orderInfo.order_date).toLocaleString()}`);
//   doc.text(`Customer: ${orderInfo.customer_name}`);
//   doc.text(`Status: ${orderInfo.status}`);
//   doc.text(`Payment Method: ${orderInfo.payment_method || 'Not specified'}`);
//   doc.moveDown();
  
//   // Items table header
//   doc.fontSize(12).text('Order Items:', { underline: true });
//   doc.moveDown(0.5);
  
//   let y = doc.y;
//   doc.text("Item", 50, y);
//   doc.text("Price", 250, y);
//   doc.text("Qty", 350, y);
//   doc.text("Subtotal", 450, y);
//   doc.moveDown();
  
//   // Add a line under the header
//   y = doc.y;
//   doc.moveTo(50, y).lineTo(550, y).stroke();
//   doc.moveDown();
  
//   // Add each item
//   items.forEach(item => {
//     y = doc.y;
//     doc.text(item.name, 50, y);
//     doc.text(`LKR ${item.price.toFixed(2)}`, 250, y);
//     doc.text(item.quantity.toString(), 350, y);
//     doc.text(`LKR ${item.subtotal.toFixed(2)}`, 450, y);
//     doc.moveDown();
//   });
  
//   // Add a line after items
//   y = doc.y;
//   doc.moveTo(50, y).lineTo(550, y).stroke();
//   doc.moveDown();
  
//   // Total
//   doc.fontSize(12).text(`Total Amount: LKR ${orderInfo.total_amount.toFixed(2)}`, { align: 'right' });
  
//   // Footer
//   doc.moveDown(2);
//   doc.fontSize(10).text('Thank you for your order!', { align: 'center' });
//   doc.text('Visit us again at YummyYard', { align: 'center' });
// };

// module.exports = {
//   createOrder,
//   getCustomerOrders,
//   getOrderDetails,
//   generateOrderReceipt
// };


const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const PDFDocument = require('pdfkit');


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
      await connection.rollback();
      return res.status(400).json({ error: 'Invalid order items' });
    }
    if (!payment || !payment.method || payment.amount === undefined) {
      await connection.rollback();
      return res.status(400).json({ error: 'Invalid payment information' });
    }

    // Normalize payment method
    const paymentMethod = payment.method.toLowerCase();

    // 3. Create order record
    const [orderResult] = await connection.query(
      `INSERT INTO Orders 
      (customer_id, staff_id, total_amount, status) 
      VALUES (?, ?, ?, ?)`,
      [
        userRole === 'customer' ? userId : null,
        (userRole === 'Staff' || userRole === 'Admin') ? userId : null,
        payment.amount,
        'Pending'
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
    const paymentId = paymentMethod === 'card'
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
        paymentMethod,
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

    // 8. Emit real-time event for staff dashboard (Socket.IO)
    try {
      // Fetch the full order (with items) to emit
      const [orderRows] = await connection.query('SELECT * FROM Orders WHERE order_id = ?', [orderId]);
      const newOrder = orderRows[0];
      req.app.get('io').emit('orderCreated', newOrder);
    } catch (emitError) {
      // Log but don't block order creation if emit fails
      console.error('Socket emit error:', emitError);
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      orderId,
      orderType: userRole
    });

  } catch (error) {
    await connection.rollback();
    console.error('Order creation error:', error);
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      res.status(400).json({
        success: false,
        error: 'Invalid item ID or customer ID',
        details: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Order processing failed',
        details: error.message
      });
    }
  } finally {
    connection.release();
  }
};


// New function: Get order history for logged-in customer
const getCustomerOrders = async (req, res) => {
  try {
    const customerId = req.user.id;
    
    const [orders] = await db.query(
      `SELECT o.order_id, o.order_date, o.total_amount, o.status, 
       p.payment_id, p.method AS payment_method, p.payment_date 
       FROM Orders o
       LEFT JOIN Payments p ON o.order_id = p.order_id
       WHERE o.customer_id = ?
       ORDER BY o.order_date DESC`,
      [customerId]
    );
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    res.status(500).json({ error: 'Failed to retrieve order history' });
  }
};

// New function: Get details for a specific order
const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const customerId = req.user.id;
    
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
    
    if (!orderInfo.length) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Verify this order belongs to the customer (unless admin/staff)
    if (req.user.role === 'customer' && orderInfo[0].customer_id !== customerId) {
      return res.status(403).json({ error: 'Not authorized to view this order' });
    }
    
    // Get order items
    const [orderItems] = await db.query(
      `SELECT oi.*, m.name, m.price, m.description, m.category
       FROM OrderItems oi
       JOIN MenuItems m ON oi.item_id = m.item_id
       WHERE oi.order_id = ?`,
      [orderId]
    );
    
    res.json({
      orderInfo: orderInfo[0],
      items: orderItems
    });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ error: 'Failed to retrieve order details' });
  }
};

// New function: Generate PDF receipt for an order
const generateOrderReceipt = async (req, res) => {
  try {
    // Set CORS headers for PDF downloads
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    const { orderId } = req.params;
    const customerId = req.user.id;
    
    console.log(`Generating receipt for order ${orderId} requested by user ${customerId}`);
    
    // Get order details
    const [orderInfo] = await db.query(
      `SELECT o.*, c.name AS customer_name, c.email, c.phone, c.address, 
       p.method AS payment_method, p.payment_date
       FROM Orders o
       JOIN Customers c ON o.customer_id = c.customer_id
       LEFT JOIN Payments p ON o.order_id = p.order_id
       WHERE o.order_id = ?`,
      [orderId]
    );
    
    if (!orderInfo || orderInfo.length === 0) {
      console.error(`Order ${orderId} not found`);
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Get order items with better error handling
    const [orderItems] = await db.query(
      `SELECT oi.*, m.name, m.price, m.description, m.category
       FROM OrderItems oi
       LEFT JOIN MenuItems m ON oi.item_id = m.item_id
       WHERE oi.order_id = ?`,
      [orderId]
    );
    
    console.log(`Found ${orderItems.length} items for order ${orderId}`);
    
    // Create PDF document
    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=order-${orderId}.pdf`);
    
    // Pipe the PDF to the response
    doc.pipe(res);
    
    // Format the PDF with better error handling
    try {
      formatPDFReceipt(doc, { orderInfo: orderInfo[0], items: orderItems });
    } catch (formatError) {
      console.error('Error formatting PDF:', formatError);
      // Create a simple error PDF instead of failing completely
      doc.fontSize(16).text('Error generating receipt', { align: 'center' });
      doc.fontSize(12).text(`Order ID: ${orderId}`, { align: 'center' });
      doc.fontSize(12).text('Please contact support for assistance.', { align: 'center' });
    }
    
    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error('Error generating receipt:', error);
    res.status(500).json({ error: 'Failed to generate receipt' });
  }
};


// Helper function to format PDF receipt
const formatPDFReceipt = (doc, orderDetails) => {
  try {
    const orderInfo = orderDetails.orderInfo || {};
    const items = orderDetails.items || [];

    // Header
    doc.fontSize(20).text('YummyYard', { align: 'center' });
    doc.fontSize(15).text('Order Receipt', { align: 'center' });
    doc.moveDown();
    
    // Order Info
    doc.fontSize(12).text(`Order ID: ${orderInfo.order_id || 'N/A'}`);
    doc.text(`Date: ${orderInfo.order_date ? new Date(orderInfo.order_date).toLocaleString() : 'N/A'}`);
    doc.text(`Customer: ${orderInfo.customer_name || 'N/A'}`);
    doc.text(`Status: ${orderInfo.status || 'N/A'}`);
    doc.text(`Payment Method: ${orderInfo.payment_method || 'Not specified'}`);
    doc.moveDown();
    
    // Items table header
    doc.fontSize(12).text('Order Items:', { underline: true });
    doc.moveDown(0.5);
    
    let y = doc.y;
    doc.text("Item", 50, y);
    doc.text("Price", 250, y);
    doc.text("Qty", 350, y);
    doc.text("Subtotal", 450, y);
    doc.moveDown();
    
    // Add a line under the header
    y = doc.y;
    doc.moveTo(50, y).lineTo(550, y).stroke();
    doc.moveDown();
    
    // Add each item with error handling
    if (items && items.length > 0) {
      items.forEach(item => {
        y = doc.y;
        const name = item.name || 'Unknown Item';
        const price = parseFloat(item.price) || 0;
        const quantity = parseInt(item.quantity) || 0;
        const subtotal = parseFloat(item.subtotal) || (price * quantity);
        
        doc.text(name, 50, y);
        doc.text(`LKR ${price.toFixed(2)}`, 250, y);
        doc.text(quantity.toString(), 350, y);
        doc.text(`LKR ${subtotal.toFixed(2)}`, 450, y);
        doc.moveDown();
      });
    } else {
      doc.text("No items found", 50, doc.y);
      doc.moveDown();
    }
    
    // Add a line after items
    y = doc.y;
    doc.moveTo(50, y).lineTo(550, y).stroke();
    doc.moveDown();
    
    // Total
    const totalAmount = parseFloat(orderInfo.total_amount) || 0;
    doc.fontSize(12).text(`Total Amount: LKR ${totalAmount.toFixed(2)}`, { align: 'right' });
    
    // Footer
    doc.moveDown(2);
    doc.fontSize(10).text('Thank you for your order!', { align: 'center' });
    doc.text('Visit us again at YummyYard', { align: 'center' });
  } catch (error) {
    console.error("Error formatting PDF:", error);
    doc.fontSize(12).text("Error generating receipt. Please contact support.", { align: 'center' });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    // Update order in the database
    await db.query('UPDATE Orders SET status = ? WHERE order_id = ?', [status, orderId]);

    // Fetch the updated order
    const [orderRows] = await db.query('SELECT * FROM Orders WHERE order_id = ?', [orderId]);
    if (!orderRows.length) {
      return res.status(404).json({ error: 'Order not found' });
    }
    const updatedOrder = orderRows[0];

    // Emit event to all staff dashboards
    req.app.get('io').emit('orderUpdated', updatedOrder);

    res.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};

// Get all orders
const getAllOrders = async (req, res) => {
  try {
    // Fetch all orders with customer and staff details
    const [orders] = await db.query(`
      SELECT o.*, c.name AS customer_name, s.name AS staff_name
      FROM Orders o
      LEFT JOIN Customers c ON o.customer_id = c.customer_id
      LEFT JOIN Employees s ON o.staff_id = s.employee_id
      ORDER BY o.order_date DESC
    `);

    res.json({ orders });
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

const generateOrderReport = async (req, res) => {
  try {
    // Fetch all orders with customer/staff info
    const [orders] = await db.query(`
      SELECT o.order_id, o.order_date, o.total_amount, o.status, 
             c.name AS customer_name, e.name AS staff_name
      FROM Orders o
      LEFT JOIN Customers c ON o.customer_id = c.customer_id
      LEFT JOIN Employees e ON o.staff_id = e.employee_id
      ORDER BY o.order_date DESC
    `);
    
    // Create PDF document
    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=order-history-report.pdf');
    
    // Pipe the PDF to the response
    doc.pipe(res);
    
    // Add content to PDF
    doc.fontSize(20).text('YummyYard', { align: 'center' });
    doc.fontSize(15).text('Order History Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`);
    doc.moveDown();
    
    // Add table headers
    let y = doc.y;
    doc.text('Order ID', 50, y);
    doc.text('Date', 120, y);
    doc.text('Customer/Staff', 220, y);
    doc.text('Status', 350, y);
    doc.text('Amount', 450, y);
    doc.moveDown();
    
    // Add a line under the header
    y = doc.y;
    doc.moveTo(50, y).lineTo(550, y).stroke();
    doc.moveDown();
    
    // Add each order
    orders.forEach(order => {
      y = doc.y;
      doc.text(order.order_id.toString(), 50, y);
      doc.text(new Date(order.order_date).toLocaleDateString(), 120, y);
      doc.text(order.customer_name || order.staff_name || 'Unknown', 220, y);
      doc.text(order.status, 350, y);
      doc.text(`LKR ${parseFloat(order.total_amount || 0).toFixed(2)}`, 450, y);
      doc.moveDown();
    });
    
    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error('Error generating order report:', error);
    res.status(500).json({ error: 'Failed to generate order report' });
  }
};


module.exports = {
  createOrder,
  getCustomerOrders,
  getOrderDetails,
  generateOrderReceipt,
  getAllOrders,
  generateOrderReport,
  updateOrderStatus
};
