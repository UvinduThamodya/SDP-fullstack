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

module.exports = {
  getLowStockItems,
  getTopOrderedItems,
  getLeastOrderedItem,
  getAllInventory
};