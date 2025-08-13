import React, { useEffect, useState } from 'react';
import api from '../../api';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function AdminModeration() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get('/plants/admin/community/pending');
      setItems(res.data?.items || []);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load pending submissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const approve = async (plantId, imageId) => {
    try {
      setWorkingId(imageId);
      await api.patch(`/plants/admin/community/${plantId}/${imageId}/approve`);
      toast.success('Approved.');
      await load();
    } catch (e) {
      console.error(e);
      toast.error('Approve failed.');
    } finally {
      setWorkingId(null);
    }
  };

  const reject = async (plantId, imageId) => {
    if (!window.confirm('Reject and delete this image?')) return;
    try {
      setWorkingId(imageId);
      await api.delete(`/plants/admin/community/${plantId}/${imageId}`);
      toast.success('Rejected.');
      await load();
    } catch (e) {
      console.error(e);
      toast.error('Reject failed.');
    } finally {
      setWorkingId(null);
    }
  };

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-green-900">Moderate Community Images</h1>
        <Link to="/admin/plants" className="text-green-700 hover:underline">Manage Plants</Link>
      </div>

      {items.length === 0 ? (
        <div className="text-gray-600">No pending submissions right now.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {items.map((it) => (
            <div key={it.imageId} className="bg-white rounded-xl shadow overflow-hidden">
              <img src={it.url} alt="" className="w-full h-48 object-cover" />
              <div className="p-4">
                <div className="text-sm text-gray-700">
                  <div><strong>Plant:</strong> {it.plantName}</div>
                  {it.submittedByName && <div><strong>By:</strong> {it.submittedByName}</div>}
                  {it.submittedAt && (
                    <div className="text-xs text-gray-500">
                      {new Date(it.submittedAt).toLocaleString()}
                    </div>
                  )}
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => approve(it.plantId, it.imageId)}
                    disabled={workingId === it.imageId}
                    className="flex-1 bg-green-700 text-white px-3 py-2 rounded hover:bg-green-800 transition text-sm"
                  >
                    {workingId === it.imageId ? 'Working…' : 'Approve'}
                  </button>
                  <button
                    onClick={() => reject(it.plantId, it.imageId)}
                    disabled={workingId === it.imageId}
                    className="flex-1 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition text-sm"
                  >
                    {workingId === it.imageId ? 'Working…' : 'Reject'}
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
