import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_URL = 'http://localhost:8000';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      // Check if token exists in local storage on load
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser && savedUser !== "undefined") {
        // Set the default axios header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(JSON.parse(savedUser));
      } else {
        // If one exists but the other doesn't, clear both to fix corrupted states
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } catch (e) {
      console.error("Failed to parse user session", e);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });

      const { access_token, role, email: userEmail } = response.data;
      
      const userData = { email: userEmail, role, token: access_token };
      
      // Save to local storage
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Set axios default header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Login failed:", error);
      throw new Error(error.response?.data?.detail || "Failed to login. Please check credentials.");
    }
  };
  
  const register = async (email, password, role) => {
      try {
          const response = await axios.post(`${API_URL}/auth/register`, {
              email, password, role
          });
          // Auto login after register
          return await login(email, password);
      } catch (error) {
          throw new Error(error.response?.data?.detail || "Registration failed.");
      }
  }

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
