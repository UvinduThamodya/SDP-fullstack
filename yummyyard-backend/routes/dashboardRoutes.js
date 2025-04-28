const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticateUser, authenticateAdmin } = require('../middleware/authMiddleware');

// // Dashboard data endpoints (admin only)
// router.get('/inventory/low-stock', authenticateAdmin, dashboardController.getLowStockItems);
// router.get('/top-items', authenticateAdmin, dashboardController.getTopOrderedItems);
// router.get('/least-ordered-item', authenticateAdmin, dashboardController.getLeastOrderedItem);
// router.get('/recent-order', authenticateAdmin, dashboardController.getMostRecentOrder);

// // Inventory management endpoints
// router.get('/inventory/ingredients', authenticateAdmin, dashboardController.getAllIngredients);
// router.post('/inventory/orders', authenticateAdmin, dashboardController.createStockOrder);
// router.get('/inventory/orders/:orderId/receipt', authenticateAdmin, dashboardController.downloadStockOrderReceipt);

// Ensure all functions exist in dashboardController
router.get('/inventory/low-stock', authenticateAdmin,dashboardController.getLowStockItems);
router.get('/inventory/top-ordered', authenticateAdmin,dashboardController.getTopOrderedItems);
router.get('/least-ordered', dashboardController.getLeastOrderedItem);
router.get('/inventory', dashboardController.getAllInventory);

module.exports = router;    