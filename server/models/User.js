const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName:  { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ['customer', 'admin'], default: 'customer' },
  ownedPlants:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'Plant' }],
  wantedPlants:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'Plant' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
