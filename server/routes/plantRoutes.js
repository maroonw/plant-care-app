const express = require('express');
const router = express.Router();
const { getAllPlants, createPlant } = require('../controllers/plantController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', getAllPlants);
router.post('/', protect, adminOnly, createPlant);

module.exports = router;
