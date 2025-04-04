const pool = require("../config/db");
const bcrypt = require("bcrypt");

const CustomerModel = {
  async findByEmail(email) {
    const [rows] = await pool.execute("SELECT * FROM Customers WHERE email = ?", [email]);
    return rows.length ? rows[0] : null;
  },

  async create({ name, email, phone, address, password }) {
    try {
      console.log("Creating customer with data:", { name, email, phone, address, password });
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Execute the SQL query
      const [result] = await pool.execute(
        "INSERT INTO Customers (name, email, phone, address, password) VALUES (?, ?, ?, ?, ?)",
        [name, email, phone, address, hashedPassword]
      );
  
      return result.insertId;
    } catch (error) {
      // Log the error if the query fails
      console.error("Error inserting customer:", error);
      throw new Error("Database error: Unable to register the user.");
    }
  }
  
};

module.exports = CustomerModel;
