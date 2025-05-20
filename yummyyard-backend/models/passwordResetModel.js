const pool = require("../config/db");
const crypto = require("crypto");

const PasswordResetModel = {
  async createResetToken(email) {
    try {
      // First, delete any existing tokens for this email
      await pool.execute(
        "DELETE FROM password_resets WHERE email = ?",
        [email]
      );
      
      // Generate a random token
      const token = crypto.randomBytes(32).toString('hex');
      
      // Set expiration to 1 hour from now
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);
      
      // Store the token in the database
      await pool.execute(
        "INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)",
        [email, token, expiresAt]
      );
      
      return token;
    } catch (error) {
      console.error("Error creating password reset token:", error);
      throw new Error("Failed to generate password reset token");
    }
  },
  
  async findByToken(token) {
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM password_resets WHERE token = ? AND expires_at > NOW()",
        [token]
      );
      
      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error("Error finding reset token:", error);
      throw new Error("Failed to verify reset token");
    }
  },
  
  async deleteToken(token) {
    try {
      await pool.execute(
        "DELETE FROM password_resets WHERE token = ?",
        [token]
      );
    } catch (error) {
      console.error("Error deleting reset token:", error);
      throw new Error("Failed to delete reset token");
    }
  }
};

module.exports = PasswordResetModel;
