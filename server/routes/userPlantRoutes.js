const express = require('express');
const multer = require('multer');
const router = express.Router();

const { storage } = require('../utils/cloudinary');
const upload = multer({ storage });

const { protect } = require('../middleware/authMiddleware');
const {
  addUserPlant,
  getUserPlants,
  updateUserPlant,
  deleteUserPlant,
  logPlantCare,
  uploadUserPlantImages,
  deleteUserPlantImage,
  setPrimaryUserPlantImage,
} = require('../controllers/userPlantController');

// GET all for current user
router.get('/', protect, getUserPlants);

// CREATE
router.post('/', protect, addUserPlant);

// UPDATE (nickname/notes/etc.)
router.patch('/:id', protect, updateUserPlant);

// DELETE (remove from My Plants)
router.delete('/:id', protect, deleteUserPlant);

// CARE LOG (optional endpoint if you want to log via this controller)
// If you’re logging via /api/carelog controller, you can omit this.
// router.post('/:id/log', protect, logPlantCare);

// Upload images for a user plant
router.post('/:id/upload', protect, upload.array('images', 5), uploadUserPlantImages);

// Delete a single image
router.delete('/:plantId/images/:imageId', protect, deleteUserPlantImage);

// Set primary image
router.patch('/:plantId/images/:imageId/set-primary', protect, setPrimaryUserPlantImage);

module.exports = router;
