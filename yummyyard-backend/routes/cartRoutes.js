// // routes/cartRoutes.js
// const express = require('express');
// const router = express.Router();
// const cartController = require('../controllers/cartController');

// router.post('/add', cartController.addToCart);
// router.get('/:customerId', cartController.getCart);

// module.exports = router;

// routes/cartRoutes.js
const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authenticateUser } = require('../middleware/authMiddleware');

// Protected routes
router.post('/add', authenticateUser, cartController.addToCart);
router.get('/:customerId', authenticateUser, cartController.getCart);

module.exports = router;
