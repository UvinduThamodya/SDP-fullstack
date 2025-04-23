// controllers/adminController.js
const db = require('../config/db');
const bcrypt = require('bcryptjs');

const registerAdmin = async (req, res) => {
  try {
    const { name, email, password, phone} = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'All fields are required' 
      });
    }

    // Check if email already exists
    const [existingEmails] = await db.query(
      'SELECT * FROM Employees WHERE email = ?',
      [email]
    );
    
    if (existingEmails.length > 0) {
      return res.status(409).json({ 
        success: false,
        message: 'Email already in use' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert admin into Employees table with role='Admin'
    const [result] = await db.query(
      'INSERT INTO Employees (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, 'Admin', phone]
    );

    res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      adminId: result.insertId
    });
  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error. Please try again.' 
    });
  }
};

// Add this to your exports
module.exports = { 
  // ... existing exports
  registerAdmin 
};
