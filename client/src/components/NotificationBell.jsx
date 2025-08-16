import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useNotifications from '../hooks/useNotifications';
import { logCare } from '../api';

function fmt(type) {
  if (type === 'water') return 'Water';
  if (type === 'fertilize') return 'Fertilize';
  if (type === 'repot') return 'Repot';
  return 'Rotate';
}
function pill(n) {
  if (!Number.isFinite(n)) return '—';
  if (n < 0) return `${Math.abs(n)}d overdue`;
  return 'Due today';
}

export default function NotificationsBell() {
  const { items, count, setItems, refresh } = useNotifications({ pollMs: 60_000 });
  const [open, setOpen] = useState(false);

  const onLog = async (i) => {
    try {
      await logCare({ userPlantId: i.userPlantId, type: i.type, date: new Date().toISOString() });
      // Optimistic remove item (server nextDue will advance)
      setItems(prev => prev.filter(x => !(x.userPlantId === i.userPlantId && x.type === i.type)));
      toast.success(`${fmt(i.type)} logged`);
    } catch {
      toast.error('Could not log');
    }
  };

  return (
    <div className="relative">
      <button
        className="relative px-3 py-2 rounded hover:bg-gray-100"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-label="Notifications"
      >
        🔔
        <span className="ml-1 inline-flex items-center justify-center min-w-5 h-5 text-[11px] px-1 rounded-full bg-amber-600 text-white">
          {count}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[320px] max-h-[70vh] overflow-auto bg-white border border-gray-200 rounded-xl shadow-lg z-50">
          <div className="p-3 border-b text-sm font-semibold text-green-800">Care reminders</div>
          {!items.length ? (
            <div className="p-4 text-sm text-gray-600">Nothing due. 🌤️</div>
          ) : (
            <ul className="divide-y">
              {items.map((i, idx) => (
                <li key={`${i.userPlantId}-${i.type}-${idx}`} className="p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded overflow-hidden bg-gray-100 shrink-0">
                    {i.img ? <img src={i.img} alt="" className="w-full h-full object-cover" /> : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      <Link to={`/plants/${i.plantSlug}`} onClick={() => setOpen(false)} className="hover:underline">
                        {i.plantName}
                      </Link>
                    </div>
                    <div className="text-xs text-gray-600">{fmt(i.type)} · <span className={i.days < 0 ? 'text-red-600' : 'text-amber-700'}>{pill(i.days)}</span></div>
                  </div>
                  <button
                    className="px-2.5 py-1 text-xs rounded border hover:bg-gray-50"
                    onClick={() => onLog(i)}
                  >
                    Log now
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="p-2 text-right">
            <button className="text-xs px-2 py-1 rounded hover:bg-gray-50" onClick={() => { refresh(); }}>
              Refresh
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
