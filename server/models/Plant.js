const mongoose = require('mongoose');

const plantSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  tier: { type: String, enum: ['easy', 'standard', 'hard'], required: true },
  wateringSchedule: {
    type: String,
    enum: ['weekly', 'biweekly', 'monthly', 'as needed'],
    required: true
  },
  lightRequirement: {
    type: String,
    enum: ['low', 'medium', 'bright indirect', 'direct'],
    required: true
  },
  soilType: {
    type: String,
    enum: ['well-draining', 'cactus', 'peat-based', 'moist'],
    required: true
  },
  animalFriendly: { type: Boolean, default: false },
  notes: { type: String, default: '' },
  images: [{ type: String }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Plant', plantSchema);

