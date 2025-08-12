import React, { useState } from 'react';
import api from '../api';
import useAuth from '../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const from = location.state?.from?.pathname || '/';
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      // your backend returns: id, username, email, role, token
      const { token, ...rest } = res.data;
      login({ token, user: rest });
      navigate(from); // send them home (or back)
    } catch (err) {
      console.error(err);
      setError('Invalid email or password.');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 mt-10 bg-white rounded-xl shadow">
      <h1 className="text-2xl font-bold text-green-800 mb-4">Log in</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            className="w-full border rounded px-3 py-2"
            type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input
            className="w-full border rounded px-3 py-2"
            type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
          />
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="w-full bg-green-700 text-white py-2 rounded font-semibold hover:bg-green-800 transition">
          Log in
        </button>
      </form>
    </div>
  );
}
