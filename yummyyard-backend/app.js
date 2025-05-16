const express = require('express');
const router = express.Router();
const availabilityController = require('../controllers/availabilityController');
const { authenticateUser } = require('../middleware/authMiddleware');

// Update menu item availability
router.put('/:itemId', authenticateUser, availabilityController.updateAvailability);

module.exports = router;