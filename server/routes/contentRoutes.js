const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');
const express = require('express');
const Plant = require('../models/Plant');
const multer = require('multer');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

const CONTENT_DIR = path.join(__dirname, '..', 'content');

function loadDoc(type, slug) {
  const dir = path.join(CONTENT_DIR, type);
  const file = path.join(dir, `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, 'utf8');
  const { data, content } = matter(raw);
  const html = marked.parse(content);
  return { frontmatter: data, html };
}

// Public: render blog post as HTML page
router.get('/blog/:slug', (req, res) => {
  const doc = loadDoc('blog', req.params.slug);
  if (!doc) return res.status(404).send('Not found');
  const { frontmatter, html } = doc;
  res.type('html').send(`
<!doctype html><html lang="en"><head>
<meta charset="utf-8">
<title>${frontmatter.title}</title>
<meta name="description" content="${frontmatter.description || ''}">
<link rel="canonical" href="https://easyhouseplant.com/blog/${frontmatter.slug || req.params.slug}">
</head><body>
<article>
<h1>${frontmatter.title}</h1>
${html}
</article>
</body></html>`);
});

// Public: render care guide as HTML page
router.get('/care/:slug', (req, res) => {
  const doc = loadDoc('care', req.params.slug);
  if (!doc) return res.status(404).send('Not found');
  const { frontmatter, html } = doc;
  res.type('html').send(`
<!doctype html><html lang="en"><head>
<meta charset="utf-8">
<title>${frontmatter.title}</title>
<meta name="description" content="${frontmatter.description || ''}">
<link rel="canonical" href="https://easyhouseplant.com/care/${frontmatter.slug || req.params.slug}">
</head><body>
<article>
<h1>${frontmatter.title}</h1>
${html}
</article>
</body></html>`);
});

// API: related content by plantSlug (for PlantDetail widgets)
router.get('/api/content/related', async (req, res) => {
  try {
    const { plantSlug } = req.query;
    if (!plantSlug) return res.json({ blog: [], care: [] });

    const blogDir = path.join(CONTENT_DIR, 'blog');
    const careDir = path.join(CONTENT_DIR, 'care');

    const readFolder = (dir, type) => {
      if (!fs.existsSync(dir)) return [];
      return fs.readdirSync(dir)
        .filter(f => f.endsWith('.md'))
        .map(f => {
          const raw = fs.readFileSync(path.join(dir, f), 'utf8');
          const { data } = matter(raw);
          return { ...data, type };
        })
        .filter(d => d.plantSlug === plantSlug);
    };

    res.json({
      blog: readFolder(blogDir, 'blog'),
      care: readFolder(careDir, 'care'),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ blog: [], care: [] });
  }
});

// in contentRoutes.js
router.get('/plants/:slug', async (req, res) => {
  const p = await Plant.findOne({ slug: req.params.slug });
  if (!p) return res.status(404).send('Not found');
  res.type('html').send(`<!doctype html><html><head>
<title>${p.name} — Care & Guide</title>
<meta name="description" content="Care information, light, watering, soil, and photos for ${p.name}.">
<link rel="canonical" href="https://easyhouseplant.com/plants/${p.slug}">
</head><body>
<h1>${p.name}</h1>
<p><i>${p.scientificName || ''}</i></p>
<ul>
<li>Tier: ${p.tier}</li>
<li>Light: ${p.light}</li>
<li>Soil: ${p.soil}</li>
<li>Water: every ${p.wateringFrequencyDays || 7} days</li>
</ul>
<p>Care guide: <a href="/care/${p.slug}-care">Read now</a></p>
</body></html>`);
});

// Index pages listing all blog / care posts
router.get('/blog', (req, res) => {
  const dir = path.join(CONTENT_DIR, 'blog');
  const items = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith('.md')) : [];
  const links = items.map(f => {
    const raw = fs.readFileSync(path.join(dir, f), 'utf8');
    const { data } = matter(raw);
    const slug = data.slug || f.replace(/\.md$/, '');
    const title = data.title || slug;
    const desc = data.description || '';
    return `<li><a href="/blog/${slug}">${title}</a>${desc ? ` — <span>${desc}</span>`:''}</li>`;
  }).join('\n');

  res.type('html').send(`<!doctype html><html><head>
<meta charset="utf-8"><title>Blog — EasyHouseplant</title>
<link rel="canonical" href="https://easyhouseplant.com/blog">
</head><body>
<h1>Blog</h1>
<ul>${links || '<li>No posts yet.</li>'}</ul>
</body></html>`);
});

router.get('/care', (req, res) => {
  const dir = path.join(CONTENT_DIR, 'care');
  const items = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith('.md')) : [];
  const links = items.map(f => {
    const raw = fs.readFileSync(path.join(dir, f), 'utf8');
    const { data } = matter(raw);
    const slug = data.slug || f.replace(/\.md$/, '');
    const title = data.title || slug;
    const desc = data.description || '';
    return `<li><a href="/care/${slug}">${title}</a>${desc ? ` — <span>${desc}</span>`:''}</li>`;
  }).join('\n');

  res.type('html').send(`<!doctype html><html><head>
<meta charset="utf-8"><title>Care Guides — EasyHouseplant</title>
<link rel="canonical" href="https://easyhouseplant.com/care">
</head><body>
<h1>Care Guides</h1>
<ul>${links || '<li>No guides yet.</li>'}</ul>
</body></html>`);
});

router.get('/api/content/list', (req, res) => {
  const { type } = req.query; // 'blog' | 'care'
  const dir = path.join(CONTENT_DIR, type === 'blog' ? 'blog' : 'care');
  if (!fs.existsSync(dir)) return res.json([]);
  const items = fs.readdirSync(dir).filter(f => f.endsWith('.md')).map(f => {
    const raw = fs.readFileSync(path.join(dir, f), 'utf8');
    const { data } = matter(raw);
    return data;
  });
  res.json(items);
});

// Root folder for content assets
const ASSETS_ROOT = path.join(__dirname, '..', 'content', 'assets');

// Multer storage that writes into /content/assets/:type/:slug/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { type, slug } = req.params; // type: 'blog' | 'care'
    const dir = path.join(ASSETS_ROOT, type, slug);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, `${Date.now()}_${safe}`);
  },
});
const upload = multer({ storage });

// List assets for a post
router.get('/api/content/:type/:slug/assets', protect, adminOnly, (req, res) => {
  const { type, slug } = req.params;
  const dir = path.join(ASSETS_ROOT, type, slug);
  if (!fs.existsSync(dir)) return res.json([]);
  const files = fs.readdirSync(dir)
    .filter(f => !f.startsWith('.'))
    .map(f => ({
      filename: f,
      url: `/content-assets/${type}/${slug}/${f}`,
    }));
  res.json(files);
});

// Upload assets
router.post(
  '/api/content/:type/:slug/assets',
  protect,
  adminOnly,
  upload.array('files', 10), // form field "files"
  (req, res) => {
    const { type, slug } = req.params;
    const out = (req.files || []).map(f => ({
      filename: path.basename(f.path),
      url: `/content-assets/${type}/${slug}/${path.basename(f.path)}`,
    }));
    res.json({ uploaded: out });
  }
);

// Delete one asset
router.delete(
  '/api/content/:type/:slug/assets/:filename',
  protect,
  adminOnly,
  (req, res) => {
    const { type, slug, filename } = req.params;
    const file = path.join(ASSETS_ROOT, type, slug, filename);
    try {
      if (fs.existsSync(file)) fs.unlinkSync(file);
      return res.json({ message: 'Deleted' });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: 'Delete failed' });
    }
  }
);

// server/routes/contentRoutes.js (add these)
router.get('/api/content/get/:type/:slug', (req, res) => {
  const { type, slug } = req.params; // 'blog' | 'care'
  const doc = loadDoc(type, slug);
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json(doc); // { frontmatter, html }
});


module.exports = router;
