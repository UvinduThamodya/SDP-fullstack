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
    const { name, email, password } = req.body;

    // Add logic to register staff (e.g., save to database)
    // Example:
    const newStaff = await Staff.create({ name, email, password });

    res.status(201).json({ message: 'Staff registered successfully', staff: newStaff });
  } catch (error) {
    res.status(500).json({ error: 'Failed to register staff' });
  }
};

const getStaffProfile = async (req, res) => {
  try {
    const staffId = req.params.id;
    const [rows] = await db.query(
      'SELECT employee_id AS id, name, email, phone, role FROM Employees WHERE employee_id = ?',
      [staffId]
    );
    if (!rows.length) {
      return res.status(404).json({ error: 'Staff member not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch staff profile' });
  }
};

const updateStaffProfile = async (req, res) => {
  try {
    const staffId = req.params.id;
    const { name, email, phone } = req.body;
    await db.query(
      'UPDATE Employees SET name = ?, email = ?, phone = ? WHERE employee_id = ?',
      [name, email, phone, staffId]
    );
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
};


// Add other staff controller functions as needed

module.exports = { staffLogin, registerStaff, getStaffProfile, updateStaffProfile };
