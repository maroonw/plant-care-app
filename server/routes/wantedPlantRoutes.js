const express = require('express');
const router = express.Router();
const {
  addWantedPlant,
  removeWantedPlant,
  getWantedPlants
} = require('../controllers/wantedPlantController');
const { protect } = require('../middleware/authMiddleware');

// GET all wanted plants (populated)
router.get('/', protect, getWantedPlants);

// Add to wanted list
router.post('/:plantId', protect, addWantedPlant);

// Remove from wanted list
router.delete('/:plantId', protect, removeWantedPlant);

module.exports = router;
