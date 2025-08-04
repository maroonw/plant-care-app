const User = require('../models/User');

// @route   POST /api/wanted/:plantId
// @desc    Add plant to user's wanted list
// @access  Private
exports.addWantedPlant = async (req, res) => {
  const plantId = req.params.plantId;

  try {
    const user = await User.findById(req.user._id);
    if (user.wantedPlants.includes(plantId)) {
      return res.status(400).json({ message: 'Plant already in wanted list' });
    }
    user.wantedPlants.push(plantId);
    await user.save();
    res.status(200).json(user.wantedPlants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route   DELETE /api/wanted/:plantId
// @desc    Remove plant from wanted list
// @access  Private
exports.removeWantedPlant = async (req, res) => {
  const plantId = req.params.plantId;

  try {
    const user = await User.findById(req.user._id);
    user.wantedPlants = user.wantedPlants.filter(p => p.toString() !== plantId);
    await user.save();
    res.status(200).json(user.wantedPlants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route   GET /api/wanted
// @desc    Get all wanted plants (with details)
// @access  Private
exports.getWantedPlants = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wantedPlants');
    res.status(200).json(user.wantedPlants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
