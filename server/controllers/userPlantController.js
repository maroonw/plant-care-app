const UserPlant = require('../models/UserPlant');
const CareLog = require('../models/CareLog');
const { cloudinary } = require('../utils/cloudinary');

// @route   POST /api/userplants
// @desc    Add a plant to the user's owned list (allows duplicates)
// @access  Private (customer only)
exports.addUserPlant = async (req, res) => {
  const { plantId, nickname, notes, images } = req.body;

  try {
    // ✅ No "exists" check—allow multiple instances of same plant
    const userPlant = new UserPlant({
      user: req.user._id,
      plant: plantId,
      nickname: nickname || '',
      notes: notes || '',
      images: images || []
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

// @route   POST /api/userplants/:id/upload
// @desc    Upload plant image
// @access  Private
exports.uploadUserPlantImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const userPlant = await UserPlant.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!userPlant) {
      return res.status(404).json({ message: 'UserPlant not found' });
    }

    const newImages = req.files.map(file => ({
      url: file.path,
      public_id: file.filename,
    }));

    userPlant.images.push(...newImages);

    // If no primary image yet, set the first one
    if (
      !userPlant.primaryImage ||
      !userPlant.primaryImage.url ||
      userPlant.primaryImage.url === ''
    ) {
      userPlant.primaryImage = newImages[0];
    }

    await userPlant.save();

    res.status(200).json({
      message: 'Images uploaded successfully',
      images: userPlant.images,
      primaryImage: userPlant.primaryImage,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.deleteUserPlantImage = async (req, res) => {
  try {
    const { plantId, imageId } = req.params;
    const userId = req.user.id;

    // ✅ First, fetch the UserPlant document from MongoDB
    const userPlant = await UserPlant.findOne({ _id: plantId, user: userId });

    if (!userPlant) {
      return res.status(404).json({ message: 'UserPlant not found or unauthorized' });
    }

    // ✅ Find the index of the image to delete
    const imageIndex = userPlant.images.findIndex(
      img => img._id.toString() === imageId
    );

    if (imageIndex === -1) {
      return res.status(404).json({ message: 'Image not found' });
    }

    const imageToDelete = userPlant.images[imageIndex];

    // ✅ Delete from Cloudinary if it has a public_id
    if (imageToDelete.public_id) {
      await cloudinary.uploader.destroy(imageToDelete.public_id);
    }

    // ✅ Remove from images array
    userPlant.images.splice(imageIndex, 1);

    // ✅ If it's the primary image, unset it
    if (
      userPlant.primaryImage &&
      userPlant.primaryImage._id?.toString() === imageId
    ) {
      userPlant.primaryImage = {};
    }

    await userPlant.save();

    res.json({ message: 'Image deleted successfully' });
  } catch (err) {
    console.error('Image deletion error:', err);
    res.status(500).json({ message: 'Server error during image deletion' });
  }
};

exports.setPrimaryUserPlantImage = async (req, res) => {
  try {
    const { plantId, imageId } = req.params;
    const userId = req.user.id;

    const userPlant = await UserPlant.findOne({ _id: plantId, user: userId });

    if (!userPlant) {
      return res.status(404).json({ message: 'UserPlant not found or unauthorized' });
    }

    const selectedImage = userPlant.images.find(img => img._id.toString() === imageId);

    if (!selectedImage) {
      return res.status(404).json({ message: 'Image not found' });
    }

    userPlant.primaryImage = selectedImage;
    await userPlant.save();

    res.status(200).json({
      message: 'Primary image updated successfully',
      primaryImage: userPlant.primaryImage.toObject ? userPlant.primaryImage.toObject() : userPlant.primaryImage
    });
  } catch (err) {
    console.error('Set primary image error:', err);
    res.status(500).json({ message: 'Server error during primary image update' });
  }
};

// @route   PATCH /api/userplants/:id
// @desc    Update nickname/notes on a user plant
// @access  Private
exports.updateUserPlant = async (req, res) => {
  try {
    const { nickname, notes } = req.body;

    const updated = await UserPlant.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { ...(nickname !== undefined && { nickname }), ...(notes !== undefined && { notes }) },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'UserPlant not found' });
    }

    res.json(updated);
  } catch (err) {
    console.error('updateUserPlant error:', err);
    res.status(500).json({ message: err.message });
  }
};
