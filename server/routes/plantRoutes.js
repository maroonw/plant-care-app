const express = require('express');
const router = express.Router();

const {
  getAllPlants,
  getPlantById,
  createPlant,
  uploadPlantImages,
  deletePlant,
  uploadCommunityImages,
  updatePlant,
  setPrimaryPlantImage,
  deletePlantImage,
  getApprovedCommunityImages,      // ✅ new
  listPendingCommunityImages,      // ✅ new (admin)
  approveCommunityImage,           // ✅ new (admin)
  rejectCommunityImage,            // ✅ new (admin)
} = require('../controllers/plantController');

const { protect, adminOnly } = require('../middleware/authMiddleware');
const multer = require('multer');
const { storage } = require('../utils/cloudinary');
const upload = multer({ storage });

router.get('/', getAllPlants);
router.get('/admin/community/pending', protect, adminOnly, listPendingCommunityImages);
router.patch('/admin/community/:plantId/:imageId/approve', protect, adminOnly, approveCommunityImage);
router.delete('/admin/community/:plantId/:imageId', protect, adminOnly, rejectCommunityImage);

router.get('/:id', getPlantById);
router.get('/:id/community', getApprovedCommunityImages);

router.post('/', protect, adminOnly, createPlant);
router.post('/:id/upload', protect, adminOnly, upload.array('images', 5), uploadPlantImages);
router.patch('/:id', protect, adminOnly, updatePlant);
router.delete('/:id', protect, adminOnly, deletePlant);
router.patch('/:id/images/:imageId/set-primary', protect, adminOnly, setPrimaryPlantImage);
router.delete('/:id/images/:imageId', protect, adminOnly, deletePlantImage);

router.post('/:id/community', protect, upload.array('images', 5), uploadCommunityImages);

module.exports = router;

