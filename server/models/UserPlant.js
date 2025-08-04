const mongoose = require('mongoose');

const userPlantSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plant: { type: mongoose.Schema.Types.ObjectId, ref: 'Plant', required: true },
  nickname: { type: String }, // optional name like “Fred the Fiddle”
  notes: { type: String, default: '' },
  images: [{ type: String }], // URLs of uploaded images
  addedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserPlant', userPlantSchema);
