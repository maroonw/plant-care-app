const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  url: String,
  public_id: String,
});

const communityImageSchema = new mongoose.Schema({
  url: String,
  public_id: String,
  submittedByName: String, // e.g., "Bill D."
  submittedByUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  submittedAt: { type: Date, default: Date.now },
});

const plantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  scientificName: { type: String },
  tier: { type: String, enum: ['easy', 'standard', 'hard'], required: true },
  wateringFrequencyDays: Number,
  fertilizingFrequencyDays: Number,
  light: { type: String, enum: ['low', 'medium', 'bright', 'direct'] },
  soil: { type: String, enum: ['well-draining', 'moist', 'dry', 'specialty'] },
  petFriendly: Boolean,
  toxicToPets: Boolean,
  images: [imageSchema],
  primaryImage: imageSchema,
  // ⬇️ now uses the richer schema
  communityImages: [communityImageSchema],
});

module.exports = mongoose.model('Plant', plantSchema);
