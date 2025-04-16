import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiService = {

  registerStaff: async (staffData) => {
    try {
      const response = await axios.post(`${API_URL}/auth/staff/register`, staffData, {
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
      const response = await axios.post(`${API_URL}/auth/staff/login`, credentials, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data;
    } catch (error) {
      console.error("Staff login error:", error.response?.data || error.message);
      throw error;
    }
  },

  // Customer registration
  registerCustomer: async (customerData) => {
    try {
      const response = await axios.post(`${API_URL}/auth/customer/register`, customerData, {
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
      const response = await axios.post(`${API_URL}/auth/customer/login`, credentials, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data;
    } catch (error) {
      console.error("Customer login error:", error.response?.data || error.message);
      throw error;
    }
  },

  // Fetch user profile (optional, can be used later)
  getUserProfile: async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/users/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch user profile.');
    }
  },

  // Fetch staff profile
  getStaffProfile: async (staffId) => {
    try {
      const response = await axios.get(`${API_URL}/staff/${staffId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching staff profile:', error);
      throw error;
    }
  },
  
  updateStaffProfile: async (id, data) => {
    const response = await axios.put(`${API_URL}/staff/${id}`, data, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  },

  // Create Order
  // createOrder: async (orderData) => {
  //   try {
  //     const token = localStorage.getItem('token'); // Retrieve the JWT token from localStorage
  //     const response = await axios.post(`${API_URL}/orders`, orderData, {
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': `Bearer ${token}`, // Include the token in the Authorization header
  //       },
  //     });
  //     return response.data;
  //   } catch (error) {
  //     console.error('Error creating order:', error.response?.data || error.message);
  //     throw error;
  //   }
  // }
  // services/api.js
createOrder: async (orderData) => {
  try {
    const response = await axios.post('/api/orders', orderData, {
      headers: { 
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Order failed');
  }
}

  
};

export default apiService;
