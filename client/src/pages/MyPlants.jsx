import React, { useEffect, useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

function fmt(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString();
}

export default function MyPlants() {
  const { isAuthed } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!isAuthed) {
      navigate('/login');
      return;
    }
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get('/userplants'); // protected GET
        setItems(res.data || []);
      } catch (e) {
        console.error(e);
        setMsg('Could not load your plants.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAuthed, navigate]);

  const logCare = async (userPlantId, type) => {
    try {
      await api.patch(`/userplants/${userPlantId}/care`, { type }); // "water" | "fertilize"
      // refresh just this item
      const refreshed = await api.get('/userplants');
      setItems(refreshed.data || []);
      setMsg(type === 'water' ? 'Watered!' : 'Fertilized!');
      setTimeout(() => setMsg(''), 1500);
    } catch (e) {
      console.error(e);
      setMsg('Failed to log care.');
      setTimeout(() => setMsg(''), 2000);
    }
  };

  if (loading) return <div className="p-8 text-center text-green-800">Loading your plants…</div>;

  return (
    <section className="py-10 px-4 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-green-900 mb-6">My Plants</h1>
      {msg && <div className="mb-4 text-green-700">{msg}</div>}

      {items.length === 0 ? (
        <div className="text-gray-600">You haven’t added any plants yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((up) => {
            const img = up.primaryImage?.url || up.images?.[0]?.url || up.plant?.primaryImage?.url || '/images/placeholder.jpg';
            return (
              <div key={up._id} className="bg-white rounded-xl shadow overflow-hidden">
                <img src={img} alt={up.nickname || up.plant?.name} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-green-900">
                    {up.nickname || up.plant?.name}
                  </h3>
                  {up.plant?.name && (
                    <p className="text-sm text-gray-600 italic">{up.plant.name}</p>
                  )}

                  <div className="mt-3 text-sm text-gray-800 space-y-1">
                    <div><strong>Last watered:</strong> {fmt(up.lastWatered)}</div>
                    <div><strong>Next watering due:</strong> {fmt(up.nextWateringDue)}</div>
                    <div><strong>Last fertilized:</strong> {fmt(up.lastFertilized)}</div>
                    <div><strong>Next fertilizing due:</strong> {fmt(up.nextFertilizingDue)}</div>
                  </div>

                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => logCare(up._id, 'water')}
                      className="flex-1 bg-green-700 text-white py-2 rounded hover:bg-green-800 transition"
                    >
                      Log Water
                    </button>
                    <button
                      onClick={() => logCare(up._id, 'fertilize')}
                      className="flex-1 bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700 transition"
                    >
                      Log Fertilizer
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
