const Plant = require('../models/Plant');

// @desc    Get all plants (with filters)
// @route   GET /api/plants
exports.getAllPlants = async (req, res) => {
  try {
    const { tier, light, soil, watering, pets, q } = req.query;

    const and = [];

    // tier
    if (tier) {
      and.push({ tier: tier.toLowerCase() });
    }

    // light (supports 'light' and legacy 'lightRequirement')
    if (light) {
      const l = light.toLowerCase();
      and.push({
        $or: [
          { light: l },
          { lightRequirement: l }, // legacy
        ],
      });
    }

    // soil (supports 'soil' and legacy 'soilType')
    if (soil) {
      const s = soil.toLowerCase();
      and.push({
        $or: [
          { soil: s },
          { soilType: s }, // legacy
        ],
      });
    }

    // pet-friendly (supports 'petFriendly' and legacy 'animalFriendly')
    if (pets && (pets === '1' || pets === 'true' || pets === true)) {
      and.push({
        $or: [
          { petFriendly: true },
          { animalFriendly: true }, // legacy
        ],
      });
    }

    // watering (supports 'wateringSchedule' and range on 'wateringFrequencyDays')
    if (watering) {
      const w = watering.toLowerCase();
      let range = null;
      // map weekly/biweekly/monthly to frequency day ranges
      if (w === 'weekly') range = { min: 5, max: 8 };        // ~7 days
      else if (w === 'biweekly') range = { min: 10, max: 16 }; // ~14 days
      else if (w === 'monthly') range = { min: 25, max: 35 };  // ~30 days

      const or = [{ wateringSchedule: w }]; // textual schedule exact match

      if (range) {
        or.push({
          wateringFrequencyDays: { $gte: range.min, $lte: range.max },
        });
      }

      // If watering is a numeric like '10-days' (client side fallback), support that too
      const numericMatch = /^(\d+)(?:-days)?$/.exec(w);
      if (numericMatch) {
        const n = parseInt(numericMatch[1], 10);
        if (!Number.isNaN(n)) {
          or.push({ wateringFrequencyDays: n });
        }
      }

      and.push({ $or: or });
    }

    // q (text search on name/scientificName, case-insensitive)
    if (q && q.trim()) {
      const regex = new RegExp(q.trim(), 'i');
      and.push({
        $or: [{ name: regex }, { scientificName: regex }],
      });
    }

    const query = and.length ? { $and: and } : {};

    const plants = await Plant.find(query).sort({ name: 1 });
    res.status(200).json(plants);
  } catch (err) {
    console.error('getAllPlants error:', err);
    res.status(500).json({ message: err.message });
  }
};


// @desc    Get a single plant by id
// @route   GET /api/plants/:id
exports.getPlantById = async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id);
    if (!plant) return res.status(404).json({ message: 'Plant not found' });
    res.status(200).json(plant);
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
// @desc    Upload images for a plant
// @route   POST /api/plants/:id/upload
exports.uploadPlantImages = async (req, res) => {
  try {
    const plantId = req.params.id;
    const plant = await Plant.findById(plantId);

    if (!plant) {
      return res.status(404).json({ message: 'Plant not found' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images uploaded' });
    }

    const uploadedImages = req.files.map(file => ({
      url: file.path,
      public_id: file.filename,
    }));

    plant.images.push(...uploadedImages);

    if (!plant.primaryImage || !plant.primaryImage.url) {
      plant.primaryImage = uploadedImages[0];
    }

    await plant.save();

    res.status(200).json({
      message: 'Images uploaded successfully',
      images: plant.images,
      primaryImage: plant.primaryImage
    });

  } catch (err) {
    console.error('Plant image upload error:', err);
    res.status(500).json({ message: 'Server error during image upload' });
  }
};

// @desc    Update an existing plant
// @route   PATCH /api/plants/:id
// @access  Private (admin only)
exports.updatePlant = async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id);
    if (!plant) {
      return res.status(404).json({ message: 'Plant not found' });
    }

    Object.assign(plant, req.body); // merge updated fields
    await plant.save();

    res.status(200).json(plant);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Delete a plant
// @route   DELETE /api/plants/:id
// @access  Private (admin only)
exports.deletePlant = async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id);
    if (!plant) {
      return res.status(404).json({ message: 'Plant not found' });
    }

    await plant.deleteOne();
    res.json({ message: 'Plant deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error during deletion' });
  }
};

// @desc    Upload community images to a plant
// @route   POST /api/plants/:id/community
// @access  Private (any signed-in user)
exports.uploadCommunityImages = async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id);
    if (!plant) {
      return res.status(404).json({ message: 'Plant not found' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images uploaded' });
    }

  let displayName = "Anonymous";
    if (req.user?.firstName && req.user?.lastName) {
      displayName = `${req.user.firstName} ${req.user.lastName.charAt(0)}.`;
    }

    const newImages = req.files.map(file => ({
      url: file.path,
      public_id: file.filename,
      submittedBy: displayName
    }));

    plant.communityImages.push(...newImages);
    await plant.save();

    res.status(200).json({
      message: 'Community images uploaded successfully',
      communityImages: plant.communityImages
    });

  // console.log(req.files)

  } catch (err) {
    console.error('Community image upload error:', err);
    res.status(500).json({ message: 'Server error during upload' });
  }
};

// @desc    Get community images for a specific plant
// @route   GET /api/plants/:id/community
exports.getCommunityImages = async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id);
    if (!plant) {
      return res.status(404).json({ message: 'Plant not found' });
    }

    res.status(200).json({
      communityImages: plant.communityImages
    });
  } catch (err) {
    console.error('Error getting community images:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

