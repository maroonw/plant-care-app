const Plant = require('../models/Plant');

// @desc    Get all plants
// @route   GET /api/plants
exports.getAllPlants = async (req, res) => {
  try {
    const plants = await Plant.find().sort({ name: 1 });
    res.status(200).json(plants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Add a new plant
// @route   POST /api/plants
exports.createPlant = async (req, res) => {
  try {
    const newPlant = new Plant(req.body);
    await newPlant.save();
    res.status(201).json(newPlant);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};