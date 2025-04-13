const db = require('../config/db');

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
