import React, { useEffect, useState } from 'react';
import api from '../../api';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export default function AdminPlantImages() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plant, setPlant] = useState(null);
  const [files, setFiles] = useState(null);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    try {
      // prefer /plants/:id if available
      const res = await api.get('/plants');
      const data = (res.data || []).find(p => p._id === id);
      if (!data) {
        toast.error('Plant not found.');
        navigate('/admin/plants');
        return;
      }
      setPlant(data);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load plant.');
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const onUpload = async () => {
    if (!files || files.length === 0) {
      toast('Choose images first.');
      return;
    }
    try {
      setUploading(true);
      const form = new FormData();
      Array.from(files).forEach((f) => form.append('images', f));
      await api.post(`/plants/${id}/upload`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Images uploaded.');
      await load();
      setFiles(null);
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  if (!plant) return <div className="p-6">Loading…</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-green-900 mb-4">Images: {plant.name}</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {(plant.images || []).map((im) => (
          <div key={im._id} className="bg-white rounded shadow overflow-hidden">
            <img src={im.url} alt="" className="w-full h-40 object-cover" />
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        <input type="file" multiple accept="image/*" onChange={(e) => setFiles(e.target.files)} />
        <button
          onClick={onUpload}
          disabled={uploading}
          className="ml-3 bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 transition"
        >
          {uploading ? 'Uploading…' : 'Upload'}
        </button>
        <p className="text-xs text-gray-500 mt-1">First uploaded image becomes primary if none exists.</p>
      </div>
    </div>
  );
}
