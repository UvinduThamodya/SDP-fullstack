const CustomerModel = require("../models/customerModel");
const StaffModel = require("../models/staffModel");
const PasswordResetModel = require("../models/passwordResetModel");
const emailService = require("../services/emailService");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

// This secret key should be in an environment variable in production
const JWT_SECRET = "JWT_NEW_SECRET";

const AuthController = {
  // Customer registration
  async registerCustomer(req, res) {
    try {
      const { name, email, phone, address, password } = req.body;

      if (!name || !email || !phone || !address || !password) {
        return res.status(400).json({ error: "All fields are required" });
      }

      const existingUser = await CustomerModel.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: "Email already in use" });
      }

      const userId = await CustomerModel.create({ name, email, phone, address, password });

      // Include role in the token
      const token = jwt.sign(
        { id: userId, email, name, role: "customer" },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        message: "Customer registered successfully",
        userId,
        token
      });
    } catch (error) {
      console.error("Customer registration error:", error);
      res.status(500).json({ error: "Registration failed. Please try again." });
    }
  },

  // Customer login
  async loginCustomer(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      const user = await CustomerModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (!isPasswordMatch) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Include role in the token
      const token = jwt.sign(
        { id: user.customer_id, email: user.email, name: user.name, role: "customer" },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        message: "Login successful",
        token,
        user: {
          customer_id: user.customer_id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          role: "customer"
        },
      });
    } catch (error) {
      console.error("Customer login error:", error);
      res.status(500).json({ error: "Login failed. Please try again." });
    }
  },

  // Staff registration
  async registerStaff(req, res) {
    try {
      const { name, email, phone, role, password } = req.body;

      if (!name || !email || !phone || !role || !password) {
        return res.status(400).json({ error: "All fields are required" });
      }

      const existingStaff = await StaffModel.findByEmail(email);
      if (existingStaff) {
        return res.status(409).json({ error: "Email already in use" });
      }

      const staffId = await StaffModel.create({ name, email, phone, role, password });

      // Include role in the token
      const token = jwt.sign(
        { id: staffId, email, name, role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        message: "Staff registered successfully",
        staffId,
        token
      });
    } catch (error) {
      console.error("Staff registration error:", error);
      res.status(500).json({ error: "Registration failed. Please try again." });
    }
  },

  // Staff login
  async loginStaff(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      const staff = await StaffModel.findByEmail(email);
      if (!staff) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const isPasswordMatch = await bcrypt.compare(password, staff.password);
      if (!isPasswordMatch) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Include role in the token
      const token = jwt.sign(
        { id: staff.employee_id, email: staff.email, name: staff.name, role: staff.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        message: "Login successful",
        token,
        user: {
          id: staff.employee_id,
          name: staff.name,
          email: staff.email,
          phone: staff.phone,
          role: staff.role
        },
      });
    } catch (error) {
      console.error("Staff login error:", error);      res.status(500).json({ error: "Login failed. Please try again." });
    }
  },

  // Request password reset
  async requestPasswordReset(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      // Verify if customer exists
      const customer = await CustomerModel.findByEmail(email);
      if (!customer) {
        // For security reasons, still return success even if email doesn't exist
        return res.status(200).json({ 
          message: "If your email is registered, you will receive password reset instructions." 
        });
      }

      // Generate password reset token
      const resetToken = await PasswordResetModel.createResetToken(email);
      
      // Send password reset email
      await emailService.sendPasswordResetEmail(email, resetToken, customer.name);
      
      // Return success response
      res.status(200).json({ 
        message: "If your email is registered, you will receive password reset instructions." 
      });
    } catch (error) {
      console.error("Password reset request error:", error);
      res.status(500).json({ error: "Failed to process password reset request. Please try again." });
    }
  },

  // Verify reset token
  async verifyResetToken(req, res) {
    try {
      const { token } = req.params;
      
      if (!token) {
        return res.status(400).json({ error: "Reset token is required" });
      }
      
      // Verify token exists and is valid
      const resetRequest = await PasswordResetModel.findByToken(token);
      if (!resetRequest) {
        return res.status(400).json({ error: "Invalid or expired reset token" });
      }
      
      res.status(200).json({ valid: true });
    } catch (error) {
      console.error("Token verification error:", error);
      res.status(500).json({ error: "Failed to verify reset token" });
    }
  },

  // Reset password
  async resetPassword(req, res) {
    try {
      const { token, password } = req.body;
      
      if (!token || !password) {
        return res.status(400).json({ error: "Token and new password are required" });
      }
      
      // Minimum password length validation
      if (password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters long" });
      }

      // Verify token exists and is valid
      const resetRequest = await PasswordResetModel.findByToken(token);
      if (!resetRequest) {
        return res.status(400).json({ error: "Invalid or expired reset token" });
      }
      
      // Get customer by email
      const customer = await CustomerModel.findByEmail(resetRequest.email);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      
      // Hash the new password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Update password in database
      await pool.execute(
        "UPDATE Customers SET password = ? WHERE email = ?",
        [hashedPassword, resetRequest.email]
      );
      
      // Delete the used token
      await PasswordResetModel.deleteToken(token);
      
      res.status(200).json({ message: "Password has been reset successfully" });
    } catch (error) {
      console.error("Password reset error:", error);
      res.status(500).json({ error: "Failed to reset password. Please try again." });
    }
  }
};

module.exports = AuthController;
