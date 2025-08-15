import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
});

// Attach token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ehp_token'); // easyhouseplant token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

// --- Wishlist (Wanted) ---
export const getWishlist = () => api.get('/wanted');
export const addToWishlist = (plantId) => api.post(`/wanted/${plantId}`);
export const removeFromWishlist = (plantId) => api.delete(`/wanted/${plantId}`);

// --- My Plants (UserPlant) ---
export const getMyPlants = () => api.get('/userplants');
export const addMyPlant = (payload) => api.post('/userplants', payload); // { plantId, nickname?, notes? }
export const updateMyPlant = (id, data) => api.patch(`/userplants/${id}`, data);
export const removeMyPlant = (id) => api.delete(`/userplants/${id}`);

// Images for a user's plant
export const uploadMyPlantImages = (id, files) => {
  const form = new FormData();
  [...files].forEach(f => form.append('images', f));
  return api.post(`/userplants/${id}/upload`, form);
};
export const setMyPlantPrimaryImage = (plantId, imageId) =>
  api.patch(`/userplants/${plantId}/images/${imageId}/set-primary`);
export const deleteMyPlantImage = (plantId, imageId) =>
  api.delete(`/userplants/${plantId}/images/${imageId}`);

