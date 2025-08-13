require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const parse = require('csv-parse').parse;
const Plant = require('../models/Plant');

const LIGHTS = new Set(['low','medium','bright','direct']);
const SOILS  = new Set(['well-draining','moist','dry','specialty']);
const TIERS  = new Set(['easy','standard','hard']);

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const file = path.join(__dirname, '..', 'data', 'plants.csv');
    const csv = fs.readFileSync(file, 'utf8');

    const records = await new Promise((resolve, reject) => {
      parse(csv, { columns: true, trim: true }, (err, out) => err ? reject(err) : resolve(out));
    });

    let created = 0, updated = 0, skipped = 0;

    for (const r of records) {
      // normalize + validate
      const doc = {
        name: r.name,
        scientificName: r.scientificName || '',
        tier: (r.tier || '').toLowerCase(),
        wateringFrequencyDays: r.wateringFrequencyDays ? Number(r.wateringFrequencyDays) : undefined,
        fertilizingFrequencyDays: r.fertilizingFrequencyDays ? Number(r.fertilizingFrequencyDays) : undefined,
        light: (r.light || '').toLowerCase(),
        soil: (r.soil || '').toLowerCase(),
        petFriendly: String(r.petFriendly || '').toLowerCase() === 'true'
      };

      if (!doc.name || !TIERS.has(doc.tier) || !LIGHTS.has(doc.light) || !SOILS.has(doc.soil)) {
        console.log('Skip invalid row:', r);
        skipped++;
        continue;
      }

      // upsert by name
      const existing = await Plant.findOne({ name: doc.name });
      if (existing) {
        Object.assign(existing, doc);
        await existing.save();
        updated++;
      } else {
        await Plant.create(doc);
        created++;
      }
    }

    console.log({ created, updated, skipped });
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
