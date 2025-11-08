import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user data on app start
  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('userToken');
      const storedUser = await AsyncStorage.getItem('userData');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading stored data:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authAPI.login({ email, password });

      if (response.success) {
        const { user, token } = response.data;

        // Store token and user data
        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('userData', JSON.stringify(user));

        setToken(token);
        setUser(user);

        return { success: true };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authAPI.register(userData);

      if (response.success) {
        const { user, token } = response.data;

        // Store token and user data
        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('userData', JSON.stringify(user));

        setToken(token);
        setUser(user);

        return { success: true };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Clear storage
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');

      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const updateUser = async (updates) => {
    try {
      const response = await authAPI.updateProfile(updates);
      
      if (response.success) {
        const updatedUser = response.data;
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
        setUser(updatedUser);
        return { success: true };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Update failed';
      return { success: false, message: errorMessage };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        isAuthenticated: !!token,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
