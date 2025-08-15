import { useEffect, useMemo, useState, useCallback } from 'react';
import { getWishlist, addToWishlist, removeFromWishlist } from '../api';
import useAuth from './useAuth';

export default function useWishlist() {
  const { token } = useAuth();
  const [items, setItems] = useState([]); // array of Plant docs

  const refresh = useCallback(async () => {
    if (!token) { setItems([]); return; }
    const res = await getWishlist();
    const data = Array.isArray(res.data) ? res.data : [];
    setItems(data);
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

  // Accept either a plant object or an id
  const add = useCallback(async (plantOrId) => {
    if (!token) return { ok: false, reason: 'auth' };
    const plant = typeof plantOrId === 'object' ? plantOrId : null;
    const plantId = plant ? plant._id : plantOrId;

    // optimistic add
    if (plant && !idSet.has(plantId)) {
      setItems(prev => [{ ...plant }, ...prev]);
    }

    try {
      const res = await addToWishlist(plantId);
      // server returns authoritative list
      const data = Array.isArray(res.data) ? res.data : [];
      setItems(data);
      return { ok: true };
    } catch (err) {
      // rollback if optimistic add failed
      if (plant) setItems(prev => prev.filter(p => p._id !== plantId));
      throw err;
    }
  }, [token, idSet]);

  const remove = useCallback(async (plantId) => {
    if (!token) return { ok: false, reason: 'auth' };
    // optimistic remove
    const prev = items;
    setItems(prev.filter(p => p._id !== plantId));
    try {
      const res = await removeFromWishlist(plantId);
      const data = Array.isArray(res.data) ? res.data : [];
      setItems(data);
      return { ok: true };
    } catch (err) {
      // rollback on failure
      setItems(prev);
      throw err;
    }
  }, [token, items]);

  return { items, isWishlisted, add, remove, tokenPresent: !!token, refresh, count: items.length };
}
