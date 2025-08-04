const CareLog = require('../models/CareLog');

// @route   GET /api/carelog/:userPlantId
// @desc    Get care log for a specific user plant
// @access  Private
exports.getCareLogForUserPlant = async (req, res) => {
  try {
    const logs = await CareLog.find({
      user: req.user._id,
      userPlant: req.params.userPlantId
    })
      .sort({ timestamp: -1 });

    res.status(200).json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
