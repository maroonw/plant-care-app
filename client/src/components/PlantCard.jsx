import React from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useWishlist from '../hooks/useWishlist';
import { useState } from 'react';
import AddToMyPlantsModal from './AddToMyPlantsModal';
import useMyPlants from '../hooks/useMyPlants';

const PlantCard = ({ plant }) => {
const { isWishlisted, add, remove, tokenPresent } = useWishlist();
const wished = isWishlisted(plant._id);
const { isInMyPlants } = useMyPlants();
const owned = isInMyPlants(plant._id);
const [showAddModal, setShowAddModal] = useState(false);

const onToggleWish = async (e) => {
  e.preventDefault();
  e.stopPropagation();
  if (!tokenPresent) { toast.error('Please log in to use your wishlist.'); return; }
  try {
    if (wished) { await remove(plant._id); toast('Removed from wishlist'); }
        else {
          const res = await add(plant);
          if (res.already) toast('Already in wishlist');
          else toast.success('Added to wishlist');
        }
  } catch (err) {
    console.error(err);
    toast.error('Could not update wishlist.');
  }
};

  return (
    <Link to={`/plants/${plant._id}`}>
      <div className="relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">

          <button
            onClick={onToggleWish}
            aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
            className={`absolute m-2 right-2 top-2 z-10 rounded-full border px-3 py-1 text-sm
              ${wished ? 'bg-pink-100 border-pink-300 text-pink-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
          >
            {wished ? '♥' : '♡'}
          </button>

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

        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowAddModal(true);
            }}
            className={`px-3 py-1 text-sm rounded border ${owned ? 'bg-green-100 border-green-300 text-green-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
          >
            {owned ? '✓ In My Plants' : '🌱 Add to My Plants'}
          </button>
        </div>

        {showAddModal && (
          <AddToMyPlantsModal
            plant={plant}
            onClose={() => setShowAddModal(false)}
          />
        )}

      </div>
    </Link>
  );
};

export default PlantCard;
