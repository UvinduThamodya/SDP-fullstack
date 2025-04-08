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

// Add other staff controller functions as needed

module.exports = { staffLogin };
