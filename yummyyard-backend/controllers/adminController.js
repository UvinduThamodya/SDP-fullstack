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

const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone } = req.body;
    
    // Validate input
    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and phone are required'
      });
    }
    
    // Check if email already exists for another admin
    const [existingEmails] = await db.query(
      'SELECT * FROM Employees WHERE email = ? AND employee_id != ?',
      [email, id]
    );
    
    if (existingEmails.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email already in use by another employee'
      });
    }
    
    // Update the admin profile
    await db.query(
      'UPDATE Employees SET name = ?, email = ?, phone = ? WHERE employee_id = ? AND role = "Admin"',
      [name, email, phone, id]
    );
    
    res.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

// Add this to your exports
module.exports = { 
  
  registerAdmin , updateProfile
};
