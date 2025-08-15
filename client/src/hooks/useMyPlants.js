import { useCallback, useEffect, useMemo, useState } from 'react';
import useAuth from './useAuth';
import {
  getMyPlants, addMyPlant, updateMyPlant, removeMyPlant,
  uploadMyPlantImages, setMyPlantPrimaryImage, deleteMyPlantImage
} from '../api';

export default function useMyPlants() {
  const { token } = useAuth();
  const [items, setItems] = useState([]); // array of UserPlant docs (with .plant populated)

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

  // Build a set of plantIds the user already owns for quick checks
  const ownedPlantIds = useMemo(
    () => new Set(items.map(up => up?.plant?._id).filter(Boolean)),
    [items]
  );
  const isInMyPlants = useCallback((plantId) => ownedPlantIds.has(plantId), [ownedPlantIds]);

  // Add (optimistic)
  const add = useCallback(async (plant, { nickname, notes } = {}) => {
    if (!token) return { ok: false, reason: 'auth' };
    // optimistic: insert a skeletal UserPlant so UI reacts immediately
    const optimistic = {
      _id: `optimistic-${plant._id}`,
      plant,
      nickname: nickname || '',
      notes: notes || '',
      images: [],
      primaryImage: null,
    };
    setItems(prev => [optimistic, ...prev]);
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

  // Update nickname/notes
  const update = useCallback(async (userPlantId, patch) => {
    const prev = items;
    // optimistic: patch local
    setItems(prev.map(x => x._id === userPlantId ? { ...x, ...patch } : x));
    try {
      const res = await updateMyPlant(userPlantId, patch);
      // trust server response if it returns the updated doc or list
      if (Array.isArray(res.data)) setItems(res.data);
      else if (res.data?._id) setItems(prev => prev.map(x => x._id === res.data._id ? res.data : x));
      else await refresh();
      return { ok: true };
    } catch (e) {
      setItems(prev); // rollback
      throw e;
    }
  }, [items, refresh]);

  // Remove
  const remove = useCallback(async (userPlantId) => {
    const prev = items;
    setItems(prev.filter(x => x._id !== userPlantId));
    try {
      const res = await removeMyPlant(userPlantId);
      if (Array.isArray(res.data)) setItems(res.data);
      else await refresh();
      return { ok: true };
    } catch (e) {
      setItems(prev);
      throw e;
    }
  }, [items, refresh]);

  // Images
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
    uploadImages, setPrimaryImage, deleteImage
  };
}
