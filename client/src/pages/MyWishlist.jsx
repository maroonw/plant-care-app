import { useMemo } from 'react';
import useWishlist from '../hooks/useWishlist';
import PlantCard from '../components/PlantCard';

export default function MyWishlist() {
  const { items } = useWishlist();

  // items can be Plant docs OR { plant: Plant }
  const plants = useMemo(
    () => items.map(i => i?.plant ?? i).filter(Boolean),
    [items]
  );

  return (
    <section className="py-10 px-4">
      <h1 className="text-3xl font-bold text-green-900 text-center mb-6">My Wishlist</h1>
      <div className="max-w-6xl mx-auto">
        {plants.length === 0 ? (
          <div className="text-center text-gray-600 py-10">
            No favorites yet. Tap the ♡ on any plant to add it.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {plants.map((p) => <PlantCard key={p._id} plant={p} />)}
          </div>
        )}
      </div>
    </section>
  );
}
