const express = require('express');
const router = express.Router();
const favoritesController = require('../controllers/favoritesController');
const { authenticateUser } = require('../middleware/authMiddleware');

router.post('/:itemId', authenticateUser, favoritesController.toggleFavorite);
router.get('/', authenticateUser, favoritesController.getFavorites);

module.exports = router;
