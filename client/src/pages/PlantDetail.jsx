// client/src/pages/PlantDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import useAuth from '../hooks/useAuth';
import { toast } from 'react-hot-toast';
import useWishlist from '../hooks/useWishlist';
import AddToMyPlantsModal from '../components/AddToMyPlantsModal';
import useMyPlants from '../hooks/useMyPlants';
import { Skeleton } from '../components/Skeletons';

export default function PlantDetail() {
  const { id } = useParams(); // slug or ObjectId
  const { isAuthed } = useAuth();

  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);

  const { isInMyPlants, add: addMyPlant } = useMyPlants();
  const owned = plant?._id ? isInMyPlants(plant._id) : false;
  const [showAddModal, setShowAddModal] = useState(false);

  // Community images (approved only)
  const [community, setCommunity] = useState([]);

  // Upload state
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Wishlist
  const { isWishlisted, add: addWish, remove: removeWish, tokenPresent } = useWishlist();
  const wished = plant?._id ? isWishlisted(plant._id) : false;

  const onToggleWish = async () => {
    if (!plant?._id) return;
    if (!tokenPresent) { toast.error('Please log in to use your wishlist.'); return; }
    try {
      if (wished) {
        removeWish(plant._id); // optimistic
        toast('Removed from wishlist');
      } else {
        addWish(plant); // optimistic
        toast.success('Added to wishlist');
      }
    } catch {
      toast.error('Could not update wishlist.');
    }
  };

  // Load plant + approved community images
  const load = async () => {
    try {
      setLoading(true);
      const [pRes, cRes] = await Promise.all([
        api.get(`/plants/${id}`),
        api.get(`/plants/${id}/community`),
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

  // Related content (blog/care) by slug
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

  const submitCommunity = async (e) => {
    e.preventDefault();
    if (!isAuthed) return toast.error('Please log in to submit a photo.');
    if (!files?.length) return toast.error('Choose at least one image.');

    try {
      setUploading(true);
      const fd = new FormData();
      for (const f of files) fd.append('images', f); // field name must be "images"
      await api.post(`/plants/${id}/community`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Submitted for moderation!');
      setFiles([]);
      // Approved list updates when admin approves; no reload necessary here.
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  // Skeleton while loading
  if (loading) {
    return (
      <section className="py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="w-full h-80 rounded-xl" />
            <div className="space-y-3">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-40 w-full" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!plant) {
    return <div className="text-center mt-20">Plant not found.</div>;
  }

  const primaryImg =
    plant.primaryImage?.url ||
    plant.images?.[0]?.url ||
    '/images/placeholder.jpg';

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-3xl font-bold text-green-900 mb-4">{plant.name}</h1>

        <div className="shrink-0 flex gap-2">
          <button
            onClick={onToggleWish}
            className={`px-3 py-1 text-sm rounded border
              ${wished ? 'bg-pink-100 border-pink-300 text-pink-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
            aria-pressed={wished}
            aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            {wished ? '♥ In wishlist' : '♡ Add to wishlist'}
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className={`px-3 py-1 text-sm rounded border ${owned ? 'bg-green-100 border-green-300 text-green-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
          >
            {owned ? '✓ In My Plants' : '🌱 Add to My Plants'}
          </button>
        </div>
      </div>

      {/* Hero image */}
      {primaryImg && (
        <img
          src={primaryImg}
          alt={plant.name}
          className="w-full h-auto mb-6 rounded-lg shadow-md"
        />
      )}

      {/* Add to My Plants modal (optimistic) */}
      {showAddModal && plant && (
        <AddToMyPlantsModal
          plant={plant}
          onClose={() => setShowAddModal(false)}
          onAdd={async ({ nickname, notes }) => {
            try {
              await addMyPlant(plant, { nickname, notes }); // optimistic via hook
              toast.success('Added to My Plants');
            } catch {
              toast.error('Could not add plant');
            }
          }}
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

      {/* Community upload (only if logged in) */}
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
}
