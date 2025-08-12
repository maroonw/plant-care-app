import React from 'react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-green-900 mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/admin/plants" className="block p-6 rounded-xl shadow bg-white hover:shadow-lg transition">
          <h2 className="text-xl font-semibold text-green-800 mb-2">Manage Plants</h2>
          <p className="text-gray-600 text-sm">Create, edit, upload curated images, set primary, delete.</p>
        </Link>
        <Link to="/admin/moderation" className="block p-6 rounded-xl shadow bg-white hover:shadow-lg transition">
          <h2 className="text-xl font-semibold text-green-800 mb-2">Moderate Community Images</h2>
          <p className="text-gray-600 text-sm">Review newly submitted community images and approve/deny.</p>
        </Link>
      </div>
    </div>
  );
}
