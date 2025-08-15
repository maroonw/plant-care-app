import { useCallback, useEffect, useMemo, useState } from 'react';
import useAuth from './useAuth';
import {
  getMyPlants, addMyPlant, updateMyPlant, removeMyPlant,
  uploadMyPlantImages, setMyPlantPrimaryImage, deleteMyPlantImage
} from '../api';

export default function useMyPlants() {
  const { token } = useAuth();
  const [items, setItems] = useState([]); // array of UserPlant docs (with .plant populated)

  // Apply a single server-updated UserPlant to local state (instant UI)
  const applyServerUserPlant = useCallback((doc) => {
    if (!doc?._id) return;
    setItems(prev => prev.map(x => (x._id === doc._id ? doc : x)));
  }, []);

  const refresh = useCallback(async () => {
    if (!token) { setItems([]); return; }
    const res = await getMyPlants();
    const data = Array.isArray(res.data) ? res.data : [];
    setItems(data);
  }, [token]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!token) { setItems([]); return; }
        const res = await getMyPlants();
        if (!cancelled) setItems(Array.isArray(res.data) ? res.data : []);
      } catch {
        if (!cancelled) setItems([]);
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  // Quick lookup: which plantIds the user already owns
  const ownedPlantIds = useMemo(
    () => new Set(items.map(up => up?.plant?._id).filter(Boolean)),
    [items]
  );
  const isInMyPlants = useCallback((plantId) => ownedPlantIds.has(plantId), [ownedPlantIds]);

  // ADD (optimistic + reconcile)
  const add = useCallback(async (plant, { nickname, notes } = {}) => {
    if (!token) return { ok: false, reason: 'auth' };

    const optimistic = {
      _id: `optimistic-${plant._id}`,
      plant,
      nickname: nickname || '',
      notes: notes || '',
      images: [],
      primaryImage: null,
    };
    setItems(prev => [optimistic, ...prev]); // instant

    try {
      const res = await addMyPlant({ plantId: plant._id, nickname, notes });
      const data = Array.isArray(res.data) ? res.data : res.data?.items || [];
      setItems(data);
      return { ok: true };
    } catch (err) {
      // rollback
      setItems(prev => prev.filter(x => x._id !== optimistic._id));
      throw err;
    }
  }, [token]);

  // UPDATE nickname/notes (optimistic + rollback on failure)
  const update = useCallback(async (userPlantId, patch) => {
    const prev = items;
    setItems(prev.map(x => x._id === userPlantId ? { ...x, ...patch } : x));
    try {
      const res = await updateMyPlant(userPlantId, patch);
      if (Array.isArray(res.data)) {
        setItems(res.data);
      } else if (res.data && res.data._id) {
        setItems(curr => curr.map(x => x._id === res.data._id ? res.data : x));
      } else {
        await refresh();
      }
      return { ok: true };
    } catch (e) {
      setItems(prev); // rollback
      throw e;
    }
  }, [items, refresh]);

  // REMOVE (optimistic + reconcile)
  const remove = useCallback(async (userPlantId) => {
    setItems(prev => prev.filter(x => x._id !== userPlantId)); // instant
    try {
      const res = await removeMyPlant(userPlantId);
      if (Array.isArray(res.data)) setItems(res.data);
      else await refresh();
      return { ok: true };
    } catch {
      await refresh(); // fallback restore from server
      return { ok: false };
    }
  }, [refresh]);

  // IMAGES (mutations followed by refresh)
  const uploadImages = useCallback(async (userPlantId, files) => {
    await uploadMyPlantImages(userPlantId, files);
    await refresh();
  }, [refresh]);

  const setPrimaryImage = useCallback(async (userPlantId, imageId) => {
    await setMyPlantPrimaryImage(userPlantId, imageId);
    await refresh();
  }, [refresh]);

  const deleteImage = useCallback(async (userPlantId, imageId) => {
    await deleteMyPlantImage(userPlantId, imageId);
    await refresh();
  }, [refresh]);

  return {
    items, refresh, isInMyPlants, add, update, remove,
    uploadImages, setPrimaryImage, deleteImage, applyServerUserPlant, count: (items?.length || 0)
  };
};
