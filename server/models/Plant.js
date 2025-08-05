const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  url: String,
  public_id: String,
  submittedBy: String
});

const plantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  scientificName: { type: String },
  tier: {
    type: String,
    enum: ['easy', 'standard', 'hard'],
    required: true,
  },
  wateringFrequencyDays: Number,
  fertilizingFrequencyDays: Number,
  light: {
    type: String,
    enum: ['low', 'medium', 'bright', 'direct'],
  },
  soil: {
    type: String,
    enum: ['well-draining', 'moist', 'dry', 'specialty'],
  },
  petFriendly: Boolean,
  toxicToPets: Boolean,
  images: [imageSchema],           // Curated image gallery
  primaryImage: imageSchema,       // One designated image
  communityImages: [imageSchema],  // Optional community-submitted gallery
});

module.exports = mongoose.model('Plant', plantSchema);

