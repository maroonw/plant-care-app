const express = require('express');
const router = express.Router();
const { getCareLogForUserPlant } = require('../controllers/careLogController');
const { protect } = require('../middleware/authMiddleware');

// GET /api/carelog/:userPlantId
router.get('/:userPlantId', protect, getCareLogForUserPlant);

module.exports = router;
