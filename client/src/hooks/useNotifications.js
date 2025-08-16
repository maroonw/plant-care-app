import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getNotifications } from '../api';
import useAuth from './useAuth';

export default function useNotifications({ pollMs = 60_000 } = {}) {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const timer = useRef(null);

  const refresh = useCallback(async () => {
    if (!token) { setItems([]); return; }
    const res = await getNotifications();
    setItems(Array.isArray(res.data?.items) ? res.data.items : []);
  }, [token]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try { await refresh(); } catch {}
    })();
    if (pollMs && token) {
      timer.current = setInterval(() => { if (!cancelled) refresh(); }, pollMs);
    }
    return () => { cancelled = true; if (timer.current) clearInterval(timer.current); };
  }, [refresh, pollMs, token]);

  const count = items.length;
  return { items, count, refresh, setItems };
}
