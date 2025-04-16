import axios from 'axios';

const API_URL = 'http://localhost:5000/api/menu-items'; // Full URL with your backend's port

const  MenuService = {
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

  // Update menu item
  updateMenuItem: async (id, formData) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating menu item:', error);
      throw error;
    }
  }
};

export default MenuService;
