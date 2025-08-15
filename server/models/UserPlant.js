const mongoose = require('mongoose');

const userPlantSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plant: { type: mongoose.Schema.Types.ObjectId, ref: 'Plant', required: true },
  nickname: { type: String }, // optional name like “Fred the Fiddle”
  notes: { type: String, default: '' },
  images: [
    {
    url: String,
    public_id: String,
    }
  ],
  primaryImage: {
    url: String,
    public_id: String,
  },

  careSchedule: {
    wateringFrequencyDays: { type: Number, default: 7 },      // recommendation; user may override
    fertilizingFrequencyDays: { type: Number, default: 30 },
    repotIntervalMonths: { type: Number, default: 18 },
    rotateIntervalDays: { type: Number, default: 14 },
    isCustom: { type: Boolean, default: false },
  },

  lastWatered: Date,
  nextWateringDue: Date,

  lastFertilized: Date,
  nextFertilizingDue: Date,

  lastRepotted: Date,
  nextRepotDue: Date,

  lastRotated: Date,
  nextRotateDue: Date,
  addedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserPlant', userPlantSchema);
