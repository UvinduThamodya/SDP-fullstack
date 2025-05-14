import axios from 'axios';

const API_URL = 'http://localhost:5000/api/menu-items'; // Full URL with your backend's port
const INVENTORY_API_URL = 'http://localhost:5000/api/inventory';

const CLOUDINARY_UPLOAD_PRESET = "menuitem_upload_preset";
const CLOUDINARY_CLOUD_NAME = "ddly9e3qr";

// Upload image to Cloudinary
export async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );
  if (!response.ok) throw new Error('Image upload failed');
  const data = await response.json();
  return data.secure_url; // This is the image URL you save in your DB
}

// Delete a menu item
const deleteMenuItem = async (id) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.delete(`${API_URL}/${id}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting menu item:', error);
    throw error;
  }
};

const MenuService = {
  // Create a new menu item
  createMenuItem: async (formData) => {
    try {
      const response = await axios.post(API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {  
      console.error('Error creating menu item:', error);
      throw error;
    }
  },

  // Fetch menu items
  getMenuItems: async () => {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error) {
      console.error('Error fetching menu items:', error);
      throw error;
    }
  },

  // Fetch low stock menu items
 getLowStockMenuItems: async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/inventory/menu-items-with-low-stock');
      return response.data.menuItems; // Assuming the backend returns menuItems in the response
    } catch (error) {
      console.error('Error fetching low stock menu items:', error);
      throw error;
    }
  },

  // Update menu item
  updateMenuItem: async (id, data) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.put(`${API_URL}/${id}`, data, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating menu item:', error);
      throw error;
    }
  },
  
  // Add a new menu item
  addMenuItem: async (data) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(API_URL, data, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error adding menu item:', error);
      throw error;
    }
  },

  // --- Menu Item Ingredient Management (Inventory endpoints) ---

  getMenuItemIngredients: async (menuItemId) => {
    try {
      const response = await axios.get(`${INVENTORY_API_URL}/menu-item/${menuItemId}/ingredients`);
      return response.data;
    } catch (error) {
      console.error('Error fetching menu item ingredients:', error);
      throw error;
    }
  },

  addMenuItemIngredient: async (menuItemId, data) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${INVENTORY_API_URL}/menu-item/${menuItemId}/ingredients`,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error adding menu item ingredient:', error);
      throw error;
    }
  },

  editMenuItemIngredient: async (menuItemId, menuItemIngredientId, data) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${INVENTORY_API_URL}/menu-item/${menuItemId}/ingredients/${menuItemIngredientId}`,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error editing menu item ingredient:', error);
      throw error;
    }
  },

  deleteMenuItemIngredient: async (menuItemId, menuItemIngredientId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${INVENTORY_API_URL}/menu-item/${menuItemId}/ingredients/${menuItemIngredientId}`,
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting menu item ingredient:', error);
      throw error;
    }
  },

  deleteMenuItem,
};

export default MenuService;
