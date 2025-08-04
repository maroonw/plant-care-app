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

module.exports = router;
