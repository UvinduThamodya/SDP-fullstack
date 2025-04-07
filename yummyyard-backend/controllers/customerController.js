const db = require('../config/db');

// Get customer profile by ID
const getCustomerProfile = async (req, res) => {
  try {
    const customerId = req.user.id; // From JWT token
    
    const [rows] = await db.query(
      'SELECT customer_id, name, email, phone, address FROM Customers WHERE customer_id = ?',
      [customerId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Error getting customer profile:', error);
    res.status(500).json({ error: 'Failed to get customer profile' });
  }
};

// Update customer profile
const updateCustomerProfile = async (req, res) => {
  try {
    const customerId = req.user.id; // From JWT token
    const { name, email, phone, address } = req.body;
    
    await db.query(
      'UPDATE Customers SET name = ?, email = ?, phone = ?, address = ? WHERE customer_id = ?',
      [name, email, phone, address, customerId]
    );
    
    res.status(200).json({ 
      message: 'Profile updated successfully',
      user: { customer_id: customerId, name, email, phone, address }
    });
  } catch (error) {
    console.error('Error updating customer profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

module.exports = { getCustomerProfile, updateCustomerProfile };
