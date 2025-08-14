// client/src/pages/PlantDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import useAuth from '../hooks/useAuth';
import { toast } from 'react-hot-toast';

const PlantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthed } = useAuth();

  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);

  // Add-to-my-plants
  const [adding, setAdding] = useState(false);

  // Community images (approved only)
  const [community, setCommunity] = useState([]);

  // Upload state
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Load plant + approved community images
  const load = async () => {
    try {
      setLoading(true);
      const [pRes, cRes] = await Promise.all([
        api.get(`/plants/${id}`),
        api.get(`/plants/${id}/community`) // returns only approved
      ]);
      setPlant(pRes.data);
      setCommunity(cRes.data?.images || []);
    } catch (err) {
      console.error('Error fetching plant/community:', err);
      toast.error('Failed to load plant');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const [related, setRelated] = useState({ blog: [], care: [] });

    useEffect(() => {
      const loadRelated = async () => {
        try {
          if (!plant?.slug) return;
          const r = await api.get(`/content/related?plantSlug=${plant.slug}`);
          setRelated(r.data || { blog: [], care: [] });
        } catch (e) {
          console.error(e);
        }
      };
      loadRelated();
    }, [plant?.slug]);

    
  const handleAdd = async () => {
    if (!isAuthed) {
      navigate('/login');
      return;
    }
    try {
      setAdding(true);
      await api.post('/userplants', { plantId: plant._id });
      toast.success('Plant added to your collection!');
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Could not add plant.');
    } finally {
      setAdding(false);
    }
  };

  const submitCommunity = async (e) => {
    e.preventDefault();
    if (!isAuthed) return toast.error('Please log in to submit a photo.');
    if (!files?.length) return toast.error('Choose at least one image.');

    try {
      setUploading(true);
      const fd = new FormData();
      for (const f of files) fd.append('images', f); // field name must be "images"
      await api.post(`/plants/${id}/community`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Submitted for moderation!');
      setFiles([]);
      // Note: Approved list won’t change until admin approves; no need to reload now.
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="text-center mt-20 text-green-800">Loading...</div>;
  if (!plant) return <div className="text-center mt-20">Plant not found.</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-green-900 mb-4">{plant.name}</h1>

      {plant.primaryImage?.url && (
        <img
          src={plant.primaryImage.url}
          alt={plant.name}
          className="w-full h-auto mb-6 rounded-lg shadow-md"
        />
      )}

      <p className="text-lg text-gray-700 mb-4 italic">{plant.scientificName}</p>
      <ul className="list-disc pl-5 text-gray-800 mb-6">
        <li><strong>Tier:</strong> {plant.tier}</li>
        <li><strong>Water every:</strong> {plant.wateringFrequencyDays} days</li>
        <li><strong>Fertilize every:</strong> {plant.fertilizingFrequencyDays} days</li>
        <li><strong>Light:</strong> {plant.light}</li>
        <li><strong>Soil:</strong> {plant.soil}</li>
        <li><strong>Pet Friendly:</strong> {plant.petFriendly ? 'Yes' : 'No'}</li>
      </ul>

      {/* Add to My Plants */}
      <button
        onClick={handleAdd}
        disabled={adding}
        className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 transition"
      >
        {adding ? 'Adding...' : 'Add to My Plants'}
      </button>

      {/* Community upload (only visible if logged in) */}
      {isAuthed && (
        <div className="mt-10 bg-white rounded-xl shadow p-4">
          <h3 className="text-xl font-semibold text-green-900 mb-3">Share your photo</h3>
          <form onSubmit={submitCommunity} className="space-y-3">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
              className="block w-full"
            />
            <button
              type="submit"
              disabled={uploading}
              className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 transition disabled:opacity-50"
            >
              {uploading ? 'Uploading…' : 'Submit to Community'}
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-2">
            Photos are reviewed before they appear publicly.
          </p>
        </div>
      )}

      {/* Related content */}
      {(related.care?.length || related.blog?.length) ? (
        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-green-800 mb-4">Learn More</h2>

          {related.care?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Care Guides</h3>
              <ul className="list-disc ml-6">
                {related.care.map((c) => (
                  <li key={c.slug}>
                    <a className="text-green-700 hover:underline" href={`/care/${c.slug}`}>{c.title}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {related.blog?.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-2">Blog Posts</h3>
              <ul className="list-disc ml-6">
                {related.blog.map((b) => (
                  <li key={b.slug}>
                    <a className="text-green-700 hover:underline" href={`/blog/${b.slug}`}>{b.title}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : null}


      {/* Approved community images */}
      {community.length > 0 && (
        <div className="mt-10">
          <h2 className="text-2xl font-semibold text-green-800 mb-4">Community Images</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {community.map((img) => (
              <div key={img._id} className="rounded overflow-hidden shadow">
                <img
                  src={img.url}
                  alt="Community submission"
                  className="w-full h-60 object-cover"
                />
                {img.submittedByName && (
                  <p className="text-sm text-gray-600 px-2 py-1 bg-gray-100 text-right italic">
                    Submitted by: {img.submittedByName}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlantDetail;
