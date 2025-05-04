// const express = require('express');
// const router = express.Router();
// const orderController = require('../controllers/orderController');
// const { authenticateUser } = require('../middleware/authMiddleware');

// // Create new order
// router.post('/', authenticateUser, orderController.createOrder);

// module.exports = router;

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateUser } = require('../middleware/authMiddleware');



// Create new order
router.post('/', authenticateUser, orderController.createOrder);

// Get all orders for the logged-in customer
router.get('/history', authenticateUser, orderController.getCustomerOrders);

router.get('/all', authenticateUser, orderController.getAllOrders);

router.get('/report', authenticateUser, orderController.generateOrderReport);
// Get details for a specific order
router.get('/:orderId', authenticateUser, orderController.getOrderDetails);

// Generate PDF receipt for an order
router.get('/:orderId/receipt', authenticateUser, orderController.generateOrderReceipt);


router.put('/:orderId/status', authenticateUser, orderController.updateOrderStatus);


module.exports = router;
