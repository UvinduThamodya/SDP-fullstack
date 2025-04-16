const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
console.log(authController);
// Customer registration and login
router.post('/customer/register', authController.registerCustomer);
router.post('/customer/login', authController.loginCustomer);

// Staff registration and login
router.post('/staff/register', authController.registerStaff);
router.post('/staff/login', authController.loginStaff);

module.exports = router;
