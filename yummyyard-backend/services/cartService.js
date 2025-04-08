
const db = require('../config/db');

class CartService {
    static async getCart(customerId) {
        const [rows] = await db.query('SELECT * FROM Cart WHERE customer_id = ?', [customerId]);
        
        if (rows.length === 0) {
          // Now it correctly checks if no cart exists
          const [result] = await db.query(
            'INSERT INTO Cart (customer_id) VALUES (?)',
            [customerId]
          );
          return { cart_id: result.insertId, customer_id: customerId };
        }
        
        // Return the first cart found
        return rows[0];
      }
      static async addToCart(customerId, itemId, quantity = 1) {
        try {
          const cart = await this.getCart(customerId);
          console.log("Using cart:", cart); // Add this to check cart info
          
          const [rows] = await db.query(
            'SELECT * FROM CartItems WHERE cart_id = ? AND item_id = ?',
            [cart.cart_id, itemId]
          );
      
          if (rows.length > 0) {
            // Update existing item
            const existingItem = rows[0];
            await db.query(
              'UPDATE CartItems SET quantity = quantity + ? WHERE cart_item_id = ?',
              [quantity, existingItem.cart_item_id]
            );
            console.log("Updated item quantity");
          } else {
            // Add new item
            const [result] = await db.query(
              'INSERT INTO CartItems (cart_id, item_id, quantity) VALUES (?, ?, ?)',
              [cart.cart_id, itemId, quantity]
            );
            console.log("Added new item:", result.insertId);
          }
          
          return await this.getCartItems(cart.cart_id);
        } catch (error) {
          console.error("Error in addToCart:", error);
          throw error;
        }
      }

      static async getCartItems(cartId) {
        const [rows] = await db.query(
          `SELECT ci.*, mi.name, mi.price, mi.image_url 
           FROM CartItems ci 
           JOIN MenuItems mi ON ci.item_id = mi.item_id 
           WHERE ci.cart_id = ?`,
          [cartId]
        );
        return rows;
      }
      
}

module.exports = CartService;