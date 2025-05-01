import axios from 'axios';

const API_URL = 'http://localhost:5000/api/menu-items'; // Full URL with your backend's port

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

  deleteMenuItem, // <-- add this line
};

export default MenuService;
