const express = require('express');
const router = express.Router();
const { getCareLogForUserPlant, createCareLog } = require('../controllers/careLogController');
const { protect } = require('../middleware/authMiddleware');

// GET /api/carelog/:userPlantId  -> list logs for one user plant
router.get('/:userPlantId', protect, getCareLogForUserPlant);

// POST /api/carelog             -> create a log (water/fertilize)
router.post('/', protect, createCareLog);

module.exports = router;
