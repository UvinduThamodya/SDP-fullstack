import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiService = {
  // User registration
  register: async (userData) => {
    try {
      console.log("hi")
      const response = await axios.post(`${API_URL}/auth/register`, userData, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data;
    } catch (error) {
      console.error("Registration error:", error.response?.data || error.message);
      throw error;
    }
  },

  // User login
  login: async (credentials) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Login failed. Please try again.');
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
  }
};

export default apiService;
