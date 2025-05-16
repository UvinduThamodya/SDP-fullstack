const express = require('express');
const router = express.Router();
const { getAvailability, setAvailability } = require('../controllers/availabilityController');
const { authenticateUser } = require('../middleware/authMiddleware');

router.get('/', getAvailability);
router.post('/', authenticateUser, setAvailability);

module.exports = router;
