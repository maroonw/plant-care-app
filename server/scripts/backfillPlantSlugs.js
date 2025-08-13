// /server/scripts/backfillPlantSlugs.js
require('dotenv').config();
const mongoose = require('mongoose');
const Plant = require('../models/Plant');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const plants = await Plant.find({});
    let updated = 0;
    for (const p of plants) {
      const before = p.slug;
      // trigger pre('save') hook to compute slug from name
      p.markModified('name');
      await p.save();
      if (!before && p.slug) updated++;
    }
    console.log({ updated });
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
