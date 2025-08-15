import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useWishlist from '../hooks/useWishlist';

export default function Wishlist() {
  const { items, remove } = useWishlist();

  return (
    <section className="py-10 px-4">
      <h1 className="text-3xl font-bold text-green-900 text-center mb-6">My Wishlist</h1>

      <div className="max-w-6xl mx-auto">
        {(!items || items.length === 0) ? (
          <div className="text-center text-gray-600 py-10">
            Nothing here yet. Tap “♡ Wishlist” on any plant to add it.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {items.map((p) => {
              const img = p.primaryImage?.url || p.images?.[0]?.url || '/images/placeholder.jpg';
              return (
                <div key={p._id} className="bg-white rounded-xl shadow overflow-hidden">
                  <Link to={`/plants/${p.slug || p._id}`} className="block">
                    <img src={img} alt={p.name} className="w-full h-48 object-cover" />
                    <div className="p-4">
                      <div className="font-semibold text-green-900">{p.name}</div>
                      {p.tier && <div className="text-xs text-gray-600 mt-1 capitalize">Tier: {p.tier}</div>}
                    </div>
                  </Link>

                  <div className="px-4 pb-4 flex gap-2">
                    <Link
                      to={`/plants/${p.slug || p._id}`}
                      className="px-3 py-1 text-sm rounded bg-green-600 text-white hover:bg-green-700"
                    >
                      View
                    </Link>
                    <button
                      className="px-3 py-1 text-sm rounded border hover:bg-gray-50"
                      onClick={async () => {
                        // optimistic via hook
                        try { remove(p._id); toast('Removed'); }
                        catch { toast.error('Could not remove'); }
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
