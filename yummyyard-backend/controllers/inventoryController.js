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
      const quantity = (typeof item.quantity === 'number' && !isNaN(item.quantity))
        ? item.quantity.toFixed(2)
        : (parseFloat(item.quantity) ? parseFloat(item.quantity).toFixed(2) : '0.00');
      const row = [
        (item.item_name || '').padEnd(30),
        quantity.padStart(10),
        (item.unit || '').padStart(8),
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