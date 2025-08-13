// /server/scripts/humanizeContent.js
// Remix existing /content/blog and /content/care files to be more varied/human
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const CONTENT_DIR = path.join(__dirname, '..', 'content');
const BLOG_DIR = path.join(CONTENT_DIR, 'blog');
const CARE_DIR = path.join(CONTENT_DIR, 'care');

// deterministic pseudo-random by slug
function mulberry32(a) { return function() { let t = a += 0x6D2B79F5; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function seededChoice(rand, arr) { return arr[Math.floor(rand() * arr.length)]; }
function seededShuffle(rand, arr) { const a = arr.slice(); for (let i=a.length-1;i>0;i--){ const j=Math.floor(rand()* (i+1)); [a[i],a[j]]=[a[j],a[i]];} return a; }

const synonyms = {
  overview: ["Overview","At a glance","Quick take","What to know"],
  watering: ["Watering","How to water","Irrigation","Moisture & watering"],
  fertilizing: ["Fertilizing","Feeding","Nutrients","Fertilizer schedule"],
  light: ["Light","Light needs","Lighting","Sunlight"],
  soil: ["Soil","Potting mix","Soil & drainage","Growing medium"],
  tips: ["Tips","Care tips","Pro tips","Helpful notes"],
  pet: ["Pet Safety","Pets & toxicity","Pet-friendliness","Safety around pets"],
  weLove: ["What we love","Why it’s great","Highlights","Why people love it"],
  styling: ["Styling tips","Where it looks great","Design ideas","Display ideas"]
};

const proTips = [
  "Use a finger test or moisture meter before watering.",
  "Rotate the pot monthly for even growth.",
  "Dust leaves periodically to keep pores clear.",
  "Adjust watering in winter when growth slows.",
  "Ensure the pot has drainage holes.",
  "Group plants to increase ambient humidity.",
];

function humanizeCare(slug, fm, body) {
  const rand = mulberry32(hashCode(slug));
  const name = fm.title?.replace(/ Care Guide$/,'') || '';
  const tier = getTag(fm.tags,'care','standard');
  const light = getTag(fm.tags, null, 'medium');
  const sectionOrder = seededShuffle(rand, ["overview","watering","fertilizing","light","soil","pet","tips"]);

  const sec = {
    overview: `## ${seededChoice(rand, synonyms.overview)}
${name} is generally a **${tier}**-care plant. It tends to thrive in **${light}** light and appreciates a well-structured potting mix with good drainage.`,

    watering: `## ${seededChoice(rand, synonyms.watering)}
Let the top inch of soil dry between waterings. Frequency changes with season, pot size, and light. When in doubt, err slightly on the dry side.`,

    fertilizing: `## ${seededChoice(rand, synonyms.fertilizing)}
During active growth, apply a balanced, diluted fertilizer on a regular cadence. Ease off feeding in winter.`,

    light: `## ${seededChoice(rand, synonyms.light)}
Aim for **${light}** light. Avoid extremes unless this plant is known to tolerate them. Gradually acclimate to brighter light to prevent scorch.`,

    soil: `## ${seededChoice(rand, synonyms.soil)}
Use a **well-draining** potting mix and a container with drainage holes. Consider adding perlite or bark if your mix holds too much water.`,

    pet: `## ${seededChoice(rand, synonyms.pet)}
Always confirm pet safety for your specific plant. If in doubt, keep out of reach of curious pets.`,

    tips: `## ${seededChoice(rand, synonyms.tips)}
${seededShuffle(rand, proTips).slice(0, 3).map(t => `- ${t}`).join('\n')}`
  };

  const out = sectionOrder.map(k => sec[k]).join("\n\n");
  return withFrontmatter(fm, out);
}

function humanizeBlog(slug, fm, body) {
  const rand = mulberry32(hashCode(slug));
  const name = fm.title?.replace(/^Why /,'').replace(/ Belongs in Your Home$/,'') || '';
  const tier = getTag(fm.tags,'plant-spotlight','standard');
  const light = getTag(fm.tags, null, 'bright indirect');

  const titleVariant = seededChoice(rand, [
    `Why ${name} Deserves a Spot in Your Space`,
    `Bring ${name} Home: Here’s Why`,
    `${name}: A Lovely Addition to Your Home`,
    `Thinking of ${name}? Here’s Why It Works`
  ]);

  const intro = seededChoice(rand, [
    `Looking for a reliable houseplant? **${name}** is a strong contender.`,
    `If you want a plant that looks good and isn’t fussy, **${name}** fits the bill.`,
    `**${name}** blends style with simplicity, which is why so many plant lovers swear by it.`
  ]);

  const loveHdr = seededChoice(rand, synonyms.weLove);
  const styleHdr = seededChoice(rand, synonyms.styling);
  const tipLine = seededChoice(rand, proTips);

  const content = `# ${titleVariant}

${intro}

### ${loveHdr}
- Works in **${light}** light.
- Care tier: **${tier}**.
- Generally moderate watering needs (adjust to conditions).

### ${styleHdr}
Choose a pot that complements its foliage and place it where it gets **${light}** light.
  
> Pro tip: ${tipLine}
`;
  // Keep frontmatter, but swap title to our variant
  const newFM = { ...fm, title: titleVariant };
  return withFrontmatter(newFM, content);
}

function withFrontmatter(fm, body) {
  return matter.stringify(body.trim() + '\n', fm);
}
function getTag(tags, exclude, fallback) {
  const arr = Array.isArray(tags) ? tags : [];
  const pick = arr.find(t => t && t !== exclude);
  return pick || fallback;
}
function hashCode(str) { // deterministic seed
  let h=0, i, chr; if (str.length === 0) return h;
  for (i=0; i<str.length; i++) { chr=str.charCodeAt(i); h=((h<<5)-h)+chr; h|=0; }
  return Math.abs(h) || 1;
}

// ---- main
function processFolder(dir, kind) {
  if (!fs.existsSync(dir)) return { files: 0, changed: 0 };
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
  let changed = 0;
  for (const f of files) {
    const p = path.join(dir, f);
    const raw = fs.readFileSync(p, 'utf8');
    const parsed = matter(raw);
    const slug = parsed.data?.slug || f.replace(/\.md$/,'');
    const before = raw;
    let after = raw;

    if (kind === 'care') after = humanizeCare(slug, parsed.data, parsed.content);
    if (kind === 'blog') after = humanizeBlog(slug, parsed.data, parsed.content);

    if (after !== before) {
      fs.writeFileSync(p, after, 'utf8');
      changed++;
    }
  }
  return { files: files.length, changed };
}

(function run(){
  const r1 = processFolder(CARE_DIR, 'care');
  const r2 = processFolder(BLOG_DIR, 'blog');
  console.log({ care: r1, blog: r2 });
})();
