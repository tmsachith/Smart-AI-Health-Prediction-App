import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Backend API URL
// For Android Emulator use: http://10.0.2.2:5000/api
// For iOS Simulator use: http://localhost:5000/api
// For Physical Device use your computer's IP: http://192.168.x.x:5000/api

// IMPORTANT: Since Expo is using 192.168.8.101, use the same IP for backend
const API_URL = 'http://192.168.8.101:5000/api'; // Updated to match Expo URL

console.log('🔗 API Base URL:', API_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // Increased to 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add JWT token to requests
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - logout user
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Readings API
export const readingsAPI = {
  addReading: (readingData) => api.post('/readings/add', readingData),
  getUserReadings: (userId, params = {}) => api.get(`/readings/user/${userId}`, { params }),
  getLatestReading: (userId) => api.get(`/readings/user/${userId}/latest`),
  deleteReading: (readingId) => api.delete(`/readings/${readingId}`),
};

// Alerts API
export const alertsAPI = {
  getUserAlerts: (userId, params = {}) => api.get(`/alerts/user/${userId}`, { params }),
  getAlertById: (alertId) => api.get(`/alerts/${alertId}`),
  markAsRead: (alertId) => api.put(`/alerts/${alertId}/read`),
  acknowledgeAlert: (alertId) => api.put(`/alerts/${alertId}/acknowledge`),
  markAllAsRead: (userId) => api.put(`/alerts/user/${userId}/read-all`),
};

// Reports API
export const reportsAPI = {
  uploadReport: async (formData) => {
    try {
      // Get token from AsyncStorage first
      const token = await AsyncStorage.getItem('userToken');
      
      console.log('📤 Uploading report...');
      console.log('🔑 Token exists:', !!token);
      console.log('🌐 Upload URL:', `${API_URL}/reports/upload`);
      
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      // Create axios request with token
      const response = await axios({
        method: 'POST',
        url: `${API_URL}/reports/upload`,
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
        timeout: 120000, // 2 minutes for file upload
      });

      console.log('✅ Upload successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Upload API Error Details:');
      console.error('  - Message:', error.message);
      console.error('  - Response Status:', error.response?.status);
      console.error('  - Response Data:', error.response?.data);
      console.error('  - Request URL:', error.config?.url);
      throw error;
    }
  },
  
  getUserReports: (params = {}) => api.get('/reports', { params }),
  
  getReportById: (reportId) => api.get(`/reports/${reportId}`),
  
  deleteReport: (reportId) => api.delete(`/reports/${reportId}`),
  
  getReportStats: () => api.get('/reports/stats'),
};

export default api;
