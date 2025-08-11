import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import useAuth from '../hooks/useAuth';

const PlantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthed } = useAuth();

  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchPlant = async () => {
      try {
        const res = await api.get(`/plants/${id}`);
        setPlant(res.data);
      } catch (err) {
        console.error('Error fetching plant:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlant();
  }, [id]);

  const handleAdd = async () => {
    if (!isAuthed) {
      navigate('/login');
      return;
    }
    try {
      setAdding(true);
      setMessage('');
      await api.post('/userplants', { plantId: plant._id });
      setMessage('Plant added to your collection!');
    } catch (err) {
      console.error(err);
      setMessage('Could not add plant.');
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <div className="text-center mt-20 text-green-800">Loading...</div>;

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

      {/* Add to My Plants button */}
      <button
        onClick={handleAdd}
        disabled={adding}
        className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 transition"
      >
        {adding ? 'Adding...' : 'Add to My Plants'}
      </button>
      {message && <p className="mt-2 text-green-700">{message}</p>}

      {plant.communityImages?.length > 0 && (
        <div className="mt-10">
          <h2 className="text-2xl font-semibold text-green-800 mb-4">Community Images</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {plant.communityImages.map((img, idx) => (
              <div key={idx} className="rounded overflow-hidden shadow">
                <img
                  src={img.url}
                  alt={`Community submission ${idx + 1}`}
                  className="w-full h-60 object-cover"
                />
                {img.submittedBy && (
                  <p className="text-sm text-gray-600 px-2 py-1 bg-gray-100 text-right italic">
                    Submitted by: {img.submittedBy}
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
