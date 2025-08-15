import { useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import useMyPlants from '../hooks/useMyPlants';
import EditMyPlantModal from '../components/EditMyPlantModal';
import { logCare, getCareLogs } from '../api';

function parseDate(d) {
  if (!d) return null;
  const t = new Date(d);
  return Number.isNaN(t.getTime()) ? null : t;
}
function daysUntil(date) {
  if (!date) return Infinity;
  const now = Date.now();
  const diff = parseDate(date)?.getTime() - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
function fmtDays(n) {
  if (!Number.isFinite(n)) return '—';
  if (n <= 0) return 'Due now';
  if (n === 1) return 'in 1 day';
  return `in ${n} days`;
}
function chipColor(type) {
  return type === 'water'
    ? 'bg-blue-50 text-blue-700 border-blue-200'
    : 'bg-amber-50 text-amber-700 border-amber-200';
}

// Build upcoming task objects from a UserPlant
// You can extend this with { type: 'repot', next: up.nextRepotDue } later.
function nextTasks(up) {
  const tasks = [];
  // WATER
  const nextWater = up.nextWateringDue || up.careSchedule?.nextWateringDue;
  if (nextWater) {
    tasks.push({ type: 'water', next: parseDate(nextWater), days: daysUntil(nextWater) });
  }
  // FERTILIZE
  const nextFert = up.nextFertilizingDue || up.careSchedule?.nextFertilizingDue;
  if (nextFert) {
    tasks.push({ type: 'fertilize', next: parseDate(nextFert), days: daysUntil(nextFert) });
  }
  // Sort tasks by earliest date first
  tasks.sort((a, b) => {
    if (!a.next && !b.next) return 0;
    if (!a.next) return 1;
    if (!b.next) return -1;
    return a.next - b.next;
  });
  return tasks;
}

export default function MyPlants() {
  const {
    items, update, remove,
    uploadImages, setPrimaryImage, deleteImage,
    applyServerUserPlant,
  } = useMyPlants();

  // UI state
  const [editing, setEditing] = useState(null);
  const [sortMode, setSortMode] = useState('next'); // 'next' | 'next-water' | 'next-fertilize' | 'name'
  const [taskFilter, setTaskFilter] = useState('all'); // 'all' | 'water' | 'fertilize'
  const [dueOnly, setDueOnly] = useState(false);
  const [dueDays, setDueDays] = useState(7);
  const [history, setHistory] = useState({}); // { [userPlantId]: { loading, logs, open } }

  const baseList = useMemo(() => items || [], [items]);

  // Decorate each UserPlant with computed tasks and helpers
  const decorated = useMemo(() => {
    return baseList.map((up) => {
      const tasks = nextTasks(up);
      const any = tasks[0] || null;
      const water = tasks.find(t => t.type === 'water') || null;
      const fert  = tasks.find(t => t.type === 'fertilize') || null;
      return { up, tasks, any, water, fert };
    });
  }, [baseList]);

  // Filter by task type and due window
  const filtered = useMemo(() => {
    const windowDays = Number(dueDays) || 7;
    return decorated.filter(({ any, water, fert }) => {
      // choose reference task based on taskFilter
      const ref =
        taskFilter === 'water' ? water :
        taskFilter === 'fertilize' ? fert : any;

      if (!ref) return false; // if no matching task, hide when filtering by type

      if (!dueOnly) return true;
      return ref.days <= windowDays;
    });
  }, [decorated, taskFilter, dueOnly, dueDays]);

  // Sort by chosen mode
  const list = useMemo(() => {
    const arr = [...filtered];
    switch (sortMode) {
      case 'name':
        arr.sort((a, b) => (a.up.plant?.name || '').localeCompare(b.up.plant?.name || ''));
        break;
      case 'next-water':
        arr.sort((a, b) => {
          const ad = a.water?.days ?? Infinity;
          const bd = b.water?.days ?? Infinity;
          if (ad === bd) return (a.up.plant?.name || '').localeCompare(b.up.plant?.name || '');
          return ad - bd;
        });
        break;
      case 'next-fertilize':
        arr.sort((a, b) => {
          const ad = a.fert?.days ?? Infinity;
          const bd = b.fert?.days ?? Infinity;
          if (ad === bd) return (a.up.plant?.name || '').localeCompare(b.up.plant?.name || '');
          return ad - bd;
        });
        break;
      case 'next':
      default:
        arr.sort((a, b) => {
          const ad = a.any?.days ?? Infinity;
          const bd = b.any?.days ?? Infinity;
          if (ad === bd) return (a.up.plant?.name || '').localeCompare(b.up.plant?.name || '');
          return ad - bd;
        });
        break;
    }
    return arr;
  }, [filtered, sortMode]);

  // fetch history on demand
  const loadHistory = async (userPlantId) => {
    setHistory(h => ({ ...h, [userPlantId]: { ...(h[userPlantId] || {}), loading: true, open: true } }));
    try {
      const res = await getCareLogs(userPlantId);
      const logs = Array.isArray(res.data) ? res.data : (res.data?.logs || []);
      setHistory(h => ({ ...h, [userPlantId]: { loading: false, logs, open: true } }));
    } catch {
      setHistory(h => ({ ...h, [userPlantId]: { loading: false, logs: [], open: true } }));
      toast.error('Could not load history');
    }
  };

  return (
    <section className="py-10 px-4">
      <div className="max-w-6xl mx-auto flex items-end justify-between flex-wrap gap-3">
        <h1 className="text-3xl font-bold text-green-900">My Plants</h1>

        <div className="flex items-center gap-3 text-sm">
          <label className="flex items-center gap-2">
            <span>Task</span>
            <select
              className="border rounded px-2 py-1"
              value={taskFilter}
              onChange={(e) => setTaskFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="water">Water</option>
              <option value="fertilize">Fertilize</option>
            </select>
          </label>

          <label className="flex items-center gap-2">
            <span>Sort</span>
            <select
              className="border rounded px-2 py-1"
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value)}
            >
              <option value="next">Next due (any)</option>
              <option value="next-water">Next water</option>
              <option value="next-fertilize">Next fertilize</option>
              <option value="name">Name</option>
            </select>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="accent-green-600"
              checked={dueOnly}
              onChange={(e) => setDueOnly(e.target.checked)}
            />
            <span>Due only</span>
          </label>

          <label className="flex items-center gap-2">
            <span>Days</span>
            <input
              type="number"
              min="1"
              className="w-16 border rounded px-2 py-1"
              value={dueDays}
              onChange={(e) => setDueDays(e.target.value)}
              disabled={!dueOnly}
            />
          </label>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-6">
        {list.length === 0 ? (
          <div className="text-center text-gray-600 py-10">
            {baseList.length === 0
              ? 'No plants yet. Tap “🌱 Add to My Plants” on any plant to get started.'
              : 'No plants match your filters.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {list.map(({ up, tasks }) => {
              const p = up.plant || {};
              const primary =
                up.primaryImage?.url ||
                p.primaryImage?.url ||
                p.images?.[0]?.url ||
                '/images/placeholder.jpg';

              const hp = history[up._id];

              // Two chips max: next two upcoming tasks
              const chips = tasks.slice(0, 2);

              return (
                <div key={up._id} className="bg-white rounded-xl shadow overflow-hidden">
                  <img src={primary} alt={p.name} className="w-full h-48 object-cover" />
                  <div className="p-4">
                    <div className="font-semibold text-green-900">{p.name}</div>

                    {/* Upcoming task chips */}
                    <div className="mt-1 flex flex-wrap gap-2">
                      {chips.length ? chips.map(t => (
                        <span
                          key={t.type}
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${chipColor(t.type)}`}
                          title={t.next ? t.next.toLocaleString() : 'No date'}
                        >
                          {t.type === 'water' ? '💧 Water' : '🌿 Fertilize'} {fmtDays(t.days)}
                        </span>
                      )) : (
                        <span className="inline-block rounded-full bg-gray-50 text-gray-600 border border-gray-200 px-2 py-0.5 text-xs">
                          No schedule available
                        </span>
                      )}
                    </div>

                    {/* Nickname / notes */}
                    {up.nickname ? (
                      <div className="text-sm text-gray-700 mt-2">Nickname: {up.nickname}</div>
                    ) : (
                      <div className="text-sm text-gray-400 mt-2 italic">No nickname</div>
                    )}
                    {up.notes ? (
                      <div className="text-sm text-gray-600 mt-1 line-clamp-3">{up.notes}</div>
                    ) : (
                      <div className="text-sm text-gray-400 mt-1 italic">No notes</div>
                    )}

                    {/* Care quick actions */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        className="px-3 py-1 text-sm rounded border hover:bg-gray-50"
                        onClick={async () => {
                          try {
                            const res = await logCare({ userPlantId: up._id, type: 'water', date: new Date().toISOString() });
                            if (res?.data?.userPlant) applyServerUserPlant(res.data.userPlant);
                            toast.success('Logged watering');
                          } catch {
                            toast.error('Could not log watering');
                          }
                        }}
                      >
                        Log Watered 💧
                      </button>

                      <button
                        className="px-3 py-1 text-sm rounded border hover:bg-gray-50"
                        onClick={async () => {
                          try {
                            const res = await logCare({ userPlantId: up._id, type: 'fertilize', date: new Date().toISOString() });
                            if (res?.data?.userPlant) applyServerUserPlant(res.data.userPlant);
                            toast.success('Logged fertilizing');
                          } catch {
                            toast.error('Could not log fertilizing');
                          }
                        }}
                      >
                        Log Fertilized 🌿
                      </button>

                      <button
                        className="px-3 py-1 text-sm rounded border hover:bg-gray-50"
                        onClick={async () => {
                          if (!hp?.logs && !hp?.loading) await loadHistory(up._id);
                          else setHistory(h => ({ ...h, [up._id]: { ...(h[up._id] || {}), open: !(h[up._id]?.open) } }));
                          setHistory(h => ({ ...h, [up._id]: { ...(h[up._id] || {}), open: true } }));
                        }}
                      >
                        {hp?.open ? 'Hide History' : 'Show History'}
                      </button>
                    </div>

                    {/* Edit / remove / images */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        className="px-3 py-1 text-sm rounded border hover:bg-gray-50"
                        onClick={() => setEditing(up)}
                      >
                        Edit
                      </button>

                      <button
                        className="px-3 py-1 text-sm rounded border border-red-300 text-red-700 hover:bg-red-50"
                        onClick={async () => {
                          if (!window.confirm('Remove this plant from My Plants?')) return;
                          try { await remove(up._id); toast('Removed'); }
                          catch { toast.error('Could not remove'); }
                        }}
                      >
                        Remove
                      </button>

                      <label className="px-3 py-1 text-sm rounded border hover:bg-gray-50 cursor-pointer">
                        Upload Images
                        <input
                          type="file"
                          className="hidden"
                          multiple
                          accept="image/*"
                          onChange={async (e) => {
                            const files = e.target.files;
                            if (!files?.length) return;
                            try { await uploadImages(up._id, files); toast.success('Uploaded'); }
                            catch { toast.error('Upload failed'); }
                            finally { e.target.value = ''; }
                          }}
                        />
                      </label>
                    </div>

                    {/* Thumbnails */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(up.images || []).map((img) => (
                        <div key={img._id} className="relative">
                          <img
                            src={img.url}
                            alt=""
                            className={`w-16 h-16 object-cover rounded ${
                              up.primaryImage?.url === img.url ? 'ring-2 ring-green-500' : ''
                            }`}
                          />
                          <div className="flex gap-1 mt-1">
                            <button
                              className="text-xs px-2 py-0.5 rounded border hover:bg-gray-50"
                              onClick={async () => {
                                try { await setPrimaryImage(up._id, img._id); toast('Primary set'); }
                                catch { toast.error('Failed'); }
                              }}
                            >
                              Primary
                            </button>
                            <button
                              className="text-xs px-2 py-0.5 rounded border border-red-300 text-red-700 hover:bg-red-50"
                              onClick={async () => {
                                try { await deleteImage(up._id, img._id); toast('Deleted'); }
                                catch { toast.error('Delete failed'); }
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* History panel */}
                    {hp?.open && (
                      <div className="mt-3 border-t pt-2">
                        {hp.loading ? (
                          <div className="text-xs text-gray-500">Loading history…</div>
                        ) : (hp.logs?.length ? (
                          <ul className="text-xs text-gray-700 space-y-1 max-h-32 overflow-auto pr-1">
                            {hp.logs.slice(0, 10).map(log => (
                              <li key={log._id}>
                                <span className="inline-block w-20 capitalize">{log.type}:</span>
                                <span>{new Date(log.timestamp).toLocaleString()}</span>
                                {log.note ? <span className="text-gray-500"> — {log.note}</span> : null}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="text-xs text-gray-500">No history yet.</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {editing && (
        <EditMyPlantModal
          userPlant={editing}
          onClose={() => setEditing(null)}
          onSave={async (patch) => {
            try {
              await update(editing._id, patch);
              toast.success('Saved');
              setEditing(null);
            } catch {
              toast.error('Save failed');
            }
          }}
        />
      )}
    </section>
  );
}
