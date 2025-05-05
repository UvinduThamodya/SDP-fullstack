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

const getAllStaff = async (req, res) => {
  try {
    const [staff] = await db.query(
      'SELECT employee_id, name, email, phone, role FROM Employees'
    );
    
    res.status(200).json(staff);
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve staff members' 
    });
  }
};

// Get all customers
const getAllCustomers = async (req, res) => {
  try {
    const [customers] = await db.query(
      'SELECT customer_id, name, email, phone, address FROM Customers'
    );
    
    res.status(200).json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve customers' 
    });
  }
};

// Delete a staff member
const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if staff exists
    const [staff] = await db.query(
      'SELECT * FROM Employees WHERE employee_id = ?',
      [id]
    );
    
    if (staff.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }
    
    // Prevent deletion of Admin accounts
    if (staff[0].role === 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin accounts cannot be deleted'
      });
    }
    
    // Delete the staff member
    await db.query(
      'DELETE FROM Employees WHERE employee_id = ?',
      [id]
    );
    
    res.status(200).json({
      success: true,
      message: 'Staff member deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting staff:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete staff member'
    });
  }
};

// Delete a customer
const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if customer exists
    const [customer] = await db.query(
      'SELECT * FROM Customers WHERE customer_id = ?',
      [id]
    );
    
    if (customer.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    // Delete the customer
    await db.query(
      'DELETE FROM Customers WHERE customer_id = ?',
      [id]
    );
    
    res.status(200).json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete customer'
    });
  }
};

const sendDeleteRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if customer exists
    const [customer] = await db.query(
      'SELECT * FROM Customers WHERE customer_id = ?',
      [id]
    );
    
    if (customer.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    // Store the delete request in the database
    await db.query(
      'UPDATE Customers SET delete_requested = true WHERE customer_id = ?', 
      [id]
    );
    
    res.status(200).json({ 
      success: true,
      message: 'Delete request sent successfully' 
    });
  } catch (error) {
    console.error('Error sending delete request:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to send delete request' 
    });
  }
};

// Add this to your exports
module.exports = { 
  registerAdmin,
  updateProfile,
  getAllStaff,
  getAllCustomers,
  deleteStaff,
  sendDeleteRequest,
  deleteCustomer
};
