import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useWishlist from '../hooks/useWishlist';
import useMyPlants from '../hooks/useMyPlants';
import AddToMyPlantsModal from './AddToMyPlantsModal';

export default function PlantCard({ plant }) {
  const { isWishlisted, add: addWish, remove: removeWish } = useWishlist();
  const { add: addMyPlant } = useMyPlants();

  const [addingOpen, setAddingOpen] = useState(false);

  const wished = isWishlisted(plant._id);

  const handleToggleWish = async (e) => {
    // prevent card navigation if the card is wrapped in a Link
    e.preventDefault();
    e.stopPropagation();
    try {
      if (wished) {
        removeWish(plant._id);
      } else {
        // optimistic add: send full plant so UI can show it immediately
        addWish(plant);
      }
    } catch {
      toast.error('Could not update wishlist');
    }
  };

  const openAddModal = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAddingOpen(true);
  };

  const primaryImg =
    plant.primaryImage?.url ||
    plant.images?.[0]?.url ||
    '/images/placeholder.jpg';

  return (
    <div className="bg-white rounded-xl shadow hover:shadow-md transition overflow-hidden">
      <Link to={`/plants/${plant.slug}`} className="block">
        <img
          src={primaryImg}
          alt={plant.name}
          className="w-full h-44 object-cover"
        />
        <div className="p-4">
          <div className="font-semibold text-green-900">{plant.name}</div>
          {plant.tier && (
            <div className="text-xs text-gray-600 mt-1 capitalize">
              Tier: {plant.tier}
            </div>
          )}

          <div className="mt-3 flex items-center gap-2">
            <button
              className="px-3 py-1 text-sm rounded bg-green-600 text-white hover:bg-green-700"
              onClick={openAddModal}
            >
              🌱 Add to My Plants
            </button>

            <button
              className={`px-3 py-1 text-sm rounded border ${
                wished
                  ? 'bg-pink-600 text-white border-pink-600'
                  : 'hover:bg-gray-50'
              }`}
              onClick={handleToggleWish}
              aria-pressed={wished}
              aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              {wished ? '♥ Wishlisted' : '♡ Wishlist'}
            </button>
          </div>
        </div>
      </Link>

      {addingOpen && (
        <AddToMyPlantsModal
          plant={plant}
          onClose={() => setAddingOpen(false)}
          onAdd={async ({ nickname, notes }) => {
            try {
              // useMyPlants.add is already optimistic
              await addMyPlant(plant, { nickname, notes });
              toast.success('Added to My Plants');
            } catch {
              toast.error('Could not add plant');
            }
          }}
        />
      )}
    </div>
  );
}
