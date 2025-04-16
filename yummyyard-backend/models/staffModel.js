const pool = require("../config/db");
const bcrypt = require("bcrypt");

const StaffModel = {
  async findByEmail(email) {
    const [rows] = await pool.execute("SELECT * FROM Employees WHERE email = ?", [email]);
    return rows.length ? rows[0] : null;
  },

  async create({ name, email, phone, role, password }) {
    try {
      console.log("Creating staff with data:", { name, email, phone, role, password });
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Execute the SQL query
      const [result] = await pool.execute(
        "INSERT INTO Employees (name, email, phone, role, password) VALUES (?, ?, ?, ?, ?)",
        [name, email, phone, role, hashedPassword]
      );
  
      return result.insertId;
    } catch (error) {
      console.error("Error inserting staff:", error);
      throw new Error("Database error: Unable to register the staff member.");
    }
  }
};

module.exports = StaffModel;
