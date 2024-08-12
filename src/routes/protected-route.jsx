import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';

import AuthContext from 'src/context/auth-context';

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;
