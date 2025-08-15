import React, { useEffect, useMemo, useState } from 'react';
import api from '../api';
import PlantCard from '../components/PlantCard';

import { TIERS, LIGHTS, SOILS } from '../constants/plantEnums'; // adjust relative path if needed
import { SkeletonCard } from '../components/Skeletons';
const WATERING_OPTIONS = ['weekly', 'biweekly', 'monthly'];

const SOIL_LABELS = {
  'all-purpose': 'All-Purpose Potting Mix',
  'well-draining-aerated': 'Well-Draining & Aerated Mix',
  'moisture-retentive': 'Moisture-Retentive Mix',
  'cactus-succulent': 'Cactus & Succulent Mix',
  'orchid-epiphytic': 'Orchid & Epiphytic Mix',
  'specialty-acidic': 'Specialty Acidic Mix',
};


const PlantGallery = () => {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // filters
  const [tier, setTier] = useState('');
  const [light, setLight] = useState('');
  const [soil, setSoil] = useState('');
  const [watering, setWatering] = useState('');
  const [pets, setPets] = useState(false);
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');

  // Debounce search input by 300ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);

  // Build query string from filters
  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (tier) params.set('tier', tier);
    if (light) params.set('light', light);
    if (soil) params.set('soil', soil);
    if (watering) params.set('watering', watering);
    if (pets) params.set('pets', '1');
    if (debouncedQ) params.set('q', debouncedQ);
    const s = params.toString();
    return s ? `?${s}` : '';
  }, [tier, light, soil, watering, pets, debouncedQ]);

  // Fetch from server whenever filters change
  useEffect(() => {
    let cancelled = false;
    async function fetchPlants() {
      try {
        setLoading(true);
        setError('');
        const res = await api.get(`/plants${queryString}`);
        if (!cancelled) setPlants(res.data);
      } catch (err) {
        if (!cancelled) {
          console.error('Error fetching plants:', err);
          setError('Could not load plants.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchPlants();
    return () => { cancelled = true; };
  }, [queryString]);


  return (
    <section className="py-10 px-4">
      <h1 className="text-4xl font-bold text-center text-green-900 mb-8">Our Plants</h1>

        {error && (
          <div className="max-w-6xl mx-auto mb-4">
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3">
              {error}
            </div>
          </div>
        )}

      {/* Filters */}
      <div className="max-w-6xl mx-auto mb-8 bg-white rounded-xl shadow p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
          {/* Tier */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tier</label>
            <select value={tier} onChange={(e) => setTier(e.target.value)} className="w-full border rounded-md px-3 py-2">
              <option value="">All tiers</option>
              {TIERS.map(t => <option key={t} value={t}>{t[0].toUpperCase() + t.slice(1)}</option>)}
            </select>
          </div>

          {/* Light */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Light</label>
            <select value={light} onChange={(e) => setLight(e.target.value)} className="w-full border rounded-md px-3 py-2">
              <option value="">All light</option>
              {LIGHTS.map(l => <option key={l} value={l}>{l[0].toUpperCase() + l.slice(1)}</option>)}
            </select>
          </div>

          {/* Soil */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Soil</label>
            <select value={soil} onChange={(e) => setSoil(e.target.value)} className="w-full border rounded-md px-3 py-2">
              <option value="">All soil</option>
              {SOILS.map(s => (
                <option key={s} value={s}>
                  {SOIL_LABELS[s] ?? s}
                </option>
              ))}
            </select>
          </div>

          {/* Watering */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Watering</label>
            <select value={watering} onChange={(e) => setWatering(e.target.value)} className="w-full border rounded-md px-3 py-2">
              <option value="">All schedules</option>
              {WATERING_OPTIONS.map(w => <option key={w} value={w}>{w[0].toUpperCase() + w.slice(1)}</option>)}
            </select>
          </div>

          {/* Pet-friendly */}
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={pets}
              onChange={(e) => setPets(e.target.checked)}
              className="h-5 w-5 accent-green-600"
            />
            <span className="text-sm font-medium text-gray-700">Pet-friendly</span>
          </label>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Name or scientific name"
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-6xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {Array.from({ length: 9 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : plants.length === 0 ? (
          <div className="text-center text-gray-600 py-10">No plants match your filters.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {plants.map((plant) => (
              <PlantCard key={plant._id} plant={plant} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default PlantGallery;
