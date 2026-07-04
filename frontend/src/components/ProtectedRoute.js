import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, role }) => {
  const { auth } = useContext(AuthContext);

  if (!auth?.token || auth.role !== role) {
    const redirect = role === 'owner' ? '/owner-auth' : '/user-auth';
    return <Navigate to={redirect} replace />;
  }

  return children;
};

export default ProtectedRoute;
