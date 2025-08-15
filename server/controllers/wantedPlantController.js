const User = require('../models/User');

// GET /api/wanted
exports.getWantedPlants = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      'wantedPlants',
      'name slug images primaryImage soil tier light'
    );
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    return res.status(200).json(user.wantedPlants || []);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// POST /api/wanted/:plantId
exports.addWantedPlant = async (req, res) => {
  const plantId = req.params.plantId;
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const already = user.wantedPlants.some(id => id.toString() === plantId);
    if (already) {
      // Still return the current populated list so client can sync
      const populated = await User.findById(user._id).populate(
        'wantedPlants',
        'name slug images primaryImage soil tier light'
      );
      return res.status(200).json(populated.wantedPlants || []);
    }

    user.wantedPlants.push(plantId);
    await user.save();

    const populated = await User.findById(user._id).populate(
      'wantedPlants',
      'name slug images primaryImage soil tier light'
    );
    return res.status(200).json(populated.wantedPlants || []);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// DELETE /api/wanted/:plantId
exports.removeWantedPlant = async (req, res) => {
  const plantId = req.params.plantId;
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    user.wantedPlants = user.wantedPlants.filter(p => p.toString() !== plantId);
    await user.save();

    const populated = await User.findById(user._id).populate(
      'wantedPlants',
      'name slug images primaryImage soil tier light'
    );
    return res.status(200).json(populated.wantedPlants || []);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};