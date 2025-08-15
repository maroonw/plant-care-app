const mongoose = require('mongoose');

const careLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userPlant: { type: mongoose.Schema.Types.ObjectId, ref: 'UserPlant', required: true },
  type: {
    type: String,
    enum: ['water', 'fertilize', 'repot', 'rotate'],
    required: true
  },
  note: { type: String },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CareLog', careLogSchema);
