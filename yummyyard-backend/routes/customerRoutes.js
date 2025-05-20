const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { authenticateUser } = require('../middleware/authMiddleware');

// Protected routes - require authentication
router.get('/profile', authenticateUser, customerController.getCustomerProfile);
router.put('/profile', authenticateUser, customerController.updateCustomerProfile);
router.delete('/profile', authenticateUser, customerController.deleteCustomerProfile);

// In customerRoutes.js
router.get('/delete-requests', authenticateUser, customerController.checkDeleteRequests);
router.post('/accept-delete', authenticateUser, customerController.acceptDeleteRequest);
router.post('/reject-delete', authenticateUser, customerController.rejectDeleteRequest);
router.post('/change-password', authenticateUser, customerController.changeCustomerPassword);
    

module.exports = router;
