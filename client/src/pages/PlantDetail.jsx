import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api'; // ✅ use the shared instance

const PlantDetail = () => {
  const { id } = useParams();
  const [plant, setPlant] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const fetchPlant = async () => {
      try {
        setError('');
        const res = await api.get(`/plants/${id}`);
        if (!cancelled) setPlant(res.data);
      } catch (err) {
        console.error('Error fetching plant:', err);
        if (!cancelled) setError('Could not load plant.');
      }
    };
    fetchPlant();
    return () => { cancelled = true; };
  }, [id]);

  if (error) return <div className="text-center mt-20 text-red-600">{error}</div>;
  if (!plant) return <div className="text-center mt-20 text-green-800">Loading...</div>;

  const light = plant.light || plant.lightRequirement || '—';
  const soil  = plant.soil || plant.soilType || '—';
  const watering =
    plant.wateringSchedule ||
    (typeof plant.wateringFrequencyDays === 'number' ? `${plant.wateringFrequencyDays} days` : '—');
  const fertilizing =
    typeof plant.fertilizingFrequencyDays === 'number' ? `${plant.fertilizingFrequencyDays} days` : '—';
  const petFriendly = (plant.petFriendly ?? plant.animalFriendly) ? 'Yes' : 'No';

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

      {plant.scientificName && (
        <p className="text-lg text-gray-700 mb-4 italic">{plant.scientificName}</p>
      )}

      <ul className="list-disc pl-5 text-gray-800 space-y-1">
        <li><strong>Tier:</strong> {plant.tier || '—'}</li>
        <li><strong>Water:</strong> {watering}</li>
        <li><strong>Fertilize:</strong> {fertilizing}</li>
        <li><strong>Light:</strong> {light}</li>
        <li><strong>Soil:</strong> {soil}</li>
        <li><strong>Pet Friendly:</strong> {petFriendly}</li>
      </ul>

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
