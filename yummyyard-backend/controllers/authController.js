const CustomerModel = require("../models/customerModel");
const StaffModel = require("../models/staffModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// This secret key should be in an environment variable in production
const JWT_SECRET = "your-super-secret-key-change-this";

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
      console.error("Staff login error:", error);
      res.status(500).json({ error: "Login failed. Please try again." });
    }
  }
};

module.exports = AuthController;
