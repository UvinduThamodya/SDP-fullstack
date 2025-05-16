const db = require('../config/db');
const PDFDocument = require('pdfkit');
const { Table } = require('pdfkit-table')

// Get all ingredients from Inventory table
exports.getAllIngredients = async (req, res) => {
    try {
      const [rows] = await db.query('SELECT * FROM Inventory');
      res.json({ success: true, ingredients: rows });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Failed to fetch ingredients' });
      console.error(err);
    }
  };  

// Add a new ingredient to Inventory table
exports.addIngredient = async (req, res) => {
  try {
    const { item_name, quantity, unit, unit_price, threshold } = req.body;
    await db.query(
      'INSERT INTO Inventory (item_name, quantity, unit, unit_price, threshold) VALUES (?, ?, ?, ?, ?)',
      [item_name, quantity, unit, unit_price, threshold]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to add ingredient' });
    console.error(err);
  }
};

// Update an existing ingredient
exports.updateIngredient = async (req, res) => {
  try {
    const { id } = req.params;
    const { item_name, quantity, unit, unit_price, threshold } = req.body;
    
    // Validate input
    if (!item_name || !quantity || !unit || !unit_price || !threshold) {
      return res.status(400).json({ 
        success: false, 
        error: 'All fields are required' 
      });
    }
    
    // Update the ingredient in the database
    const [result] = await db.query(
      'UPDATE Inventory SET item_name = ?, quantity = ?, unit = ?, unit_price = ?, threshold = ? WHERE inventory_id = ?',
      [item_name, quantity, unit, unit_price, threshold, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: `Ingredient with ID ${id} not found`
      });
    }
    
    res.json({
      success: true,
      message: 'Ingredient updated successfully'
    });
  } catch (error) {
    console.error('Error updating ingredient:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update ingredient'
    });
  }
};

// Delete an ingredient
exports.deleteIngredient = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete the ingredient from the database
    const [result] = await db.query(
      'DELETE FROM Inventory WHERE inventory_id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: `Ingredient with ID ${id} not found`
      });
    }
    
    res.json({
      success: true,
      message: 'Ingredient deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting ingredient:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete ingredient'
    });
  }
  
};

exports.downloadInventoryReport = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT item_name, quantity, unit, unit_price, threshold FROM Inventory ORDER BY item_name');
    const doc = new PDFDocument({ margin: 30, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="inventory-report-${new Date().toISOString().slice(0,10)}.pdf"`);

    doc.pipe(res);

    doc.fontSize(18).text('Yummy Yard Inventory Status Report', { align: 'center' }).moveDown();
    doc.fontSize(12).text(`Date: ${new Date().toLocaleDateString()}`).moveDown();

    // Use monospaced font for table
    doc.font('Courier').fontSize(10);

    // Table header
    const header = [
      'Ingredient'.padEnd(30),
      'Qty'.padStart(10),
      'Unit'.padStart(8),
      'Unit Price'.padStart(15),
      'Threshold'.padStart(10)
    ].join('  ');
    doc.text(header);
    doc.text('-'.repeat(80));

    // Table rows
    rows.forEach(item => {
      const quantity = (item.unit === 'grams' || item.unit === 'ml') 
        ? (item.unit === 'grams' ? (item.quantity / 1000).toFixed(2) : (item.quantity / 1000).toFixed(2)) 
        : item.quantity;
      const unit = item.unit === 'grams' ? 'kg' : item.unit === 'ml' ? 'L' : item.unit;
      const row = [
        (item.item_name || '').padEnd(30),
        quantity.toString().padStart(10),
        unit.padStart(8),
        (item.unit_price !== undefined ? `LKR ${item.unit_price}` : '').padStart(15),
        (item.threshold !== undefined ? item.threshold.toString() : '').padStart(10)
      ].join('  ');
      doc.text(row);
    });

    doc.end();
  } catch (error) {
    console.error('Error generating inventory report:', error);
    res.status(500).json({ success: false, error: 'Failed to generate inventory report' });
  }
};

// Get menu items with low stock information
exports.getMenuItemsWithLowStock = async (req, res) => {
  try {
    // Mark menu items as low stock if any ingredient is below its threshold
    const [menuItems] = await db.query(`
      SELECT 
        m.item_id AS menu_item_id,
        m.name AS menu_item_name,
        GROUP_CONCAT(i.item_name SEPARATOR ', ') AS low_stock_ingredients,
        MIN(i.quantity / mii.quantity_required) AS max_possible_quantity
      FROM MenuItems m
      JOIN MenuItemIngredients mii ON m.item_id = mii.item_id
      JOIN Inventory i ON mii.inventory_id = i.inventory_id
      GROUP BY m.item_id
      HAVING MIN(i.quantity / mii.quantity_required) < 1
         OR SUM(CASE WHEN i.quantity < i.threshold THEN 1 ELSE 0 END) > 0
    `);

    res.json({
      success: true,
      menuItems: menuItems.map(item => ({
        ...item,
        lowStock: true
      }))
    });
  } catch (error) {
    console.error('Error fetching menu items with low stock:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch low stock items' });
  }
};

// --- Menu Item Ingredients Management ---

exports.getMenuItemIngredients = async (req, res) => {
  try {
    const { menuItemId } = req.params;
    const [rows] = await db.query(
      `SELECT mii.menu_item_ingredient_id, mii.inventory_id, mii.quantity_required, i.item_name
       FROM MenuItemIngredients mii
       JOIN Inventory i ON mii.inventory_id = i.inventory_id
       WHERE mii.item_id = ?`,
      [menuItemId]
    );
    res.json({ ingredients: rows });
  } catch (error) {
    console.error('Error fetching menu item ingredients:', error);
    res.status(500).json({ error: 'Failed to fetch menu item ingredients' });
  }
};

exports.addMenuItemIngredient = async (req, res) => {
  try {
    const { menuItemId } = req.params;
    const { inventory_id, quantity_required } = req.body;
    await db.query(
      `INSERT INTO MenuItemIngredients (item_id, inventory_id, quantity_required) VALUES (?, ?, ?)`,
      [menuItemId, inventory_id, quantity_required]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error adding menu item ingredient:', error);
    res.status(500).json({ error: 'Failed to add menu item ingredient' });
  }
};

exports.editMenuItemIngredient = async (req, res) => {
  try {
    const { menuItemId, menuItemIngredientId } = req.params;
    const { inventory_id, quantity_required } = req.body;
    await db.query(
      `UPDATE MenuItemIngredients SET inventory_id = ?, quantity_required = ? WHERE menu_item_ingredient_id = ? AND item_id = ?`,
      [inventory_id, quantity_required, menuItemIngredientId, menuItemId]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error editing menu item ingredient:', error);
    res.status(500).json({ error: 'Failed to edit menu item ingredient' });
  }
};

exports.deleteMenuItemIngredient = async (req, res) => {
  try {
    const { menuItemId, menuItemIngredientId } = req.params;
    await db.query(
      `DELETE FROM MenuItemIngredients WHERE menu_item_ingredient_id = ? AND item_id = ?`,
      [menuItemIngredientId, menuItemId]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting menu item ingredient:', error);
    res.status(500).json({ error: 'Failed to delete menu item ingredient' });
  }
};