import React, { useEffect, useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { toast } from 'react-hot-toast';
import useMyPlants from '../hooks/useMyPlants';

function fmt(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString();
}

export default function MyPlants() {
  const { isAuthed } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  // edit nickname/notes
  const [editId, setEditId] = useState(null);
  const [editNickname, setEditNickname] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // photo manager
  const [openManageId, setOpenManageId] = useState(null);
  const [fileMap, setFileMap] = useState({});         // { [userPlantId]: FileList }
  const [uploadingId, setUploadingId] = useState(null);

  const [dueOnly, setDueOnly] = useState(false);
  const [dueDays, setDueDays] = useState(3);

  const daysUntil = (dateStr) => {
    if (!dateStr) return Infinity;
    const now = new Date();
    const d = new Date(dateStr);
    // difference in days (ceil so today=0..1 shows as due)
    return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const isDueSoon = (up) => {
    const w = daysUntil(up.nextWateringDue);
    const f = daysUntil(up.nextFertilizingDue);
    return (w <= dueDays) || (f <= dueDays);
  };


  const refresh = async () => {
    const res = await api.get('/userplants');
    setItems(res.data || []);
  };

  useEffect(() => {
    if (!isAuthed) {
      navigate('/login');
      return;
    }
    (async () => {
      try {
        setLoading(true);
        await refresh();
      } catch (e) {
        console.error(e);
        setMsg('Could not load your plants.');
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthed, navigate]);

  const logCare = async (userPlantId, type) => {
    try {
      await api.patch(`/userplants/${userPlantId}/care`, { type });
      await refresh();
      toast.success(type === 'water' ? 'Watered!' : 'Fertilized!');
    } catch (e) {
      console.error(e);
      toast.error('Failed to log care.');
    }
  };

  // ----- Edit helpers -----
  const startEdit = (item) => {
    setEditId(item._id);
    setEditNickname(item.nickname || '');
    setEditNotes(item.notes || '');
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditNickname('');
    setEditNotes('');
  };

  const saveEdit = async () => {
    try {
      await api.patch(`/userplants/${editId}`, {
        nickname: editNickname,
        notes: editNotes,
      });
      await refresh();
      cancelEdit();
      toast.success('Plant updated!');
    } catch (e) {
      console.error(e);
      toast.error('Update failed.');
    }
  };

  // ----- Photo manager helpers -----
  const onFileChange = (userPlantId, files) => {
    setFileMap((prev) => ({ ...prev, [userPlantId]: files }));
  };

  const uploadPhotos = async (userPlantId) => {
    const files = fileMap[userPlantId];
    if (!files || files.length === 0) {
      toast('Choose images first.');
      return;
    }
    const form = new FormData();
    Array.from(files).forEach((f) => form.append('images', f));
    try {
      setUploadingId(userPlantId);
      await api.post(`/userplants/${userPlantId}/upload`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await refresh();
      setFileMap((prev) => ({ ...prev, [userPlantId]: null }));
      toast.success('Images uploaded!');
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.message || 'Upload failed.');
    } finally {
      setUploadingId(null);
    }
  };

  const setPrimary = async (userPlantId, imageId) => {
    try {
      await api.patch(`/userplants/${userPlantId}/images/${imageId}/set-primary`);
      await refresh();
      toast.success('Primary image set.');
    } catch (e) {
      console.error(e);
      toast.error('Could not set primary.');
    }
  };

  const deleteImage = async (userPlantId, imageId) => {
    try {
      await api.delete(`/userplants/${userPlantId}/images/${imageId}`);
      await refresh();
      toast.success('Image deleted.');
    } catch (e) {
      console.error(e);
      toast.error('Delete failed.');
    }
  };

  if (loading) return <div className="p-8 text-center text-green-800">Loading your plants…</div>;

  const visibleItems = dueOnly ? items.filter(isDueSoon) : items;

  return (
    <section className="py-10 px-4 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-green-900 mb-6">My Plants</h1>

        <div className="mb-4 flex items-center gap-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={dueOnly}
              onChange={(e) => setDueOnly(e.target.checked)}
              className="h-4 w-4 accent-green-600"
            />
            <span className="text-sm text-gray-700">Show only due soon</span>
          </label>
          <label className="flex items-center gap-2">
            <span className="text-sm text-gray-700">within</span>
            <input
              type="number"
              min={1}
              max={30}
              value={dueDays}
              onChange={(e) => setDueDays(Number(e.target.value || 1))}
              className="w-16 border rounded px-2 py-1 text-sm"
            />
            <span className="text-sm text-gray-700">days</span>
          </label>
        </div>


      {msg && <div className="mb-4 text-green-700">{msg}</div>}

      {items.length === 0 ? (
        <div className="text-gray-600">You haven’t added any plants yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleItems.map((up) => {
            const img =
              up.primaryImage?.url ||
              up.images?.[0]?.url ||
              up.plant?.primaryImage?.url ||
              '/images/placeholder.jpg';

            const managing = openManageId === up._id;


            return (
              <div key={up._id} className="bg-white rounded-xl shadow overflow-hidden">
                <img src={img} alt={up.nickname || up.plant?.name} className="w-full h-48 object-cover" />

                <div className="p-4">
                  {/* Edit/view nickname + notes */}
                  {editId === up._id ? (
                    <div className="mt-1">
                      <input
                        className="border rounded w-full mb-2 px-2 py-2"
                        value={editNickname}
                        onChange={(e) => setEditNickname(e.target.value)}
                        placeholder="Nickname (e.g., Kitchen Aloe)"
                      />
                      <textarea
                        className="border rounded w-full mb-2 px-2 py-2"
                        rows={3}
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        placeholder="Notes (location, issues, reminders...)"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={saveEdit}
                          className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {(up.nickname || up.notes) ? (
                        <div className="mt-1">
                          {up.nickname && (
                            <h3 className="font-semibold text-green-900">{up.nickname}</h3>
                          )}
                          {up.notes && (
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{up.notes}</p>
                          )}
                        </div>
                      ) : (
                        <p className="mt-1 text-sm text-gray-500">No nickname or notes yet.</p>
                      )}
                      <button
                        onClick={() => startEdit(up)}
                        className="mt-2 text-green-700 text-sm hover:underline"
                      >
                        Edit nickname/notes
                      </button>
                    </>
                  )}

                  {/* Always show plant name */}
                  {up.plant?.name && (
                    <p className="text-sm text-gray-600 italic mt-1">{up.plant.name}</p>
                  )}

                  {/* Care info + actions */}
                  <div className="mt-3 text-sm text-gray-800 space-y-1">
                    <div><strong>Last watered:</strong> {fmt(up.lastWatered)}</div>
                    <div><strong>Next watering due:</strong> {fmt(up.nextWateringDue)}</div>
                    <div><strong>Last fertilized:</strong> {fmt(up.lastFertilized)}</div>
                    <div><strong>Next fertilizing due:</strong> {fmt(up.nextFertilizingDue)}</div>
                  </div>

                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => logCare(up._id, 'water')}
                      className="flex-1 bg-green-700 text-white py-2 rounded hover:bg-green-800 transition"
                    >
                      Log Water
                    </button>
                    <button
                      onClick={() => logCare(up._id, 'fertilize')}
                      className="flex-1 bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700 transition"
                    >
                      Log Fertilizer
                    </button>
                  </div>

                  {/* Photo manager toggle */}
                  <div className="mt-4">
                    <button
                      onClick={() => setOpenManageId(managing ? null : up._id)}
                      className="text-sm text-green-700 hover:underline"
                    >
                      {managing ? 'Hide photos' : 'Manage photos'}
                    </button>
                  </div>

                  {/* Photo manager panel */}
                  {managing && (
                    <div className="mt-3 border-t pt-3">
                      {/* Thumbnails */}
                      {up.images?.length > 0 ? (
                        <div className="grid grid-cols-4 gap-2 mb-3">
                          {up.images.map((im) => (
                            <div key={im._id} className="relative group">
                              <img
                                src={im.url}
                                alt="plant"
                                className="w-full h-20 object-cover rounded"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                                <button
                                  onClick={() => setPrimary(up._id, im._id)}
                                  title="Set as primary"
                                  className="text-white text-xs bg-green-600 px-2 py-1 rounded"
                                >
                                  Primary
                                </button>
                                <button
                                  onClick={() => deleteImage(up._id, im._id)}
                                  title="Delete"
                                  className="text-white text-xs bg-red-600 px-2 py-1 rounded"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 mb-2">No photos yet.</p>
                      )}

                      {/* Upload */}
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => onFileChange(up._id, e.target.files)}
                          className="text-sm"
                        />
                        <button
                          onClick={() => uploadPhotos(up._id)}
                          disabled={uploadingId === up._id}
                          className="bg-green-700 text-white px-3 py-2 rounded text-sm hover:bg-green-800 transition"
                        >
                          {uploadingId === up._id ? 'Uploading…' : 'Upload'}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">You can upload up to 5 images per request.</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
