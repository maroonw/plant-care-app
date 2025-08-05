const express = require('express');
const router = express.Router();
const { getAllPlants,
    createPlant,
    uploadPlantImages,
    deletePlant,
    uploadCommunityImages,
    updatePlant } = require('../controllers/plantController');

const { protect, adminOnly } = require('../middleware/authMiddleware');
const multer = require('multer');
const { storage } = require('../utils/cloudinary');
const upload = multer({ storage });

router.get('/', getAllPlants);
router.post('/', protect, adminOnly, createPlant);

// POST /api/plants/:id/upload
router.post('/:id/upload', protect, adminOnly, upload.array('images', 5), uploadPlantImages);

// PATCH /api/plants/:id
router.patch('/:id', protect, adminOnly, updatePlant);

// DELETE /api/plants/:id
router.delete('/:id', protect, adminOnly, deletePlant);

// POST /api/plants/:id/community
router.post('/:id/community', protect, upload.array('images', 5), uploadCommunityImages);

module.exports = router;
