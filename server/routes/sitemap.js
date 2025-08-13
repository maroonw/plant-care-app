const express = require('express');
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const Plant = require('../models/Plant');

const router = express.Router();
const SITE = 'https://easyhouseplant.com';
const CONTENT_DIR = path.join(__dirname, '..', 'content');

router.get('/sitemap.xml', async (req, res) => {
  try {
    const urls = [];

    // Core pages
    ['/','/plantgallery','/login','/signup'].forEach(p => urls.push(`${SITE}${p}`));

    // Plants
    const plants = await Plant.find({}).select('slug updatedAt');
    plants.forEach(p => {
      // Add SEO plant page if/when you create a slug route; for now include ID detail too if desired
      urls.push(`${SITE}/plants/${p.slug}`);
    });

    // Blog + Care
    const addContent = (subdir, base) => {
      const dir = path.join(CONTENT_DIR, subdir);
      if (!fs.existsSync(dir)) return;
      fs.readdirSync(dir)
        .filter(f => f.endsWith('.md'))
        .forEach(f => {
          const raw = fs.readFileSync(path.join(dir, f), 'utf8');
          const { data } = matter(raw);
          const slug = data.slug || f.replace(/\.md$/, '');
          urls.push(`${SITE}/${base}/${slug}`);
        });
    };
    addContent('blog', 'blog');
    addContent('care', 'care');

    const now = new Date().toISOString();
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `<url><loc>${u}</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq></url>`).join('\n')}
</urlset>`;

    res.type('application/xml').send(xml);
  } catch (e) {
    console.error(e);
    res.status(500).send('error');
  }
});

module.exports = router;
