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
    wateringFrequencyDays: { type: Number, default: 7 }, // how often to water
    fertilizingFrequencyDays: { type: Number, default: 30 } // how often to fertilize
  },
  lastWatered: { type: Date, default: null },
  lastFertilized: { type: Date, default: null },
  nextWateringDue: { type: Date, default: null },
  nextFertilizingDue: { type: Date, default: null },
  addedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserPlant', userPlantSchema);
