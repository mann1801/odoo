import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    const success = await login(email, password);
    if (success) {
      navigate('/');
    } else {
      setFormError('Invalid email or password');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="border px-3 py-2 rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="border px-3 py-2 rounded"
          required
        />
        <button
          type="submit"
          className="bg-primary-600 text-white py-2 rounded hover:bg-primary-700 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
        {(formError || error) && <div className="text-red-600 text-sm">{formError || error}</div>}
      </form>
      <div className="mt-4 text-sm">
        Don't have an account? <Link to="/register" className="text-primary-700 hover:underline">Register</Link>
      </div>
    </div>
  );
} 