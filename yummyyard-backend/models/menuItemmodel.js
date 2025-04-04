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
  
// Add these methods to your existing model
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
  // Add more methods as needed (create, update, delete)
}



module.exports = MenuItem;