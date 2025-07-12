import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="text-center mt-8">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
} 