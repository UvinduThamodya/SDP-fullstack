const express = require('express');
const router = express.Router();
const menuItemController = require('../controllers/menuItemController');
const { upload, handleImageUpload } = require('../middleware/imageUpload');
// Route to get all menu items
router.get('/', menuItemController.getAllMenuItems);

// Route to get menu items by category
router.get('/:category', menuItemController.getMenuItemsByCategory);

module.exports = router;

// Create menu item with image upload
router.post('/', 
  upload.single('image'),
  handleImageUpload,
  menuItemController.createMenuItem
);

// Update menu item
router.patch('/:id', menuItemController.updateMenuItem);

// Update menu item image
router.patch('/:id/image', 
  upload.single('image'),
  handleImageUpload,
  menuItemController.updateMenuItemImage
);