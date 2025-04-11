const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

router.get('/', inventoryController.getAllIngredients);
router.post('/', inventoryController.addIngredient);

module.exports = router;
