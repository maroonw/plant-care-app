const UserPlant = require('../models/UserPlant');

// @route   POST /api/userplants
// @desc    Add a plant to the user's owned list
// @access  Private (customer only)
exports.addUserPlant = async (req, res) => {
  const { plantId, nickname, notes, images } = req.body;

  try {
    const exists = await UserPlant.findOne({
      user: req.user._id,
      plant: plantId
    });

    if (exists) {
      return res.status(400).json({ message: 'You already own this plant.' });
    }

    const userPlant = new UserPlant({
      user: req.user._id,
      plant: plantId,
      nickname,
      notes,
      images
    });

    await userPlant.save();
    res.status(201).json(userPlant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route   GET /api/userplants
// @desc    Get all plants the user owns
// @access  Private
exports.getUserPlants = async (req, res) => {
  try {
    const userPlants = await UserPlant.find({ user: req.user._id }).populate('plant');
    res.status(200).json(userPlants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
