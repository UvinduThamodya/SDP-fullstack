const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { authenticateUser } = require('../middleware/authMiddleware');

// Protected routes - require authentication
router.get('/profile', authenticateUser, customerController.getCustomerProfile);
router.put('/profile', authenticateUser, customerController.updateCustomerProfile);

module.exports = router;
