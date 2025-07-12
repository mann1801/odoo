import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const { register, loading, error } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    if (!username || !email || !password) {
      setFormError('All fields are required');
      return;
    }
    const success = await register(username, email, password);
    if (success) {
      navigate('/');
    } else {
      setFormError('Registration failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Register</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="border px-3 py-2 rounded"
          required
        />
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
          {loading ? 'Registering...' : 'Register'}
        </button>
        {/* Show error message */}
        {(formError || error) && <div className="text-red-600 text-sm">{formError || error}</div>}
      </form>
      <div className="mt-4 text-sm">
        Already have an account? <Link to="/login" className="text-primary-700 hover:underline">Login</Link>
      </div>
    </div>
  );
}