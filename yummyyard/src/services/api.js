// import axios from 'axios';

// const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// const apiService = {
//   registerStaff: async (staffData) => {
//     try {
//       const response = await axios.post(`${API_URL}/auth/staff/register`, staffData, {
//         headers: { "Content-Type": "application/json" },
//       });
//       return response.data;
//     } catch (error) {
//       console.error("Staff registration error:", error.response?.data || error.message);
//       throw error;
//     }
//   },

//   loginStaff: async (credentials) => {
//     try {
//       const response = await axios.post(`${API_URL}/auth/staff/login`, credentials, {
//         headers: { "Content-Type": "application/json" },
//       });

//       // Store staffId in localStorage after successful login
//       if (response.data && response.data.staff && response.data.staff.id) {
//         localStorage.setItem('staffId', response.data.staff.id);
//       }

//       return response.data;
//     } catch (error) {
//       console.error("Staff login error:", error.response?.data || error.message);
//       throw error;
//     }
//   },

//   registerCustomer: async (customerData) => {
//     try {
//       const response = await axios.post(`${API_URL}/auth/customer/register`, customerData, {
//         headers: { "Content-Type": "application/json" },
//       });
//       return response.data;
//     } catch (error) {
//       console.error("Customer registration error:", error.response?.data || error.message);
//       throw error;
//     }
//   },

//   loginCustomer: async (credentials) => {
//     try {
//       const response = await axios.post(`${API_URL}/auth/customer/login`, credentials, {
//         headers: { "Content-Type": "application/json" },
//       });
//       return response.data;
//     } catch (error) {
//       console.error("Customer login error:", error.response?.data || error.message);
//       throw error;
//     }
//   },

//   getUserProfile: async (userId) => {
//     try {
//       const response = await axios.get(`${API_URL}/users/${userId}`);
//       return response.data;
//     } catch (error) {
//       throw new Error(error.response?.data?.error || 'Failed to fetch user profile.');
//     }
//   },

//   getStaffProfile: async (staffId) => {
//     try {
//       const response = await axios.get(`${API_URL}/staff/${staffId}`, {
//         headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
//       });
//       return response.data;
//     } catch (error) {
//       console.error('Error fetching staff profile:', error);
//       throw error;
//     }
//   },

//   updateStaffProfile: async (id, data) => {
//     const response = await axios.put(`${API_URL}/staff/${id}`, data, {
//       headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
//     });
//     return response.data;
//   },

// // Create Order
//   // createOrder: async (orderData) => {
//   //   try {
//   //     const token = localStorage.getItem('token'); // Retrieve the JWT token from localStorage
//   //     const response = await axios.post(`${API_URL}/orders`, orderData, {
//   //       headers: {
//   //         'Content-Type': 'application/json',
//   //         'Authorization': `Bearer ${token}`, // Include the token in the Authorization header
//   //       },
//   //     });
//   //     return response.data;
//   //   } catch (error) {
//   //     console.error('Error creating order:', error.response?.data || error.message);
//   //     throw error;
//   //   }
//   // }
//   // services/api.js
//   createOrder: async (orderData) => {
//     try {
//       const response = await axios.post('/api/orders', orderData, {
//         headers: { 
//           'Authorization': `Bearer ${localStorage.getItem('token')}`,
//           'Content-Type': 'application/json'
//         }
//       });
//       return response.data;
//     } catch (error) {
//       throw new Error(error.response?.data?.error || 'Order failed');
//     }
//   },

//   updateAdminProfile: async (adminId, profileData) => {
//     const token = localStorage.getItem('token');

//     if (!token) {
//       throw new Error('Authentication required');
//     }

//     const response = await fetch(`http://localhost:5000/api/admin/profile/${adminId}`, {
//       method: 'PUT',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${token}`
//       },
//       body: JSON.stringify(profileData)
//     });

//     if (!response.ok) {
//       throw new Error('Failed to update profile');
//     }

//     return response.json();
//   },
// };

// export default apiService;

import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiService = {
  // Existing staff functions
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

  loginStaff: async (credentials) => {
    try {
      const response = await axios.post(`${API_URL}/auth/staff/login`, credentials, {
        headers: { "Content-Type": "application/json" },
      });

      // Store staffId in localStorage after successful login
      if (response.data && response.data.staff && response.data.staff.id) {
        localStorage.setItem('staffId', response.data.staff.id);
      }

      return response.data;
    } catch (error) {
      console.error("Staff login error:", error.response?.data || error.message);
      throw error;
    }
  },

  // Existing customer functions
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

  // User profile functions
  getUserProfile: async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/users/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch user profile.');
    }
  },

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

  // Order functions
  createOrder: async (orderData) => {
    try {
      const response = await axios.post(`${API_URL}/orders`, orderData, {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Order failed');
    }
  },

  getCustomerOrders: async () => {
    try {
      const response = await axios.get(`${API_URL}/orders/history`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch order history');
    }
  },

  getOrderDetails: async (orderId) => {
    try {
      const response = await axios.get(`${API_URL}/orders/${orderId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch order details');
    }
  },

  downloadOrderReceipt: async (orderId) => {
    try {
      const response = await axios.get(`${API_URL}/orders/${orderId}/receipt`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to download receipt');
    }
  },

  // Update order status
  updateOrderStatus: async (orderId, newStatus) => {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_URL}/orders/${orderId}/status`, { status: newStatus }, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },

  // Get all orders
  getAllOrders: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/orders/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching all orders:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch orders');
    }
  },

  // Admin functions
  loginAdmin: async (credentials) => {
    try {
      const response = await axios.post(`${API_URL}/staff/login`, {
        ...credentials,
        requireAdmin: true
      }, {
        headers: { "Content-Type": "application/json" }
      });
      
      if (response.data && response.data.user) {
        localStorage.setItem('adminId', response.data.user.id);
      }
      
      return response.data;
    } catch (error) {
      console.error("Admin login error:", error.response?.data || error.message);
      throw error;
    }
  },

  registerAdmin: async (adminData) => {
    try {
      const response = await axios.post(`${API_URL}/admin/register`, adminData, {
        headers: { "Content-Type": "application/json" }
      });
      return response.data;
    } catch (error) {
      console.error("Admin registration error:", error.response?.data || error.message);
      throw error;
    }
  },

  updateAdminProfile: async (adminId, profileData) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await axios.put(`${API_URL}/admin/profile/${adminId}`, profileData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error("Error updating admin profile:", error);
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  },

  // Account management functions for admin
  getAllStaff: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/staff`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch staff members');
    }
  },

  getAllCustomers: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/customers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch customers');
    }
  },

  deleteStaff: async (staffId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_URL}/admin/staff/${staffId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete staff member');
    }
  },

  deleteCustomer: async (customerId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_URL}/admin/customers/${customerId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete customer');
    }
  },

  getLowStockItems: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/dashboard/inventory/low-stock`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching low stock items:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch low stock items');
    }
  },

  getTopOrderedItems: async (limit = 3) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/dashboard/inventory/top-ordered?limit=${limit}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching top ordered items:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch top items');
    }
  },

  getLeastOrderedItem: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/dashboard/least-ordered`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching least ordered item:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch least ordered item');
    }
  },

  getAllIngredients: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/dashboard/inventory`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching all ingredients:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch ingredients');
    }
  },

  createStockOrder: async (orderData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/inventory/orders`, orderData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating stock order:', error);
      throw new Error(error.response?.data?.message || 'Failed to create stock order');
    }
  },

  downloadStockOrderReceipt: async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/inventory/orders/${orderId}/receipt`, {
        headers: { 'Authorization': `Bearer ${token}` },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading receipt:', error);
      throw new Error(error.response?.data?.message || 'Failed to download receipt');
    }
  },

  getFavorites: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/favorites`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      // Some backends return { favorites: [...] }, others just [...]
      // Adjust as needed for your backend's response format
      if (Array.isArray(response.data)) {
        return response.data; // if backend returns an array directly
      }
      return response.data.favorites || [];
    } catch (error) {
      console.error('Error fetching favorites:', error);
      return [];
    }
  }

};
  

export default apiService;
