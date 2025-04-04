
const db = require('../config/db');

class Contact {
  static async create(contactData) {
    const { name, email, subject, message } = contactData;
    
    try {
      const query = `
        INSERT INTO contacts (name, email, subject, message, created_at) 
        VALUES (?, ?, ?, ?, NOW())
      `;
      
      const result = await db.query(query, [name, email, subject || 'No Subject', message]);
      return result;
    } catch (error) {
      throw error;
    }
  }
  
  static async getAll() {
    try {
      const query = 'SELECT * FROM contacts ORDER BY created_at DESC';
      const [contacts] = await db.query(query);
      return contacts;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Contact;