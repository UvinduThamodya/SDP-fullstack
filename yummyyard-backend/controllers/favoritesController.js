const db = require('../config/db');

exports.toggleFavorite = async (req, res) => {
  const customerId = req.user.id; // get from JWT
  const { itemId } = req.params;

  try {
    // Check if already favorite
    const [rows] = await db.query(
      'SELECT * FROM Favorites WHERE customer_id = ? AND item_id = ?',
      [customerId, itemId]
    );
    if (rows.length > 0) {
      // Remove favorite
      await db.query(
        'DELETE FROM Favorites WHERE customer_id = ? AND item_id = ?',
        [customerId, itemId]
      );
      return res.json({ favorited: false });
    } else {
      // Add favorite
      await db.query(
        'INSERT INTO Favorites (customer_id, item_id) VALUES (?, ?)',
        [customerId, itemId]
      );
      return res.json({ favorited: true });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle favorite' });
  }
};

exports.getFavorites = async (req, res) => {
  const customerId = req.user.id;
  try {
    const [rows] = await db.query(
      `SELECT m.* FROM Favorites f
       JOIN MenuItems m ON f.item_id = m.item_id
       WHERE f.customer_id = ?`,
      [customerId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get favorites' });
  }
};
