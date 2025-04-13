const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const staffLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Email and password are required' 
      });
    }

    // 1. Find staff by email
    const [staffRows] = await db.query(
      'SELECT * FROM Employees WHERE email = ?',
      [email]
    );
    
    if (!staffRows || staffRows.length === 0) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid email or password' 
      });
    }
    
    const staff = staffRows[0];

    // 2. Verify password
    const isMatch = await bcrypt.compare(password, staff.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid email or password' 
      });
    }

    // 3. Create JWT token
    const token = jwt.sign(
      { 
        id: staff.employee_id, 
        role: staff.role,
        email: staff.email
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION || '1d' }
    );

    // 4. Set cookie (optional)
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    // 5. Send response (remove sensitive data)
    const userData = {
      id: staff.employee_id,
      name: staff.name,
      email: staff.email,
      role: staff.role,
      phone: staff.phone
    };

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: userData
    });

  } catch (error) {
    console.error('Staff login error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error. Please try again later.' 
    });
  }
};

const registerStaff = async (req, res) => {
  try {
    const { name, email, phone, password, role = 'Staff' } = req.body;

    // Validate input
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Name, email, phone, and password are required' 
      });
    }

    // Check if email already exists
    const [existingStaff] = await db.query(
      'SELECT * FROM Employees WHERE email = ?',
      [email]
    );
    
    if (existingStaff && existingStaff.length > 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Email already registered' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new staff into database
    const [result] = await db.query(
      'INSERT INTO Employees (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone, hashedPassword, role]
    );

    if (!result.insertId) {
      throw new Error('Failed to insert new staff member');
    }

    // Fetch the newly created staff to return (without password)
    const [newStaffRows] = await db.query(
      'SELECT employee_id, name, email, phone, role FROM Employees WHERE employee_id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Staff registered successfully',
      staff: newStaffRows[0]
    });

  } catch (error) {
    console.error('Staff registration error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error. Please try again later.' 
    });
  }
};

// Get staff by ID
const getStaffById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [staffRows] = await db.query(
      'SELECT employee_id, name, email, phone, role FROM Employees WHERE employee_id = ?',
      [id]
    );
    
    if (!staffRows || staffRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Staff member not found'
      });
    }
    
    res.status(200).json({
      success: true,
      staff: staffRows[0]
    });
    
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({
      success: false,
      error: 'Server error. Please try again later.'
    });
  }
};

// Update staff
const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone } = req.body;
    
    // Update staff in database
    const [result] = await db.query(
      'UPDATE Employees SET name = ?, email = ?, phone = ? WHERE employee_id = ?',
      [name, email, phone, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Staff member not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating staff:', error);
    res.status(500).json({
      success: false,
      error: 'Server error. Please try again later.'
    });
  }
};


module.exports = { 
  staffLogin,
  registerStaff,
  getStaffById,
  updateStaff
};
