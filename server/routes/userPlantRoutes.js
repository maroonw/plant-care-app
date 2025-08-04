const express = require('express');
const router = express.Router();
const { addUserPlant } = require('../controllers/userPlantController');
const { protect } = require('../middleware/authMiddleware');
const { getUserPlants } = require('../controllers/userPlantController');

// POST /api/userplants
router.post('/', protect, addUserPlant);

// GET /api/userplants
router.get('/', protect, getUserPlants);

module.exports = router;
