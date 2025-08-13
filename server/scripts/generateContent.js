require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Plant = require('../models/Plant');

const CONTENT_DIR = path.join(__dirname, '..', 'content');
const blogDir = path.join(CONTENT_DIR, 'blog');
const careDir = path.join(CONTENT_DIR, 'care');

function ensureDir(d) { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); }

const today = new Date().toISOString().slice(0,10);

const careTemplate = (p) => `---
title: "${p.name} Care Guide"
slug: "${p.slug}-care"
plantSlug: "${p.slug}"
type: "care"
date: "${today}"
tags: ["care","${p.tier || 'standard'}","${p.light || 'medium'}"]
description: "Care for ${p.name}${p.scientificName ? ` (${p.scientificName})` : ''}: watering, light, soil, fertilizing, and tips."
---

## Overview
${p.name}${p.scientificName ? ` (*${p.scientificName}*)` : ''} is a ${p.tier} care plant that prefers **${p.light}** light and **${p.soil}** soil.

## Watering
Water every **${p.wateringFrequencyDays || 7}** days (adjust for light, pot size, and season).

## Fertilizing
Fertilize about every **${p.fertilizingFrequencyDays || 45}** days during active growth.

## Light
Best in **${p.light}** conditions. Avoid extremes unless noted.

## Soil
Use **${p.soil}** soil; ensure drainage.

## Pet Safety
${p.petFriendly ? 'Generally considered pet-friendly.' : 'Potentially toxic—keep away from pets.'}

## Tips
- Check soil moisture before watering
- Rotate the pot monthly for even growth
`;

const blogTemplate = (p) => `---
title: "Why ${p.name} Belongs in Your Home"
slug: "why-${p.slug}-belongs-in-your-home"
plantSlug: "${p.slug}"
type: "blog"
date: "${today}"
tags: ["plant-spotlight","${p.tier || 'standard'}"]
description: "A quick look at why ${p.name} is a great choice, with light, watering, and style notes."
---

Looking for a reliable houseplant? **${p.name}** is a solid pick.

### What we love
- ${p.name} fits ${p.light} light scenarios.
- Care tier: **${p.tier}**.
- Water every **${p.wateringFrequencyDays || 7}** days, on average.

### Styling tips
Try a pot that complements its foliage, and place it where it gets **${p.light}** light.

> Want more? Read the [full care guide](/care/${p.slug}-care).
`;

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    ensureDir(blogDir);
    ensureDir(careDir);

    const plants = await Plant.find({}).select('name slug scientificName tier light soil wateringFrequencyDays fertilizingFrequencyDays petFriendly');

    let madeCare = 0, madeBlog = 0;

    for (const p of plants) {
      if (!p.slug) continue;

      const carePath = path.join(careDir, `${p.slug}-care.md`);
      if (!fs.existsSync(carePath)) {
        fs.writeFileSync(carePath, careTemplate(p), 'utf8');
        madeCare++;
      }

      const blogPath = path.join(blogDir, `why-${p.slug}-belongs-in-your-home.md`);
      if (!fs.existsSync(blogPath)) {
        fs.writeFileSync(blogPath, blogTemplate(p), 'utf8');
        madeBlog++;
      }
    }

    console.log({ generatedCare: madeCare, generatedBlog: madeBlog });
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
