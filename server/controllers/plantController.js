const Plant = require('../models/Plant');
const { cloudinary } = require('../utils/cloudinary')

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
    if (!plant) return res.status(404).json({ message: 'Plant not found' });

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images uploaded' });
    }

    // Build "First L." display name
    const first = (req.user.firstName || '').trim();
    const last = (req.user.lastName || '').trim();
    const submittedByName = first
      ? `${first} ${last ? last.charAt(0).toUpperCase() + '.' : ''}`
      : 'Anonymous';

    const newImages = req.files.map(file => ({
      url: file.path,
      public_id: file.filename,
      submittedByName,
      submittedByUser: req.user._id,
      status: 'pending',
      submittedAt: new Date(),
    }));

    plant.communityImages.push(...newImages);
    await plant.save();

    res.status(200).json({
      message: 'Community images submitted and pending moderation',
      submitted: newImages.length,
    });
  } catch (err) {
    console.error('Community image upload error:', err);
    res.status(500).json({ message: 'Server error during upload' });
  }
};

// @route GET /api/plants/:id/community
// @desc  Public: only approved community images
exports.getApprovedCommunityImages = async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id);
    if (!plant) return res.status(404).json({ message: 'Plant not found' });

    const images = (plant.communityImages || []).filter(ci => ci.status === 'approved');
    res.json({ plantId: plant._id, images });
  } catch (err) {
    console.error('getApprovedCommunityImages error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @route GET /api/community/pending
// @access Private (admin)
exports.listPendingCommunityImages = async (req, res) => {
  try {
    // Pull all plants with any pending images (simple approach)
    const plants = await Plant.find({ 'communityImages.status': 'pending' })
      .select('_id name communityImages');

    // Flatten to a convenient list
    const pending = [];
    for (const p of plants) {
      for (const img of p.communityImages) {
        if (img.status === 'pending' || img.status === undefined || img.status === null) {
          pending.push({
            plantId: p._id,
            plantName: p.name,
            imageId: img._id,
            url: img.url,
            public_id: img.public_id,
            submittedByName: img.submittedByName,
            submittedByUser: img.submittedByUser,
            submittedAt: img.submittedAt,
          });
        }
      }
    }
    res.json({ count: pending.length, items: pending });
  } catch (err) {
    console.error('listPendingCommunityImages error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @route PATCH /api/community/:plantId/:imageId/approve
// @access Private (admin)
exports.approveCommunityImage = async (req, res) => {
  try {
    const { plantId, imageId } = req.params;
    const plant = await Plant.findById(plantId);
    if (!plant) return res.status(404).json({ message: 'Plant not found' });

    const img = plant.communityImages.id(imageId);
    if (!img) return res.status(404).json({ message: 'Image not found' });

    img.status = 'approved';
    await plant.save();

    res.json({ message: 'Image approved' });
  } catch (err) {
    console.error('approveCommunityImage error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @route DELETE /api/community/:plantId/:imageId
// @access Private (admin) — reject & delete
exports.rejectCommunityImage = async (req, res) => {
  try {
    const { plantId, imageId } = req.params;
    const plant = await Plant.findById(plantId);
    if (!plant) return res.status(404).json({ message: 'Plant not found' });

    const img = plant.communityImages.id(imageId);
    if (!img) return res.status(404).json({ message: 'Image not found' });

    // delete from Cloudinary if present
    if (img.public_id) {
      try { await cloudinary.uploader.destroy(img.public_id); } catch (e) {
        console.warn('Cloudinary destroy failed (continuing):', e?.message || e);
      }
    }

    img.remove();
    await plant.save();

    res.json({ message: 'Image rejected and removed' });
  } catch (err) {
    console.error('rejectCommunityImage error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Set primary curated image
// @route   PATCH /api/plants/:id/images/:imageId/set-primary
// @access  Private (admin)
exports.setPrimaryPlantImage = async (req, res) => {
  try {
    const { id, imageId } = req.params;
    const plant = await Plant.findById(id);
    if (!plant) return res.status(404).json({ message: 'Plant not found' });

    const image = plant.images.id(imageId);
    if (!image) return res.status(404).json({ message: 'Image not found' });

    plant.primaryImage = image;
    await plant.save();

    res.json({ message: 'Primary image updated', primaryImage: plant.primaryImage });
  } catch (err) {
    console.error('setPrimaryPlantImage error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a curated image (and from Cloudinary if present)
// @route   DELETE /api/plants/:id/images/:imageId
// @access  Private (admin)
exports.deletePlantImage = async (req, res) => {
  try {
    const { id, imageId } = req.params;
    const plant = await Plant.findById(id);
    if (!plant) return res.status(404).json({ message: 'Plant not found' });

    const img = plant.images.id(imageId);
    if (!img) return res.status(404).json({ message: 'Image not found' });

    // If this was the primary, unset it
    if (plant.primaryImage && plant.primaryImage._id?.toString() === imageId) {
      plant.primaryImage = {};
    }

    // Remove from Cloudinary (best-effort)
    if (img.public_id) {
      try { await cloudinary.uploader.destroy(img.public_id); }
      catch (e) { console.warn('Cloudinary destroy failed (continuing):', e?.message || e); }
    }

    // Remove from array
    plant.images.splice(idx, 1);
    await plant.save();

    res.json({ message: 'Image deleted' });
  } catch (err) {
    console.error('deletePlantImage error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
