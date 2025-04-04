const CustomerModel = require("../models/customerModel");
const bcrypt = require("bcrypt");

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

      res.status(201).json({
        message: "User registered successfully",
        userId,
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

      res.json({
        message: "Login successful",
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
