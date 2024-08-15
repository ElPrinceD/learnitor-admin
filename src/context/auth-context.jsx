import PropTypes from 'prop-types';
import React, { useMemo, useState, useEffect, useCallback, createContext } from 'react';

import apiClient from 'src/api-calls/api-client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  // Fetch user details when a token is available
  const fetchUserDetails = useCallback(async (authToken) => {
    try {
      const response = await apiClient.get('/api/user/', {
        headers: {
          Authorization: `Token ${authToken}`,
        },
      });

      const userData = response.data;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Failed to fetch user details', error);
      logout(); // Clear session on error
    }
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    
    if (storedToken) {
      apiClient.defaults.headers.common.Authorization = `Token ${storedToken}`;
      fetchUserDetails(storedToken);
    }
  }, [fetchUserDetails]);

  const login = async (email, password) => {
    try {
      const response = await apiClient.post('/api/login/', { email, password });

      const userToken = response.data.token;
      const userData = response.data.user;

      // Store token and user in localStorage
      localStorage.setItem('token', userToken);
      localStorage.setItem('user', JSON.stringify(userData));

      // Update state
      setToken(userToken);
      setUser(userData);
      
      // Set token in API client
      // apiClient.defaults.headers.common.Authorization = `Bearer ${userToken}`;
    } catch (error) {
      console.error('Login failed', error);
      throw new Error('Login failed. Please check your credentials and try again.');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete apiClient.defaults.headers.common.Authorization;
    setToken(null);
    setUser(null);
  };

  const value = useMemo(() => ({ token, user, login, logout }), [token, user]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthContext;
