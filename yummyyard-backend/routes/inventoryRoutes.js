const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { authenticateUser } = require('../middleware/authMiddleware');

router.get('/', inventoryController.getAllIngredients);
router.post('/', inventoryController.addIngredient);
router.put('/:id', inventoryController.updateIngredient);
router.delete('/:id', inventoryController.deleteIngredient);
router.get('/report/pdf', authenticateUser, inventoryController.downloadInventoryReport);
router.get('/menu-items-with-low-stock', inventoryController.getMenuItemsWithLowStock);

module.exports = router;
