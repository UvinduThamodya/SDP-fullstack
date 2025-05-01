const db = require('../config/db');

class MenuItem {
  // Get all menu items
  static async getAllMenuItems() {
    try {
      const [rows] = await db.query('SELECT * FROM MenuItems');
      return rows;
    } catch (error) {
      console.error('Error fetching menu items:', error);
      throw error;
    }
  }

  // Get menu items by category
  static async getMenuItemsByCategory(category) {
    try {
      const [rows] = await db.query(
        'SELECT * FROM MenuItems WHERE category = ?', 
        [category]
      );
      return rows;
    } catch (error) {
      console.error(`Error fetching ${category} menu items:`, error);
      throw error;
    }
  }

  // Update menu item image only
  static async updateMenuItemImage(id, imageUrl) {
    try {
      const [result] = await db.query(
        'UPDATE MenuItems SET image_url = ? WHERE item_id = ?', 
        [imageUrl, id]
      );
      return result;
    } catch (error) {
      console.error('Error updating menu item image:', error);
      throw error;
    }
  }

  // Get single menu item by ID
  static async getMenuItemById(id) {
    try {
      const [rows] = await db.query(
        'SELECT * FROM MenuItems WHERE item_id = ?', 
        [id]
      );
      return rows[0];
    } catch (error) {
      console.error('Error fetching menu item:', error);
      throw error;
    }
  }

  // Update a full menu item (name, category, price, description, image_url)
  static async update(id, data) {
    try {
      const { name, category, price, description, image_url } = data;

      const [result] = await db.query(
        `UPDATE MenuItems 
         SET name = ?, category = ?, price = ?, description = ?, image_url = ? 
         WHERE item_id = ?`,
        [name, category, price, description, image_url, id]
      );

      if (result.affectedRows === 0) return null;

      const [rows] = await db.query('SELECT * FROM MenuItems WHERE item_id = ?', [id]);
      return rows[0];
    } catch (error) {
      console.error('Error updating menu item:', error);
      throw error;
    }
  }

  static async delete(id) {
    const [result] = await db.query('DELETE FROM MenuItems WHERE item_id = ?', [id]);
    return result.affectedRows > 0;
  }
  

  // Optional: Create a new menu item
  static async create(data) {
    try {
      const { name, category, price, description, image_url } = data;
      const [result] = await db.query(
        `INSERT INTO MenuItems (name, category, price, description, image_url) 
         VALUES (?, ?, ?, ?, ?)`,
        [name, category, price, description, image_url]
      );

      const [rows] = await db.query('SELECT * FROM MenuItems WHERE item_id = ?', [result.insertId]);
      return rows[0];
    } catch (error) {
      console.error('Error creating menu item:', error);
      throw error;
    }
  }
}

module.exports = MenuItem;
