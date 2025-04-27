// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateAdmin } = require('../middleware/authMiddleware');

// Public route - no authentication needed
router.post('/register', adminController.registerAdmin);

// Protected routes - admin authentication required
router.put('/profile/:id', authenticateAdmin, adminController.updateProfile);

// Staff management routes
router.get('/staff', authenticateAdmin, adminController.getAllStaff);
router.delete('/staff/:id', authenticateAdmin, adminController.deleteStaff);

// Customer management routes
router.get('/customers', authenticateAdmin, adminController.getAllCustomers);
router.delete('/customers/:id', authenticateAdmin, adminController.deleteCustomer);

module.exports = router;
