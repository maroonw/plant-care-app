import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api';
import useAuth from '../hooks/useAuth';
import { toast } from 'react-hot-toast';

export default function Signup() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [firstName, setFirstName]   = useState('');
  const [lastName, setLastName]     = useState('');
  const [email, setEmail]           = useState('');
  const [username, setUsername]     = useState('');
  const [password, setPassword]     = useState('');
  const [confirm, setConfirm]       = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error('Passwords do not match.');
      return;
    }
    try {
      setSubmitting(true);

      // fallback username if left blank (before @)
      const finalUsername = username || email.split('@')[0];

      const res = await api.post('/auth/register', {
        username: finalUsername,
        firstName,
        lastName,
        email,
        password,
        role: 'customer',
      });

      const { token, ...user } = res.data;
      login({ token, user });             // save token + user to context/storage
      toast.success('Welcome! Your account is ready.');
      navigate(from);                      // go back to where they wanted to go
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || 'Signup failed.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 mt-10 bg-white rounded-xl shadow">
      <h1 className="text-2xl font-bold text-green-800 mb-4">Create your account</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">First name</label>
            <input className="w-full border rounded px-3 py-2"
              value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm mb-1">Last name</label>
            <input className="w-full border rounded px-3 py-2"
              value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">Email</label>
          <input type="email" className="w-full border rounded px-3 py-2"
            value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>

        <div>
          <label className="block text-sm mb-1">Username (optional)</label>
          <input className="w-full border rounded px-3 py-2"
            placeholder="auto-fills from email if blank"
            value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input type="password" className="w-full border rounded px-3 py-2"
              value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm mb-1">Confirm</label>
            <input type="password" className="w-full border rounded px-3 py-2"
              value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          </div>
        </div>

        <button
          disabled={submitting}
          className="w-full bg-green-700 text-white py-2 rounded font-semibold hover:bg-green-800 transition"
        >
          {submitting ? 'Creating…' : 'Sign up'}
        </button>
      </form>

      <p className="text-sm text-gray-600 mt-4">
        Already have an account? <a href="/login" className="text-green-700 hover:underline">Log in</a>
      </p>
    </div>
  );
}
