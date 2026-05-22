import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const TOOLS_DIR = String.raw`C:\Users\裕実子\yumi-Labs\src\pages\tools`;

// id:19-45 slugs
const FILES = [
  'kaigo-check',       // id:19 — uses <h1 class="tool-title">
  'family-tree',       // id:20 — text-2xl
  'twitter-analytics', // id:21 — text-2xl
  'vertical-text-image', // id:22 — text-2xl
  'podcast-show-notes',  // id:23 — text-2xl
  'youtube-thumbnail-preview', // id:24 — text-2xl
  'doujin-colophon',   // id:25 — text-3xl
  'fan-letter',        // id:26 — text-3xl
  'insta-9grid',       // id:27 — text-3xl
  'haiku-image',       // id:28 — text-3xl
  'nijisousaku-tags',  // id:29 — text-3xl
  'stream-title',      // id:30 — text-3xl
  'font-combo',        // id:31 — text-3xl
  'handle-check',      // id:32 — text-3xl
  'manga-panels',      // id:33 — text-3xl
  'character-sheet',   // id:34 — may differ
  'goods-size-preview',// id:35 — text-3xl
  'event-schedule',    // id:36 — text-3xl
  'vtuber-announce',   // id:37 — text-3xl
  'bpm-calculator',    // id:38
  'cosplay-spots',     // id:39 — text-3xl
  'stream-roulette',   // id:40 — text-3xl
  'book-tracker',      // id:41
  'vocab-forgetting-curve', // id:42 — text-3xl
  'hello-world-tour',  // id:43 — text-3xl
  'philosopher-chat',  // id:44 — text-3xl
  'csv-quiz',          // id:45 — text-3xl
];

// Replacement style — matches fountain-pen-diary (id:100) title
const TITLE_STYLE = `font-size:1.8rem;font-weight:800;color:var(--gray-0);margin-bottom:0.3rem`;

let success = 0, unchanged = 0;

for (const slug of FILES) {
  const filepath = join(TOOLS_DIR, slug + '.astro');
  if (!existsSync(filepath)) {
    console.log(`SKIP (not found): ${slug}`);
    continue;
  }

  let content = readFileSync(filepath, 'utf8');
  let modified = false;

  // Pattern 1: <h1 class="tool-title"> ... </h1>  →  <div class="tool-title"> ... </div>
  // (The .tool-title CSS already sets font-size:1.8rem, but h1 is overridden by global.css)
  if (content.includes('<h1 class="tool-title">')) {
    content = content.replace(/<h1 class="tool-title">/g, '<div class="tool-title">');
    content = content.replace(/<\/h1>/g, '</div>');
    console.log(`  [h1→div] ${slug}`);
    modified = true;
  }

  // Pattern 2: <div class="text-2xl font-bold text-gray-900"> (light bg variant)
  if (content.includes('class="text-2xl font-bold text-gray-900"')) {
    content = content.replace(
      /class="text-2xl font-bold text-gray-900"/g,
      `style="${TITLE_STYLE}"`
    );
    console.log(`  [text-2xl] ${slug}`);
    modified = true;
  }

  // Pattern 3: <div class="text-3xl font-bold text-white mb-2"> (dark bg variant)
  if (content.includes('class="text-3xl font-bold text-white mb-2"')) {
    content = content.replace(
      /class="text-3xl font-bold text-white mb-2"/g,
      `style="${TITLE_STYLE}"`
    );
    console.log(`  [text-3xl] ${slug}`);
    modified = true;
  }

  // Pattern 4: any other text-Nxl bold variants just in case
  const tailwindTitleRe = /class="text-(?:2xl|3xl|4xl|5xl) font-bold[^"]*"/g;
  if (tailwindTitleRe.test(content)) {
    content = content.replace(tailwindTitleRe, `style="${TITLE_STYLE}"`);
    console.log(`  [tailwind-other] ${slug}`);
    modified = true;
  }

  if (modified) {
    writeFileSync(filepath, content, 'utf8');
    success++;
    console.log(`OK: ${slug}`);
  } else {
    console.log(`UNCHANGED: ${slug} — check manually`);
    unchanged++;
  }
}

console.log(`\nDone: ${success} fixed, ${unchanged} unchanged`);
