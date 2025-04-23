// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateAdmin } = require('../middleware/authMiddleware');

// Public route - no authentication needed
router.post('/register', adminController.registerAdmin);

module.exports = router;
