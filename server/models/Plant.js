const mongoose = require('mongoose');

const slugify = (s) =>
  s.toString().toLowerCase()
    .replace(/[\s\._/]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

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
  slug: { type: String, index: true, unique: true }, // NEW
  scientificName: String,
  tier: { type: String, enum: ['easy', 'standard', 'hard'], required: true },
  wateringFrequencyDays: Number,
  fertilizingFrequencyDays: Number,
  light: { type: String, enum: ['low', 'medium', 'bright', 'direct'] },
  soil: { type: String, enum: ['well-draining', 'moist', 'dry', 'specialty'] },
  petFriendly: Boolean,
  toxicToPets: Boolean,
  images: [imageSchema],
  primaryImage: imageSchema,
  communityImages: [communityImageSchema],
}, { timestamps: true });

plantSchema.pre('save', async function(next) {
  if (!this.isModified('name') && this.slug) return next();
  const base = slugify(this.name || '');
  if (!base) return next();

  // ensure unique (append counter if needed)
  let candidate = base, i = 2;
  const Plant = this.constructor;
  while (await Plant.findOne({ slug: candidate, _id: { $ne: this._id } })) {
    candidate = `${base}-${i++}`;
  }
  this.slug = candidate;
  next();
});

module.exports = mongoose.model('Plant', plantSchema);
