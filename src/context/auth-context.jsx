
import PropTypes from 'prop-types';
import React, { useMemo, useState, useEffect, createContext } from 'react';

import apiClient from 'src/api-calls/api-client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken) setToken(storedToken);
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const login = async (email, password) => {
    try {
      // Replace the URL with your actual login endpoint
      const response = await apiClient.post('/api/login/', { email, password });

      const userToken = response.data.token;
      const userData = response.data.user; // Renamed to avoid conflict

      // Store token and user in localStorage
      localStorage.setItem('token', userToken);
      localStorage.setItem('user', JSON.stringify(userData));

      // Update state
      setToken(userToken);
      setUser(userData);

      // Optionally, redirect or perform other actions on successful login
    } catch (error) {
      console.error('Login failed', error);
      // Handle login error (e.g., show a message to the user)
      throw new Error('Login failed. Please check your credentials and try again.');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
