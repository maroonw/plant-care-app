import React from 'react';
import { Link } from 'react-router-dom';

const PlantCard = ({ plant }) => {
  return (
    <Link to={`/plants/${plant._id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
        {plant.primaryImage?.url && (
          <img
            src={plant.primaryImage.url}
            alt={plant.name}
            className="w-full h-64 object-cover"
          />
        )}
        <div className="p-4">
          <h2 className="text-xl font-semibold text-green-800">{plant.name}</h2>
          {plant.scientificName && (
            <p className="italic text-sm text-gray-600">{plant.scientificName}</p>
          )}
          <p className="mt-2 text-gray-700 text-sm capitalize">
            Tier: {plant.tier}, Light: {(plant.light || plant.lightRequirement)}
          </p>
          <p className="mt-1 text-gray-700 text-sm capitalize">
            Soil: {(plant.soil || plant.soilType) || '—'}, Watering: {plant.wateringSchedule || (plant.wateringFrequencyDays ? `${plant.wateringFrequencyDays} days` : '—')}  
          </p>
        </div>
      </div>
    </Link>
  );
};

export default PlantCard;
