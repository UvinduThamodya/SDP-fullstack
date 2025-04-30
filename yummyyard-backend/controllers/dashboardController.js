const db = require('../config/db');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Get ingredients with stock levels below threshold
const getLowStockItems = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT inventory_id, item_name, quantity, threshold, unit FROM Inventory WHERE quantity < threshold'
    );
    res.json({ success: true, ingredients: rows });
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch low stock items' });
  }
};

// Get top 3 ordered menu items
const getTopOrderedItems = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT m.item_id AS id, m.name, m.price, m.category,
             COUNT(oi.order_item_id) AS order_count,
             SUM(oi.subtotal) AS total_revenue
      FROM OrderItems oi
      JOIN MenuItems m ON oi.item_id = m.item_id
      JOIN Orders o ON oi.order_id = o.order_id
      WHERE o.status = 'Completed'
      GROUP BY m.item_id
      ORDER BY order_count DESC
      LIMIT 3
    `);
    res.json({ success: true, items: rows });
  } catch (error) {
    console.error('Error fetching top ordered items:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch top ordered items' });
  }
};

// Get least ordered menu item
const getLeastOrderedItem = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT m.item_id AS id, m.name, m.price, m.category,
             COUNT(oi.order_item_id) AS order_count
      FROM MenuItems m
      LEFT JOIN OrderItems oi ON m.item_id = oi.item_id
      LEFT JOIN Orders o ON oi.order_id = o.order_id
      GROUP BY m.item_id
      ORDER BY order_count ASC
      LIMIT 1
    `);
    res.json({ success: true, item: rows[0] });
  } catch (error) {
    console.error('Error fetching least ordered item:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch least ordered item' });
  }
};


// Get all inventory items
const getAllInventory = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Inventory ORDER BY item_name');
    res.json({ success: true, ingredients: rows });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch inventory' });
  }
};

const createStockOrder = async (req, res) => {
  const { items, totalAmount } = req.body;
  const staffId = req.user.id;
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, error: 'Invalid stock order items' });
  }

  // Calculate totalAmount if not provided or invalid
  let total = Number(totalAmount);
  if (!total || isNaN(total)) {
    total = items.reduce((sum, item) => sum + (Number(item.total_price) || 0), 0);
  }
  if (!total) {
    return res.status(400).json({ success: false, error: 'Total amount cannot be zero or null' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Create stock order record
    const [orderResult] = await connection.query(
      'INSERT INTO StockOrders (staff_id, total_amount, order_date) VALUES (?, ?, NOW())',
      [staffId, total]
    );
    const stockOrderId = orderResult.insertId;

    // Add stock order items
    for (const item of items) {
      await connection.query(
        'INSERT INTO StockOrderItems (stock_order_id, inventory_id, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)',
        [stockOrderId, item.ingredient_id, item.quantity, item.unit_price, item.total_price]
      );
      await connection.query(
        'UPDATE Inventory SET quantity = quantity + ? WHERE inventory_id = ?',
        [item.quantity, item.ingredient_id]
      );
    }

    await connection.commit();
    res.status(201).json({ success: true, message: 'Stock order created successfully', stockOrderId });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating stock order:', error);
    res.status(500).json({ success: false, error: 'Failed to create stock order' });
  } finally {
    connection.release();
  }
};


const downloadStockOrderReceipt = async (req, res) => {
  try {
    const stockOrderId = req.params.orderId;
    // Fetch stock order
    const [orderRows] = await db.query(
      `SELECT s.stock_order_id, s.order_date, s.total_amount, e.name AS staff_name
       FROM StockOrders s
       JOIN Employees e ON s.staff_id = e.employee_id
       WHERE s.stock_order_id = ?`,
      [stockOrderId]
    );
    if (!orderRows.length) {
      return res.status(404).json({ error: 'Stock order not found' });
    }
    const order = orderRows[0];

    // Fetch order items
    const [itemRows] = await db.query(
      `SELECT i.item_name, soi.quantity, i.unit, soi.unit_price, soi.total_price
       FROM StockOrderItems soi
       JOIN Inventory i ON soi.inventory_id = i.inventory_id
       WHERE soi.stock_order_id = ?`,
      [stockOrderId]
    );

    // Create PDF
    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=stock-order-${stockOrderId}.pdf`);

    doc.pipe(res);

    // Header
    doc.fontSize(20).text('YummyYard', { align: 'center' });
    doc.fontSize(14).text('Stock Order Receipt', { align: 'center' });
    doc.moveDown();

    // Order Info
    doc.fontSize(12).text(`Stock Order ID: ${order.stock_order_id}`);
    doc.text(`Date: ${new Date(order.order_date).toLocaleString()}`);
    doc.text(`Staff: ${order.staff_name}`);
    doc.moveDown();

    // Table Header
    doc.font('Helvetica-Bold');
    doc.text('Ingredient', 50, doc.y, { width: 130 });
    doc.text('Qty', 200, doc.y, { width: 50, align: 'right' });
    doc.text('Unit', 260, doc.y, { width: 50, align: 'right' });
    doc.text('Unit Price', 320, doc.y, { width: 80, align: 'right' });
    doc.text('Total', 410, doc.y, { width: 80, align: 'right' });
    doc.moveDown(0.5);
    doc.font('Helvetica');

    // Table Rows
    itemRows.forEach(item => {
      doc.text(item.item_name, 50, doc.y, { width: 130 });
      doc.text(item.quantity.toString(), 200, doc.y, { width: 50, align: 'right' });
      doc.text(item.unit, 260, doc.y, { width: 50, align: 'right' });
      doc.text(`LKR ${Number(item.unit_price).toLocaleString()}`, 320, doc.y, { width: 80, align: 'right' });
      doc.text(`LKR ${Number(item.total_price).toLocaleString()}`, 410, doc.y, { width: 80, align: 'right' });
      doc.moveDown(0.5);
    });

    doc.moveDown();
    doc.font('Helvetica-Bold').text(`Total Amount: LKR ${Number(order.total_amount).toLocaleString()}`, { align: 'right' });
    doc.moveDown(2);
    doc.font('Helvetica').fontSize(10).text('Thank you for keeping our inventory stocked!', { align: 'center' });

    doc.end();
  } catch (error) {
    console.error('Error generating stock order receipt:', error);
    res.status(500).json({ error: 'Failed to generate stock order receipt' });
  }
};

module.exports = {
  getLowStockItems,
  getTopOrderedItems,
  getLeastOrderedItem,
  createStockOrder,
  downloadStockOrderReceipt,
  getAllInventory

};