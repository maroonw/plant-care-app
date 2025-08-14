// server/scripts/migrate-soils.js
require('dotenv').config();
const mongoose = require('mongoose');
const Plant = require('../models/Plant');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/yourdb';

// Map old → new soil keys
const map = {
  'well-draining': 'well-draining-aerated',
  'moist': 'moisture-retentive',
  'dry': 'all-purpose',            // if you had “dry”, treat as general-purpose
  'cactus': 'cactus-succulent',
  'specialty': 'specialty-acidic',
  'peat-based': 'well-draining-aerated'
};

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected');

    let total = 0;
    for (const [oldKey, newKey] of Object.entries(map)) {
      const res = await Plant.updateMany({ soil: oldKey }, { $set: { soil: newKey } });
      if (res.modifiedCount) {
        console.log(`${oldKey} → ${newKey}: ${res.modifiedCount} updated`);
        total += res.modifiedCount;
      }
    }

    console.log(`Done. Total updated: ${total}`);
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
})();
