const multer = require('multer');
const { storage } = require('../utils/cloudinary');
const upload = multer({ storage });
const { uploadUserPlantImages, deleteUserPlantImage, setPrimaryUserPlantImage } = require('../controllers/userPlantController');

const express = require('express');
const router = express.Router();
const { addUserPlant } = require('../controllers/userPlantController');
const { protect } = require('../middleware/authMiddleware');
const { getUserPlants } = require('../controllers/userPlantController');
const { logPlantCare } = require('../controllers/userPlantController');


// POST /api/userplants
router.post('/', protect, addUserPlant);

// GET /api/userplants
router.get('/', protect, getUserPlants);

// PATCH /api/userplants/:id/care
router.patch('/:id/care', protect, logPlantCare);

// POST /api/:id/upload
router.post(
    '/:id/upload',
    protect,
    upload.array('images', 5),
    uploadUserPlantImages);

// DELETE an image from a user plant
router.delete(
  '/:plantId/images/:imageId',
  protect,
  deleteUserPlantImage
);
module.exports = router;

// PATCH /api/userplants/:plantId/images/:imageId/set-primary
router.patch(
  '/:plantId/images/:imageId/set-primary',
  protect,
  setPrimaryUserPlantImage
);