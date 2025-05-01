const express = require('express');
const router = express.Router();
const menuItemController = require('../controllers/menuItemController');
const { upload, handleImageUpload } = require('../middleware/imageUpload');
const { authenticateAdmin } = require('../middleware/authMiddleware');

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
router.put('/:id', menuItemController.updateMenuItem);
router.patch('/:id', menuItemController.updateMenuItem);

// Update menu item image
router.patch('/:id/image', 
  upload.single('image'),
  handleImageUpload,
  menuItemController.updateMenuItemImage
);

router.get('/menu-items', authenticateAdmin, menuItemController.getAllMenuItems);
router.post('/menu-items', authenticateAdmin, menuItemController.addMenuItem);
router.put('/menu-items/:id', authenticateAdmin, menuItemController.updateMenuItem);
router.delete('/:id', authenticateAdmin, menuItemController.deleteMenuItem);
  
