import axios from 'axios';

// Base API URL (can be overridden with environment variable)
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiService = {
  // Staff registration
  registerStaff: async (staffData) => {
    try {
      const response = await axios.post(`${API_URL}/staff/register`, staffData, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data;
    } catch (error) {
      console.error("Staff registration error:", error.response?.data || error.message);
      throw error;
    }
  },

  // Staff login
  loginStaff: async (credentials) => {
    try {
      const response = await axios.post(`${API_URL}/staff/login`, credentials, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data;
    } catch (error) {
      console.error("Staff login error:", error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Login failed. Please try again.');
    }
  },

  // Fetch staff profile
  getStaffProfile: async (staffId) => {
    try {
      const response = await axios.get(`${API_URL}/staff/${staffId}`, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data;
    } catch (error) {
      console.error("Fetch staff profile error:", error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to fetch staff profile.');
    }
  },

  // Customer registration
  registerCustomer: async (customerData) => {
    try {
      const response = await axios.post(`${API_URL}/customers/register`, customerData, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data;
    } catch (error) {
      console.error("Customer registration error:", error.response?.data || error.message);
      throw error;
    }
  },

  // Customer login
  loginCustomer: async (credentials) => {
    try {
      const response = await axios.post(`${API_URL}/customers/login`, credentials, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data;
    } catch (error) {
      console.error("Customer login error:", error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Login failed. Please try again.');
    }
  },

  // Fetch customer profile
  getCustomerProfile: async (customerId) => {
    try {
      const response = await axios.get(`${API_URL}/customers/${customerId}`, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data;
    } catch (error) {
      console.error("Fetch customer profile error:", error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to fetch customer profile.');
    }
  },

  // Fetch inventory items
  getInventoryItems: async () => {
    try {
      const response = await axios.get(`${API_URL}/inventory`, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data.ingredients; // Assuming backend returns `{ success, ingredients }`
    } catch (error) {
      console.error("Fetch inventory items error:", error.response?.data || error.message);
      throw new Error('Failed to fetch inventory items.');
    }
  },

  // Add inventory item
  addInventoryItem: async (itemData) => {
    try {
      const response = await axios.post(`${API_URL}/inventory`, itemData, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data;
    } catch (error) {
      console.error("Add inventory item error:", error.response?.data || error.message);
      throw new Error('Failed to add inventory item.');
    }
  },

  // Update inventory item
  updateInventoryItem: async (itemId, updatedData) => {
    try {
      const response = await axios.put(`${API_URL}/inventory/${itemId}`, updatedData, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data;
    } catch (error) {
      console.error("Update inventory item error:", error.response?.data || error.message);
      throw new Error('Failed to update inventory item.');
    }
  },

  // Delete inventory item
  deleteInventoryItem: async (itemId) => {
    try {
      const response = await axios.delete(`${API_URL}/inventory/${itemId}`, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data;
    } catch (error) {
      console.error("Delete inventory item error:", error.response?.data || error.message);
      throw new Error('Failed to delete inventory item.');
    }
  },
};

export default apiService;
