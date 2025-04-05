const CustomerModel = require("../models/customerModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken"); // Added JWT library

// This secret key should be in an environment variable in production
const JWT_SECRET = "your-super-secret-key-change-this"; 

const AuthController = {
  async register(req, res) {
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
      
      // Generate token for the newly registered user
      const token = jwt.sign(
        { 
          id: userId,
          email: email,
          name: name 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        message: "User registered successfully",
        userId,
        token
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed. Please try again." });
    }
  },

  async login(req, res) {
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

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: user.customer_id,
          email: user.email,
          name: user.name 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        message: "Login successful",
        token, // Return the token
        user: {
          customer_id: user.customer_id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed. Please try again." });
    }
  }
};

module.exports = AuthController;
