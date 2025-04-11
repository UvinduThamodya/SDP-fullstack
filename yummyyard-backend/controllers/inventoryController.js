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
