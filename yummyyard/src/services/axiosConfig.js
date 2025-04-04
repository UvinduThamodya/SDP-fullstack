import axios from 'axios';

// Base URL for API calls
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Optional: Add interceptors for error handling or adding auth tokens
axios.interceptors.request.use(
  config => {
    // Add any global request configurations
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export default axios;