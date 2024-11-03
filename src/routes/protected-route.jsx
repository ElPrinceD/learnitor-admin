import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';

import CircularProgress from '@mui/material/CircularProgress'; // Importing MUI loading indicator

import AuthContext from 'src/context/auth-context';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) {
    return <CircularProgress />;  // Display loading indicator while loading
  }
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;
