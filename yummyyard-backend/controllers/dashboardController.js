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

// Get total sales for day, month, year
const getSalesSummary = async (req, res) => {
  try {
    // Today
    const [dayRows] = await db.query(
      "SELECT IFNULL(SUM(total_amount), 0) AS total FROM Orders WHERE DATE(order_date) = CURDATE() AND status = 'Completed'"
    );
    // This month
    const [monthRows] = await db.query(
      "SELECT IFNULL(SUM(total_amount), 0) AS total FROM Orders WHERE YEAR(order_date) = YEAR(CURDATE()) AND MONTH(order_date) = MONTH(CURDATE()) AND status = 'Completed'"
    );
    // This year
    const [yearRows] = await db.query(
      "SELECT IFNULL(SUM(total_amount), 0) AS total FROM Orders WHERE YEAR(order_date) = YEAR(CURDATE()) AND status = 'Completed'"
    );
    res.json({
      day: dayRows[0].total,
      month: monthRows[0].total,
      year: yearRows[0].total,
    });
  } catch (error) {
    console.error('Error fetching sales summary:', error);
    res.status(500).json({ error: 'Failed to fetch sales summary' });
  }
};

// Download PDF sales report for day, month, year
const downloadSalesReport = async (req, res) => {
  try {
    const { period } = req.params; // 'day', 'month', 'year'
    let query = "";
    let title = "";
    let filename = "";

    if (period === "day") {
      query = "SELECT * FROM Orders WHERE DATE(order_date) = CURDATE() AND status = 'Completed'";
      title = "Daily Sales Report";
      filename = `sales-report-${new Date().toISOString().slice(0, 10)}.pdf`;
    } else if (period === "month") {
      query = "SELECT * FROM Orders WHERE YEAR(order_date) = YEAR(CURDATE()) AND MONTH(order_date) = MONTH(CURDATE()) AND status = 'Completed'";
      title = "Monthly Sales Report";
      const month = new Date().toISOString().slice(0, 7);
      filename = `sales-report-${month}.pdf`;
    } else if (period === "year") {
      query = "SELECT * FROM Orders WHERE YEAR(order_date) = YEAR(CURDATE()) AND status = 'Completed'";
      title = "Yearly Sales Report";
      filename = `sales-report-${new Date().getFullYear()}.pdf`;
    } else {
      return res.status(400).json({ error: "Invalid period" });
    }

    const [orders] = await db.query(query);

    // PDF generation
    const doc = new PDFDocument({ margin: 40, size: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    doc.pipe(res);

    doc.fontSize(18).text("YummyYard", { align: "center" });
    doc.fontSize(14).text(title, { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`);
    doc.moveDown();

    // Table setup
    const startY = doc.y + 10;
    const colX = [50, 120, 260, 380, 470]; // X positions for columns
    const rowHeight = 20;

    // Table Header
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('Order ID', colX[0], startY);
    doc.text('Date', colX[1], startY);
    doc.text('Customer', colX[2], startY);
    doc.text('Amount', colX[3], startY, { width: colX[4] - colX[3], align: 'right' });
    doc.text('Status', colX[4], startY);
    doc.moveTo(50, startY + 15).lineTo(550, startY + 15).stroke();

    doc.font('Helvetica').fontSize(11);
    let y = startY + 20;
    let total = 0;

    orders.forEach(order => {
      if (y > doc.page.height - 50) {
        doc.addPage();
        y = 50;
      }
      doc.text(order.order_id.toString(), colX[0], y);
      doc.text(new Date(order.order_date).toLocaleString(), colX[1], y);
      doc.text(
        order.customer_id ? `Customer #${order.customer_id}` : `Staff #${order.staff_id}`,
        colX[2], y
      );
      doc.text(`LKR ${Number(order.total_amount).toLocaleString()}`, colX[3], y, { width: colX[4] - colX[3], align: 'right' });
      doc.text(order.status, colX[4], y);
      y += rowHeight;
      total += Number(order.total_amount);
    });

    doc.moveTo(50, y).lineTo(550, y).stroke();

    doc.moveDown(2);
    doc.font("Helvetica-Bold").fontSize(13).text(`Total Sales: LKR ${total.toLocaleString()}`, { align: "right" });

    doc.end();
  } catch (error) {
    console.error("Error generating sales report:", error);
    res.status(500).json({ error: "Failed to generate sales report" });
  }
};


const getSalesByMonth = async (req, res) => {
  try {
    // Returns sales totals for each month of the current year
    const [rows] = await db.query(`
      SELECT MONTH(order_date) AS month, SUM(total_amount) AS total
      FROM Orders
      WHERE YEAR(order_date) = YEAR(CURDATE()) AND status = 'Completed'
      GROUP BY MONTH(order_date)
      ORDER BY month
    `);
    res.json(rows); // [{ month: 1, total: 10000 }, ...]
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sales data' });
  }
};

const getTopUsedIngredients = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        i.inventory_id,
        i.item_name,
        SUM(oi.quantity * mii.quantity_required) AS total_used
      FROM
        OrderItems oi
        JOIN Orders o ON oi.order_id = o.order_id
        JOIN MenuItemIngredients mii ON oi.item_id = mii.item_id
        JOIN Inventory i ON mii.inventory_id = i.inventory_id
      WHERE
        o.status = 'Completed'
      GROUP BY
        i.inventory_id, i.item_name
      ORDER BY
        total_used DESC
      LIMIT 3
    `);
    res.json({ success: true, ingredients: rows });
  } catch (error) {
    console.error('Error fetching top used ingredients:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch top used ingredients' });
  }
};

module.exports = {
  getLowStockItems,
  getTopOrderedItems,
  getLeastOrderedItem,
  getSalesSummary,
  downloadSalesReport,
  createStockOrder,
  getSalesByMonth,
  downloadStockOrderReceipt,
  getTopUsedIngredients,
  getAllInventory

};