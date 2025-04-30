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

// router.get('/inventory/orders/:orderId/receipt', authenticateAdmin, dashboardController.downloadStockOrderReceipt);

// Ensure all functions exist in dashboardController
router.get('/inventory/low-stock', authenticateAdmin,dashboardController.getLowStockItems);
router.get('/inventory/top-ordered', authenticateAdmin,dashboardController.getTopOrderedItems);
router.get('/least-ordered', authenticateAdmin,dashboardController.getLeastOrderedItem);
router.post('/stock-orders', authenticateAdmin, dashboardController.createStockOrder);
router.get('/inventory', authenticateAdmin,dashboardController.getAllInventory);
router.get('/stock-orders/:orderId/receipt', authenticateUser, dashboardController.downloadStockOrderReceipt);

module.exports = router;    