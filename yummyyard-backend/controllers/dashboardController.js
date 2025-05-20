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
    let title = "";
    let filename = "";
    let orders = [];
    let menuItems = [];

    console.log(`Generating sales report for period: ${period}`);

    // Different queries based on the period
    if (period === "day") {
      title = "Daily Sales Report";
      filename = `daily-sales-report-${new Date().toISOString().slice(0, 10)}.pdf`;
      
      // Get orders for today with customer/staff details
      const [orderRows] = await db.query(`
        SELECT o.order_id, o.order_date, o.total_amount, o.status,
               COALESCE(c.name, CONCAT('Staff #', e.employee_id)) AS customer_name,
               COALESCE(c.customer_id, e.employee_id) AS user_id,
               CASE WHEN c.customer_id IS NOT NULL THEN 'Customer' ELSE 'Staff' END AS user_type
        FROM Orders o
        LEFT JOIN Customers c ON o.customer_id = c.customer_id
        LEFT JOIN Employees e ON o.staff_id = e.employee_id
        WHERE DATE(o.order_date) = CURDATE() AND o.status = 'Completed'
        ORDER BY o.order_date DESC
      `);
      orders = orderRows;
      
      // Get menu items for each order
      if (orders.length > 0) {
        const orderIds = orders.map(order => order.order_id).join(',');
        if (orderIds) {
          const [itemRows] = await db.query(`
            SELECT oi.order_id, oi.quantity, oi.subtotal, m.name
            FROM OrderItems oi
            JOIN MenuItems m ON oi.item_id = m.item_id
            WHERE oi.order_id IN (${orderIds})
            ORDER BY oi.order_id
          `);
          menuItems = itemRows;
        }
      }
    } else if (period === "month") {
      title = "Monthly Sales Report";
      const month = new Date().toISOString().slice(0, 7);
      filename = `monthly-sales-report-${month}.pdf`;
      
      // Get orders for this month grouped by date
      const [orderRows] = await db.query(`
        SELECT o.order_id, o.order_date, o.total_amount, o.status,
               COALESCE(c.name, CONCAT('Staff #', e.employee_id)) AS customer_name,
               DATE(o.order_date) AS order_day
        FROM Orders o
        LEFT JOIN Customers c ON o.customer_id = c.customer_id
        LEFT JOIN Employees e ON o.staff_id = e.employee_id
        WHERE YEAR(o.order_date) = YEAR(CURDATE()) 
        AND MONTH(o.order_date) = MONTH(CURDATE()) 
        AND o.status = 'Completed'
        ORDER BY o.order_date DESC
      `);
      orders = orderRows;
      
      // Get menu items for each order (if needed)
      if (orders.length > 0) {
        const orderIds = orders.map(order => order.order_id).join(',');
        if (orderIds) {
          const [itemRows] = await db.query(`
            SELECT oi.order_id, SUM(oi.quantity) as total_items, SUM(oi.subtotal) as total_amount
            FROM OrderItems oi
            WHERE oi.order_id IN (${orderIds})
            GROUP BY oi.order_id
          `);
          menuItems = itemRows;
        }
      }
    } else if (period === "year") {
      title = "Yearly Sales Report";
      filename = `yearly-sales-report-${new Date().getFullYear()}.pdf`;
      
      // Fixed query - Get orders grouped by month for this year
      // Use IFNULL to handle months with no sales
      try {
        const [monthlyData] = await db.query(`
          SELECT 
            MONTH(order_date) AS month,
            DATE_FORMAT(order_date, '%M') AS month_name,
            COUNT(order_id) AS order_count,
            SUM(total_amount) AS total_sales
          FROM Orders
          WHERE YEAR(order_date) = YEAR(CURDATE())
          AND status = 'Completed'
          GROUP BY MONTH(order_date), DATE_FORMAT(order_date, '%M')
          ORDER BY MONTH(order_date)
        `);
        console.log("Monthly data query successful, found", monthlyData.length, "months with sales");
        orders = monthlyData || [];
        
        // Get top selling items per month - add a safer query
        if (orders.length > 0) {
          try {
            const [topItems] = await db.query(`
              SELECT 
                MONTH(o.order_date) AS month,
                m.name,
                SUM(oi.quantity) AS total_quantity,
                SUM(oi.subtotal) AS total_revenue
              FROM OrderItems oi
              JOIN Orders o ON oi.order_id = o.order_id
              JOIN MenuItems m ON oi.item_id = m.item_id
              WHERE YEAR(o.order_date) = YEAR(CURDATE())
              AND o.status = 'Completed'
              GROUP BY MONTH(o.order_date), m.name, m.item_id
              ORDER BY MONTH(o.order_date), total_quantity DESC
            `);
            console.log("Top items query successful");
            menuItems = topItems || [];
          } catch (menuErr) {
            console.error("Error fetching top items:", menuErr);
            menuItems = []; // Use empty array on error
          }
        }
      } catch (monthErr) {
        console.error("Error in monthly data query:", monthErr);
        orders = []; // Use empty array on error
      }
    } else {
      return res.status(400).json({ error: "Invalid period" });
    }

    // PDF generation
    const doc = new PDFDocument({ margin: 40, size: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    doc.pipe(res);

    // Header
    doc.fontSize(18).text("YummyYard", { align: "center" });
    doc.fontSize(14).text(title, { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`);
    doc.moveDown();

    // Different report format based on period
    if (period === "day") {
      // Daily report with detailed time and menu items
      if (orders.length === 0) {
        doc.text("No orders found for today.", { align: "center" });
      } else {
        doc.fontSize(12).text(`Total Orders Today: ${orders.length}`, { bold: true });
        doc.text(`Total Sales: LKR ${orders.reduce((sum, order) => sum + Number(order.total_amount), 0).toLocaleString()}`);
        doc.moveDown();
        
        // Table header for orders
        doc.font('Helvetica-Bold').fontSize(11);
        let y = doc.y;
        doc.text("Order ID", 50, y);
        doc.text("Time", 120, y);
        doc.text("Customer", 200, y);
        doc.text("Status", 350, y);
        doc.text("Amount", 450, y, { align: 'right' });
        doc.moveTo(50, y + 15).lineTo(550, y + 15).stroke();
        doc.moveDown();
        
        // Table rows for orders
        doc.font('Helvetica').fontSize(10);
        orders.forEach((order, index) => {
          // If not enough space for a new order, add a new page
          if (doc.y > 700) {
            doc.addPage();
            
            // Repeat header on new page
            doc.font('Helvetica-Bold').fontSize(11);
            y = 50;
            doc.text("Order ID", 50, y);
            doc.text("Time", 120, y);
            doc.text("Customer", 200, y);
            doc.text("Status", 350, y);
            doc.text("Amount", 450, y, { align: 'right' });
            doc.moveTo(50, y + 15).lineTo(550, y + 15).stroke();
            doc.moveDown();
            doc.font('Helvetica').fontSize(10);
          }
          
          y = doc.y;
          doc.text(`#${order.order_id}`, 50, y);
          doc.text(new Date(order.order_date).toLocaleTimeString(), 120, y);
          doc.text(`${order.user_type}: ${order.customer_name}`, 200, y);
          doc.text(order.status, 350, y);
          doc.text(`LKR ${Number(order.total_amount).toLocaleString()}`, 450, y, { align: 'right' });
          
          // Group menu items by order
          const orderItems = menuItems.filter(item => item.order_id === order.order_id);
          
          if (orderItems && orderItems.length > 0) {
            doc.moveDown(0.5);
            
            // Indent and create menu items sub-table
            doc.font('Helvetica-Bold').fontSize(9);
            let itemY = doc.y;
            doc.text("Item", 70, itemY);
            doc.text("Qty", 300, itemY, { width: 30, align: 'center' });
            doc.text("Subtotal", 360, itemY, { width: 70, align: 'right' });
            doc.moveTo(70, itemY + 12).lineTo(450, itemY + 12).stroke();
            doc.moveDown();
            
            // Items rows
            doc.font('Helvetica').fontSize(9);
            orderItems.forEach(item => {
              itemY = doc.y;
              doc.text(item.name, 70, itemY, { width: 220 });
              doc.text(item.quantity.toString(), 300, itemY, { width: 30, align: 'center' });
              doc.text(`LKR ${Number(item.subtotal).toLocaleString()}`, 360, itemY, { width: 70, align: 'right' });
              doc.moveDown(0.5);
            });
          }
          
          doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
          doc.moveDown();
        });
      }
    } else if (period === "month") {
      // Monthly report with orders grouped by date
      if (orders.length === 0) {
        doc.text("No orders found for this month.", { align: "center" });
      } else {
        // Group orders by day
        const ordersByDay = {};
        orders.forEach(order => {
          const day = new Date(order.order_date).toLocaleDateString();
          if (!ordersByDay[day]) ordersByDay[day] = [];
          ordersByDay[day].push(order);
        });
        
        doc.fontSize(12).text(`Total Orders This Month: ${orders.length}`, { bold: true });
        doc.text(`Total Sales: LKR ${orders.reduce((sum, order) => sum + Number(order.total_amount), 0).toLocaleString()}`);
        doc.moveDown();
        
        // For each day, show orders
        Object.entries(ordersByDay).forEach(([day, dayOrders]) => {
          // Add a new page if needed
          if (doc.y > 700) {
            doc.addPage();
          }
          
          doc.font('Helvetica-Bold').fontSize(12);
          doc.text(`Date: ${day}`, { underline: true });
          doc.font('Helvetica').fontSize(10);
          doc.text(`Orders: ${dayOrders.length}`);
          doc.text(`Daily Total: LKR ${dayOrders.reduce((sum, order) => sum + Number(order.total_amount), 0).toLocaleString()}`);
          doc.moveDown(0.5);
          
          // Table header
          let y = doc.y;
          doc.font('Helvetica-Bold').fontSize(10);
          doc.text("Order ID", 50, y);
          doc.text("Time", 120, y);
          doc.text("Customer", 220, y);
          doc.text("Amount", 380, y, { align: 'right' });
          doc.text("Status", 480, y);
          doc.moveTo(50, y + 15).lineTo(550, y + 15).stroke();
          doc.moveDown();
          
          // Table rows
          doc.font('Helvetica').fontSize(9);
          dayOrders.forEach(order => {
            y = doc.y;
            doc.text(order.order_id.toString(), 50, y);
            doc.text(new Date(order.order_date).toLocaleTimeString(), 120, y);
            doc.text(order.customer_name || 'Walk-in', 220, y);
            doc.text(`LKR ${Number(order.total_amount).toLocaleString()}`, 380, y, { align: 'right' });
            doc.text(order.status, 480, y);
            doc.moveDown();
          });
          
          doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
          doc.moveDown(2);
        });
      }
    } else if (period === "year") {
      // Year report with orders grouped by month
      if (!orders || orders.length === 0) {
        doc.text("No orders found for this year.", { align: "center" });
      } else {
        // Calculate totals with null/undefined handling
        const totalSales = orders.reduce((sum, item) => sum + Number(item.total_sales || 0), 0);
        const totalOrders = orders.reduce((sum, item) => sum + Number(item.order_count || 0), 0);
        
        doc.fontSize(12).text(`Total Orders This Year: ${totalOrders}`, { bold: true });
        doc.text(`Total Sales: LKR ${totalSales.toLocaleString()}`);
        doc.moveDown();
        
        // Monthly orders table
        doc.font('Helvetica-Bold').fontSize(11);
        let y = doc.y;
        doc.text("Month", 50, y);
        doc.text("Order Count", 200, y);
        doc.text("Total Sales", 350, y, { align: 'right' });
        doc.moveTo(50, y + 15).lineTo(550, y + 15).stroke();
        doc.moveDown();
        
        // Table rows
        doc.font('Helvetica').fontSize(10);
        orders.forEach(monthData => {
          if (!monthData) return; // Skip any undefined items
          
          y = doc.y;
          doc.text(monthData.month_name || `Month ${monthData.month}`, 50, y);
          doc.text((monthData.order_count || 0).toString(), 200, y);
          doc.text(`LKR ${Number(monthData.total_sales || 0).toLocaleString()}`, 350, y, { align: 'right' });
          doc.moveDown();
        });
        
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(2);
        
        // Top selling items per month
        if (menuItems && menuItems.length > 0) {
          try {
            // Group items by month
            const itemsByMonth = {};
            menuItems.forEach(item => {
              if (!item || !item.month) return; // Skip invalid data
              if (!itemsByMonth[item.month]) itemsByMonth[item.month] = [];
              itemsByMonth[item.month].push(item);
            });
            
            if (Object.keys(itemsByMonth).length > 0) {
              doc.font('Helvetica-Bold').fontSize(12);
              doc.text("Top Selling Items by Month", { underline: true });
              doc.moveDown();
              
              Object.entries(itemsByMonth).forEach(([month, items]) => {
                const monthIndex = parseInt(month) - 1;
                // Handle invalid month index
                const monthName = monthIndex >= 0 && monthIndex < 12 
                  ? new Date(2023, monthIndex, 1).toLocaleString('default', { month: 'long' })
                  : `Month ${month}`;
                
                if (doc.y > 650) {
                  doc.addPage();
                }
                
                doc.font('Helvetica-Bold').fontSize(11);
                doc.text(`${monthName}`, { underline: true });
                doc.moveDown(0.5);
                
                // Show top 3 items only with better error handling
                doc.font('Helvetica').fontSize(10);
                items.slice(0, 3).forEach((item, index) => {
                  if (!item || !item.name) return; // Skip invalid items
                  const quantity = Number(item.total_quantity || 0);
                  const revenue = Number(item.total_revenue || 0);
                  doc.text(`${index + 1}. ${item.name} - ${quantity} sold (LKR ${revenue.toLocaleString()})`);
                });
                doc.moveDown();
              });
            }
          } catch (err) {
            console.error("Error rendering top items section:", err);
            doc.text("Error displaying top selling items.", { italic: true });
          }
        }
      }
    }

    doc.end();
  } catch (error) {
    console.error("Error generating sales report:", error);
    // Send a more detailed error response
    return res.status(500).json({ 
      error: "Failed to generate sales report", 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
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