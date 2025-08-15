const CareLog = require('../models/CareLog');
const UserPlant = require('../models/UserPlant');

// @route   GET /api/carelog/:userPlantId
// @desc    Get care log for a specific user plant
// @access  Private
exports.getCareLogForUserPlant = async (req, res) => {
  try {
    const { userPlantId } = req.params;
    const logs = await CareLog.find({ user: req.user._id, userPlant: userPlantId })
      .sort({ timestamp: -1 })
      .limit(100);
    return res.json(logs);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @route   POST /api/carelog
// @desc    Create a care log entry for a user plant (water/fertilize)
// @access  Private
exports.createCareLog = async (req, res) => {
  try {
    const { userPlantId, type, date, note } = req.body; // type: 'water' | 'fertilize'
    if (!userPlantId || !type) {
      return res.status(400).json({ message: 'userPlantId and type are required' });
    }

    const userPlant = await UserPlant.findOne({ _id: userPlantId, user: req.user._id });
    if (!userPlant) return res.status(404).json({ message: 'UserPlant not found' });

    const when = date ? new Date(date) : new Date();

    // pull frequencies (fallback to defaults)
    const waterDays =
      userPlant.careSchedule?.wateringFrequencyDays ??
      userPlant.wateringFrequencyDays ?? // if you have top-level copies
      7;
    const fertDays =
      userPlant.careSchedule?.fertilizingFrequencyDays ??
      userPlant.fertilizingFrequencyDays ?? // if you have top-level copies
      30;

    if (type === 'water') {
      userPlant.lastWatered = when;
      userPlant.nextWateringDue = new Date(when.getTime() + waterDays * 24 * 60 * 60 * 1000);
    } else if (type === 'fertilize') {
      userPlant.lastFertilized = when;
      userPlant.nextFertilizingDue = new Date(when.getTime() + fertDays * 24 * 60 * 60 * 1000);
    } else {
      return res.status(400).json({ message: 'Invalid care type' });
    }

    await userPlant.save();

    const log = await CareLog.create({
      user: req.user._id,
      userPlant: userPlant._id,
      type,
      note: note || '',
      timestamp: when,
    });

    // return populated doc so client can update UI instantly
    const populated = await UserPlant.findById(userPlant._id)
      .populate('plant', 'name slug images primaryImage soil tier light');

    return res.status(201).json({ ok: true, log, userPlant: populated });
  } catch (err) {
    console.error('createCareLog error:', err);
    return res.status(500).json({ message: err.message });
  }
};