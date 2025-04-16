const express = require('express');
const router = express.Router();
const { registerStaff } = require('../controllers/staffController');
const staffController = require('../controllers/staffController');

router.post('/login', staffController.staffLogin);
router.post('/register', registerStaff);
router.get('/:id', staffController.getStaffProfile);
// routes/staffRoutes.js
router.put('/:id', staffController.updateStaffProfile);

module.exports = router;
