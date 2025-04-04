const MenuItem = require('../models/menuItemmodel');

// Get all menu items
const getAllMenuItems = async (req, res) => {
  try {
    const menuItems = await MenuItem.getAllMenuItems();
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({
      message: 'Error retrieving menu items',
      error: error.message,
    });
  }
};

// Get menu items by category
const getMenuItemsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const menuItems = await MenuItem.getMenuItemsByCategory(category);
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({
      message: `Error retrieving ${category} menu items`,
      error: error.message,
    });
  }
};

// Create a new menu item
const createMenuItem = async (req, res) => {
  try {
    const { name, category, price, description } = req.body;

    if (!name || !category || !price) {
      return res.status(400).json({ error: 'Name, category, and price are required' });
    }

    // Assuming you have a MenuItem model with a create method
    const newMenuItem = await MenuItem.create({ name, category, price, description });
    res.status(201).json({ message: 'Menu item created successfully', menuItem: newMenuItem });
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(500).json({ error: 'Failed to create menu item' });
  }
};

// Update a menu item
const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, description } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Menu item ID is required' });
    }

    
    // Assuming you have a MenuItem model with an update method
    const updatedMenuItem = await MenuItem.update(id, { name, category, price, description });

    if (!updatedMenuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.status(200).json({ message: 'Menu item updated successfully', menuItem: updatedMenuItem });
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
};

// Update a menu item image
const updateMenuItemImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { imageUrl } = req.body;

    if (!id || !imageUrl) {
      return res.status(400).json({ error: 'Menu item ID and image URL are required' });
    }

    // Assuming you have a MenuItem model with an updateImage method
    const updatedMenuItem = await MenuItem.updateImage(id, imageUrl);

    if (!updatedMenuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.status(200).json({ message: 'Menu item image updated successfully', menuItem: updatedMenuItem });
  } catch (error) {
    console.error('Error updating menu item image:', error);
    res.status(500).json({ error: 'Failed to update menu item image' });
  }
};

// Export all functions
module.exports = {
  getAllMenuItems,
  getMenuItemsByCategory,
  createMenuItem,
  updateMenuItem,
  updateMenuItemImage,
};