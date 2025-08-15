import { useEffect, useMemo, useState, useCallback } from 'react';
import { getWishlist, addToWishlist, removeFromWishlist } from '../api';
import useAuth from './useAuth';

export default function useWishlist() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);

  const refresh = useCallback(async () => {
    if (!token) { setItems([]); return; }
    const res = await getWishlist();
    setItems(Array.isArray(res.data) ? res.data : []);
  }, [token]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!token) { setItems([]); return; }
        const res = await getWishlist();
        if (!cancelled) setItems(Array.isArray(res.data) ? res.data : []);
      } catch {
        if (!cancelled) setItems([]);
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  const idSet = useMemo(() => new Set(items.map(p => p?._id).filter(Boolean)), [items]);
  const isWishlisted = useCallback((plantId) => idSet.has(plantId), [idSet]);

  const add = useCallback((plantOrId) => {
    if (!token) return { ok: false, reason: 'auth' };
    const plant = typeof plantOrId === 'object' ? plantOrId : null;
    const plantId = plant ? plant._id : plantOrId;

    // optimistic insert
    if (!idSet.has(plantId)) {
      setItems(prev => [{ ...(plant || { _id: plantId }) }, ...prev]);
    }

    addToWishlist(plantId)
      .then(res => Array.isArray(res.data) && setItems(res.data))
      .catch(() => setItems(prev => prev.filter(p => p._id !== plantId)));

    return { ok: true };
  }, [token, idSet]);

  const remove = useCallback((plantId) => {
    if (!token) return { ok: false, reason: 'auth' };
    // optimistic remove
    setItems(prev => prev.filter(p => p._id !== plantId));
    removeFromWishlist(plantId)
      .then(res => Array.isArray(res.data) && setItems(res.data))
      .catch(() => refresh());
    return { ok: true };
  }, [token, refresh]);

  return { items, isWishlisted, add, remove, count: items.length, refresh, tokenPresent: !!token };
}
