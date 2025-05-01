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
    const { name, category, price, description, image_url } = req.body;

    if (!name || !category || !price) {
      return res.status(400).json({ error: 'Name, category, and price are required' });
    }

    const newMenuItem = await MenuItem.create({ name, category, price, description, image_url });
    res.status(201).json({ message: 'Menu item created successfully', menuItem: newMenuItem });
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(500).json({ error: 'Failed to create menu item' });
  }
};

// ✅ Update a menu item (with validation)
const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, description, image_url } = req.body;

    console.log("Update request received for item:", id);
    console.log("Request body:", req.body);

    if (!id) {
      return res.status(400).json({ error: 'Menu item ID is required' });
    }

    if (!name || !category || !price || !image_url) {
      return res.status(400).json({ error: 'All fields (name, category, price, description, image_url) are required' });
    }

    const updatedMenuItem = await MenuItem.update(id, { name, category, price, description, image_url });

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

// Add a new menu item (alternative handler)
const addMenuItem = async (req, res) => {
  try {
    const { name, description, price, category, image_url } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ success: false, error: 'Name, price, and category are required' });
    }

    const newMenuItem = await MenuItem.addMenuItem({
      name,
      description,
      price,
      category,
      image_url,
    });

    res.status(201).json({
      success: true,
      message: 'Menu item added successfully',
      menuItem: newMenuItem,
    });
  } catch (error) {
    console.error('Error adding menu item:', error);
    res.status(500).json({ success: false, error: 'Failed to add menu item' });
  }
};

const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await MenuItem.delete(id);
    if (!result) {
      return res.status(404).json({ error: "Menu item not found" });
    }
    res.json({ message: "Menu item deleted successfully" });
  } catch (error) {
    console.error("Error deleting menu item:", error);
    res.status(500).json({ error: "Failed to delete menu item" });
  }
};


// Export all handlers
module.exports = {
  getAllMenuItems,
  getMenuItemsByCategory,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  addMenuItem,
  updateMenuItemImage,
};
