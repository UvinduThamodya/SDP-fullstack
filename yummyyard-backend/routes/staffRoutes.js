const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');

router.post('/login', staffController.staffLogin);
router.post('/register', registerStaff);

module.exports = router;
