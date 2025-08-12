const multer = require('multer');
const { storage } = require('../utils/cloudinary');
const upload = multer({ storage });

const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const {
  addUserPlant,
  getUserPlants,
  logPlantCare,
  uploadUserPlantImages,
  deleteUserPlantImage,
  setPrimaryUserPlantImage,
  updateUserPlant,
} = require('../controllers/userPlantController');

// POST /api/userplants
router.post('/', protect, addUserPlant);

// GET /api/userplants
router.get('/', protect, getUserPlants);

// PATCH /api/userplants/:id  (nickname/notes)
router.patch('/:id', protect, updateUserPlant);

// PATCH /api/userplants/:id/care
router.patch('/:id/care', protect, logPlantCare);

// POST /api/userplants/:id/upload
router.post(
  '/:id/upload',
  protect,
  upload.array('images', 5),
  uploadUserPlantImages
);

// DELETE /api/userplants/:plantId/images/:imageId
router.delete('/:plantId/images/:imageId', protect, deleteUserPlantImage);

// PATCH /api/userplants/:plantId/images/:imageId/set-primary
router.patch('/:plantId/images/:imageId/set-primary', protect, setPrimaryUserPlantImage);

// ✅ export LAST
module.exports = router;
