import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-primary-600 text-white shadow">
      <div className="flex items-center gap-4">
        <Link to="/" className="font-bold text-lg">StackIt</Link>
      </div>
      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <>
            <span className="font-medium">{user.username}</span>
            <button onClick={handleLogout} className="bg-primary-800 px-3 py-1 rounded hover:bg-primary-700">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:underline">Login</Link>
            <Link to="/register" className="hover:underline">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
} 