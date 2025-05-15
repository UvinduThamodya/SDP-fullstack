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

const checkDeleteRequests = async (req, res) => {
  try {
    const customerId = req.user.id;
    const [rows] = await db.query(
      'SELECT delete_requested FROM Customers WHERE customer_id = ?', 
      [customerId]
    );
    
    res.json({ 
      hasDeleteRequest: rows[0]?.delete_requested || false 
    });
  } catch (error) {
    console.error('Error checking delete requests:', error);
    res.status(500).json({ 
      error: 'Failed to check delete requests' 
    });
  }
};

// Accept a delete request (delete the account)
const acceptDeleteRequest = async (req, res) => {
  try {
    const customerId = req.user.id;
    await db.query(
      'DELETE FROM Customers WHERE customer_id = ?', 
      [customerId]
    );
    
    res.status(200).json({ 
      message: 'Account deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ 
      error: 'Failed to delete account' 
    });
  }
};

// Reject a delete request
const rejectDeleteRequest = async (req, res) => {
  try {
    const customerId = req.user.id;
    await db.query(
      'UPDATE Customers SET delete_requested = false WHERE customer_id = ?', 
      [customerId]
    );
    
    res.status(200).json({ 
      message: 'Delete request rejected' 
    });
  } catch (error) {
    console.error('Error rejecting delete request:', error);
    res.status(500).json({ 
      error: 'Failed to reject delete request' 
    });
  }
};

const deleteCustomerProfile = async (req, res) => {
  try {
    const customerId = req.user.id;
    await db.query('DELETE FROM Customers WHERE customer_id = ?', [customerId]);
    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer profile:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
};

module.exports = { getCustomerProfile,
  updateCustomerProfile, 
  checkDeleteRequests, 
  acceptDeleteRequest, 
  rejectDeleteRequest,
  deleteCustomerProfile };
