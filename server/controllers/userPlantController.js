const UserPlant = require('../models/UserPlant');
const CareLog = require('../models/CareLog');
const { cloudinary } = require('../utils/cloudinary');

// @route   POST /api/userplants
// @desc    Add a plant to the user's owned list (allows duplicates)
// @access  Private (customer only)
exports.addUserPlant = async (req, res) => {
  const { plantId, nickname, notes, images } = req.body;

  const now = new Date();
  const cs = {
    // you can pull from Plant defaults if you have them; otherwise keep these
    wateringFrequencyDays: 7,
    fertilizingFrequencyDays: 30,
    repotIntervalMonths: 18,
    rotateIntervalDays: 14,
    isCustom: false,
  };

  try {
    // ✅ No "exists" check—allow multiple instances of same plant
    const userPlant = new UserPlant({
      user: req.user._id,
      plant: plantId,
      nickname: nickname || '',
      notes: notes || '',
      careSchedule: cs,
      nextWateringDue: new Date(now.getTime() + cs.wateringFrequencyDays * 86400000),
      nextFertilizingDue: new Date(now.getTime() + cs.fertilizingFrequencyDays * 86400000),
      nextRepotDue: new Date(new Date(now).setMonth(now.getMonth() + cs.repotIntervalMonths)),
      nextRotateDue: new Date(now.getTime() + cs.rotateIntervalDays * 86400000),
      images: images || []
    });

    await userPlant.save();
    res.status(201).json(userPlant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route   DELETE /api/userplants/:id
// @desc    Remove a plant from the user's owned list
// @access  Private
exports.deleteUserPlant = async (req, res) => {
  const { id } = req.params;
  try {
    // Only delete documents owned by this user
    const doc = await UserPlant.findOne({ _id: id, user: req.user._id });
    if (!doc) return res.status(404).json({ message: 'UserPlant not found' });

    // Optional: clean up Cloudinary images for this user plant
    if (doc.images && doc.images.length) {
      const deletions = doc.images
        .map(img => img.public_id)
        .filter(Boolean)
        .map(public_id => cloudinary.uploader.destroy(public_id).catch(() => null));
      await Promise.all(deletions);
    }

    await doc.deleteOne();

    // Return the updated list so the client reconciles immediately
    const list = await UserPlant.find({ user: req.user._id })
      .populate('plant', 'name slug images primaryImage soil tier light');
    return res.json(list);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @route   GET /api/userplants
// @desc    Get all plants the user owns
// @access  Private
exports.getUserPlants = async (req, res) => {
  try {
    const list = await UserPlant.find({ user: req.user._id })
      .populate('plant', 'name slug images primaryImage soil tier light');
    return res.json(list);
  } catch (err) {
    return res.status(500).json({ message: err.message });
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

// PATCH /api/userplants/:id/schedule
// @desc    Update care schedule for a user plant
// @access  Private
exports.updateUserPlantSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { wateringFrequencyDays, fertilizingFrequencyDays, repotIntervalMonths, rotateIntervalDays, isCustom } = req.body;

    const doc = await UserPlant.findOne({ _id: id, user: req.user._id });
    if (!doc) return res.status(404).json({ message: 'UserPlant not found' });

    doc.careSchedule = {
      ...doc.careSchedule?.toObject?.() ?? doc.careSchedule ?? {},
      ...(wateringFrequencyDays != null ? { wateringFrequencyDays } : {}),
      ...(fertilizingFrequencyDays != null ? { fertilizingFrequencyDays } : {}),
      ...(repotIntervalMonths != null ? { repotIntervalMonths } : {}),
      ...(rotateIntervalDays != null ? { rotateIntervalDays } : {}),
      ...(isCustom != null ? { isCustom } : { isCustom: true }),
    };

    const now = new Date();
    const lastWater = doc.lastWatered || now;
    const lastFert  = doc.lastFertilized || now;
    const lastRepot = doc.lastRepotted || now;
    const lastRot   = doc.lastRotated || now;

    const cs = doc.careSchedule || {};
    doc.nextWateringDue    = new Date(lastWater.getTime() + (cs.wateringFrequencyDays ?? 7) * 86400000);
    doc.nextFertilizingDue = new Date(lastFert.getTime()  + (cs.fertilizingFrequencyDays ?? 30) * 86400000);
    const repotNext = new Date(lastRepot);
    repotNext.setMonth(repotNext.getMonth() + (cs.repotIntervalMonths ?? 18));
    doc.nextRepotDue = repotNext;
    doc.nextRotateDue = new Date(lastRot.getTime() + (cs.rotateIntervalDays ?? 14) * 86400000);

    await doc.save();

    const populated = await UserPlant.findById(doc._id)
      .populate('plant', 'name slug images primaryImage soil tier light');

    return res.json(populated);
  } catch (err) {
    return res.status(500).json({ message: err.message });
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
