import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../api';
import { toast } from 'react-hot-toast';

export default function AdminPlantsList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);

  const q = searchParams.get('q') || '';

  const load = async () => {
    try {
      setLoading(true);
      // reuse your server filtering if you like; for now just q
      const res = await api.get('/plants', { params: q ? { q } : {} });
      setPlants(res.data || []);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load plants.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [q]);

  const onSearch = (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const v = form.get('q')?.trim();
    setSearchParams(v ? { q: v } : {});
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this plant? This cannot be undone.')) return;
    try {
      await api.delete(`/plants/${id}`);
      toast.success('Plant deleted.');
      load();
    } catch (e) {
      console.error(e);
      toast.error('Delete failed.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-green-900">Manage Plants</h1>
        <Link
          to="/admin/plants/new"
          className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 transition"
        >
          + New Plant
        </Link>
      </div>

      <form onSubmit={onSearch} className="mb-4 flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by name or scientific name"
          className="border rounded px-3 py-2 w-full"
        />
        <button className="bg-gray-800 text-white px-4 py-2 rounded">Search</button>
      </form>

      {loading ? (
        <div>Loading…</div>
      ) : plants.length === 0 ? (
        <div className="text-gray-600">No plants found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plants.map((p) => (
            <div key={p._id} className="bg-white rounded-xl shadow p-4 flex gap-4">
              <img
                src={p.primaryImage?.url || p.images?.[0]?.url || '/images/placeholder.jpg'}
                alt={p.name}
                className="w-28 h-28 object-cover rounded"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-green-900">{p.name}</h3>
                {p.scientificName && (
                  <p className="text-sm text-gray-600 italic">{p.scientificName}</p>
                )}
                <p className="text-xs text-gray-500 mt-1 capitalize">
                  Tier: {p.tier} | Light: {p.light} | Soil: {p.soil}
                </p>
                <div className="mt-3 flex gap-2">
                  <Link
                    to={`/admin/plants/${p._id}/edit`}
                    className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
                  >
                    Edit
                  </Link>
                  <Link
                    to={`/admin/plants/${p._id}/images`}
                    className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
                  >
                    Images
                  </Link>
                  <button
                    onClick={() => remove(p._id)}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
