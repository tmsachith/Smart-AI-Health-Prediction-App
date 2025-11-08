import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Backend API URL
// For Android Emulator use: http://10.0.2.2:5000/api
// For iOS Simulator use: http://localhost:5000/api
// For Physical Device use your computer's IP: http://192.168.x.x:5000/api
const API_URL = 'http://10.0.2.2:5000/api'; // Change this based on your setup

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
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

export default api;
