const UserPlant = require('../models/UserPlant');
const CareLog = require('../models/CareLog');

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

// @route   PATCH /api/userplants/:id/care
// @desc    Log watering or fertilizing for a user plant
// @access  Private
exports.logPlantCare = async (req, res) => {
  const { type, note } = req.body; // "water" or "fertilize"

  try {
    const userPlant = await UserPlant.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!userPlant) {
      return res.status(404).json({ message: 'UserPlant not found' });
    }

    const now = new Date();

    if (type === 'water') {
      userPlant.lastWatered = now;
      userPlant.nextWateringDue = new Date(now.getTime() + userPlant.careSchedule.wateringFrequencyDays * 24 * 60 * 60 * 1000);
    } else if (type === 'fertilize') {
      userPlant.lastFertilized = now;
      userPlant.nextFertilizingDue = new Date(now.getTime() + userPlant.careSchedule.fertilizingFrequencyDays * 24 * 60 * 60 * 1000);
    } else {
      return res.status(400).json({ message: 'Invalid care type' });
    }

    await userPlant.save();

    await CareLog.create({
      user: req.user._id,
      userPlant: userPlant._id,
      type,
      note: note || ''
    });

    res.status(200).json(userPlant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
