const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

router.get('/', inventoryController.getAllIngredients);
router.post('/', inventoryController.addIngredient);
router.put('/:id', inventoryController.updateIngredient);
router.delete('/:id', inventoryController.deleteIngredient);

module.exports = router;
