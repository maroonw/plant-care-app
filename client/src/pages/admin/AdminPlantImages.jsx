// client/src/pages/admin/AdminPlantImages.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api';
import { toast } from 'react-hot-toast';

export default function AdminPlantImages() {
  const { id } = useParams(); // plantId
  const navigate = useNavigate();

  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/plants/${id}`);
      setPlant(res.data);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load plant');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const setPrimary = async (imageId) => {
    try {
      setBusy(true);
      await api.patch(`/plants/${id}/images/${imageId}/set-primary`);
      toast.success('Primary set');
      await load();
    } catch (e) {
      console.error(e);
      toast.error('Failed to set primary');
    } finally {
      setBusy(false);
    }
  };

  const removeImage = async (imageId) => {
    if (!window.confirm('Delete this curated image?')) return;
    try {
      setBusy(true);
      await api.delete(`/plants/${id}/images/${imageId}`);
      toast.success('Image deleted');
      await load();
    } catch (e) {
      console.error(e);
      toast.error('Failed to delete image');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="p-6">Loading…</div>;
  if (!plant) return <div className="p-6">Plant not found</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-green-900">
          Curated Images — {plant.name}
        </h1>
        <Link to="/admin/plants" className="text-green-700 hover:underline">
          Back to Plants
        </Link>
      </div>

      <div className="mb-4">
        <strong>Primary:</strong>{' '}
        {plant.primaryImage?.url ? (
          <img
            src={plant.primaryImage.url}
            alt="Primary"
            className="inline-block h-16 w-16 object-cover rounded ml-2 align-middle"
          />
        ) : (
          <span className="text-gray-600">none</span>
        )}
      </div>

      {(!plant.images || plant.images.length === 0) ? (
        <div className="text-gray-600">No curated images yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {plant.images.map((img) => (
            <div key={img._id} className="bg-white rounded-xl shadow overflow-hidden">
              <img src={img.url} alt="" className="w-full h-48 object-cover" />
              <div className="p-3 flex gap-2">
                <button
                  onClick={() => setPrimary(img._id)}
                  disabled={busy}
                  className="flex-1 bg-green-700 text-white px-3 py-2 rounded disabled:opacity-50"
                >
                  {busy ? 'Working…' : 'Set Primary'}
                </button>
                <button
                  onClick={() => removeImage(img._id)}
                  disabled={busy}
                  className="flex-1 bg-red-600 text-white px-3 py-2 rounded disabled:opacity-50"
                >
                  {busy ? 'Working…' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
