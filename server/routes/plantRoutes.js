const express = require('express');
const router = express.Router();
const { getAllPlants, createPlant } = require('../controllers/plantController');

router.get('/', getAllPlants);
router.post('/', createPlant);

module.exports = router;
