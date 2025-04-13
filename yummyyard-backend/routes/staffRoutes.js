const express = require('express');
const router = express.Router();
const { registerStaff } = require('../controllers/staffController');
const { getStaffById } = require('../controllers/staffController');
const staffController = require('../controllers/staffController');

router.post('/login', staffController.staffLogin);
router.post('/register', registerStaff);
router.get('/:id', getStaffById);
router.put('/:id', staffController.updateStaff);

module.exports = router;
