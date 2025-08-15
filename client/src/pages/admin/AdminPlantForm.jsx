import React, { useEffect, useState } from 'react';
import api from '../../api';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { TIERS, LIGHTS, SOILS } from '../../constants/plantEnums';

const SOIL_LABELS = {
  'all-purpose': 'All-Purpose Potting Mix',
  'well-draining-aerated': 'Well-Draining & Aerated Mix',
  'moisture-retentive': 'Moisture-Retentive Mix',
  'cactus-succulent': 'Cactus & Succulent Mix',
  'orchid-epiphytic': 'Orchid & Epiphytic Mix',
  'specialty-acidic': 'Specialty Acidic Mix',
};

export default function AdminPlantForm() {
  const { id } = useParams(); // if present => edit
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    scientificName: '',
    tier: 'standard',
    wateringFrequencyDays: 7,
    fertilizingFrequencyDays: 30,
    light: 'medium',
    soil: 'well-draining',
    petFriendly: false,
  });
  const [saving, setSaving] = useState(false);
  const isEdit = !!id;

  useEffect(() => {
    const load = async () => {
      if (!isEdit) return;
      try {
        const res = await api.get(`/plants/${id}`);
        const data = res.data;
        if (!data) {
          toast.error('Plant not found');
          navigate('/admin/plants');
          return;
        }
        setForm({
          name: data.name || '',
          scientificName: data.scientificName || '',
          tier: data.tier || 'standard',
          wateringFrequencyDays: data.wateringFrequencyDays ?? 7,
          fertilizingFrequencyDays: data.fertilizingFrequencyDays ?? 30,
          light: data.light || 'medium',
          soil: data.soil || 'well-draining',
          petFriendly: !!data.petFriendly,
        });
      } catch (e) {
        console.error(e);
        toast.error('Failed to load plant.');
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (isEdit) {
        await api.patch(`/plants/${id}`, form);
        toast.success('Plant updated.');
      } else {
        await api.post('/plants', form);
        toast.success('Plant created.');
      }
      navigate('/admin/plants');
    } catch (e) {
      console.error(e);
      toast.error('Save failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-green-900 mb-6">
        {isEdit ? 'Edit Plant' : 'New Plant'}
      </h1>

      <form onSubmit={onSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow">
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input name="name" value={form.name} onChange={onChange} className="w-full border rounded px-3 py-2" required />
        </div>

        <div>
          <label className="block text-sm mb-1">Scientific Name</label>
          <input name="scientificName" value={form.scientificName} onChange={onChange} className="w-full border rounded px-3 py-2" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Tier</label>
            <select name="tier" value={form.tier} onChange={onChange} className="w-full border rounded px-3 py-2">
              {TIERS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Light</label>
            <select name="light" value={form.light} onChange={onChange} className="w-full border rounded px-3 py-2">
              {LIGHTS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Soil</label>
            <select name="soil" value={form.soil} onChange={onChange} className="w-full border rounded px-3 py-2">
              {SOILS.map(s => (
               <option key={s} value={s}>
                {SOIL_LABELS[s] ?? s}
                </option>
                ))}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Recommended Watering (days)</label>
              <input
                type="number"
                min="1"
                className="w-full border rounded px-3 py-2"
                value={form.wateringFrequencyDays ?? 7}
                onChange={(e) => setForm(f => ({ ...f, wateringFrequencyDays: Number(e.target.value) }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Recommended Fertilizing (days)</label>
              <input
                type="number"
                min="1"
                className="w-full border rounded px-3 py-2"
                value={form.fertilizingFrequencyDays ?? 30}
                onChange={(e) => setForm(f => ({ ...f, fertilizingFrequencyDays: Number(e.target.value) }))}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 mt-2">
            <input type="checkbox" name="petFriendly" checked={form.petFriendly} onChange={onChange} className="h-4 w-4 accent-green-600" />
            <span className="text-sm">Pet friendly</span>
          </label>
        </div>

        <button disabled={saving} className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 transition">
          {saving ? 'Saving…' : 'Save'}
        </button>
      </form>
    </div>
  );
}
