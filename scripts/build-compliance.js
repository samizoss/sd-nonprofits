// Builds src/data/compliance.json from the compliance/ folder (the guide's single source of truth).
//
//   node scripts/build-compliance.js          write src/data/compliance.json
//   node scripts/build-compliance.js --check  fail if the committed JSON is out of date
//
// `npm run build` runs this before vite. The output is also committed, so a plain
// `npx vite build` (as in the weekly data workflow) still works.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import { marked } from 'marked';
import {
  VERIFIED_LABELS, publishProblems, underReview, splitSections, parseTable,
  dropPendingRows, linkInternalRefs, stripTags, flattenSteps,
} from './compliance-lib.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const C = path.join(ROOT, 'compliance');
const OUT = path.join(ROOT, 'src', 'data', 'compliance.json');

const read = f => fs.readFileSync(path.join(C, f), 'utf8');
const readJson = (f, dflt) => (fs.existsSync(path.join(C, f)) ? JSON.parse(read(f)) : dflt);

function frontMatter(text) {
  const m = /^---\n([\s\S]*?)\n---\n/.exec(text);
  if (!m) return { fm: {}, body: text };
  return { fm: YAML.parse(m[1]) || {}, body: text.slice(m[0].length) };
}

function render(md) {
  let html = marked.parse(md, { gfm: true });
  // Page titles are h2 on the site, so body headings drop one level.
  html = html.replace(/<(\/?)h3/g, '<$1h4').replace(/<(\/?)h2/g, '<$1h3');
  html = html.replace(/<table>/g, '<div class="table-wrap" tabindex="0" role="region" aria-label="Table"><table>').replace(/<\/table>/g, '</table></div>');
  return html;
}

const iso = v => (v instanceof Date ? v.toISOString().slice(0, 10) : v == null ? null : String(v));

// ------------------------------------------------------------------ inputs
const sourcesList = YAML.parse(read('sources.yaml')).sources;
const sourcesById = Object.fromEntries(sourcesList.map(s => [s.id, s]));
const flags = readJson('state/flags.json', {});

const vvRaw = frontMatter(read('volatile-values.md'));
const rowIds = new Set([...vvRaw.body.matchAll(/<a id="([a-z0-9-]+)"><\/a>/g)].map(m => m[1]));

const files = fs.readdirSync(path.join(C, 'decisions')).filter(f => f.endsWith('.md') && !f.startsWith('_')).sort();
const parsed = files.map(f => ({ slug: f.replace(/\.md$/, ''), ...frontMatter(read(`decisions/${f}`)) }));
const pageTitles = Object.fromEntries(parsed.map(p => [p.slug, p.fm.title]));

// ------------------------------------------------------------------ decision pages
const pages = [];
const skipped = [];
const pinLogs = [];
const ORDER = ['contribution-vs-exchange', 'conditional-vs-unconditional', 'restricted-vs-unrestricted', 'in-kind-gifts', 'quid-pro-quo-and-events', 'sponsorships', 'gaap-vs-fundraising-counting'];

for (const { slug, fm, body } of parsed) {
  const problems = publishProblems(fm);
  if (problems.length) {
    skipped.push({ slug, problems });
    continue;
  }
  const sections = splitSections(body);
  const kept = [];
  for (const s of sections) {
    if (s.heading === 'Pin log') {
      for (const r of parseTable(s.lines.join('\n'))) pinLogs.push({ page: slug, title: fm.title, date: r.Date, change: r['What changed'], source: r.Source });
      continue;
    }
    if (/^Decision tree/i.test(s.heading || '')) continue; // replaced by the text steps from front matter
    const lines = s.heading === null ? s.lines.filter(l => !/^# /.test(l)) : s.lines;
    kept.push((s.heading ? `## ${s.heading}\n` : '') + lines.join('\n'));
  }
  // Any remaining mermaid blocks are dropped; the text steps are the accessible version.
  const md = linkInternalRefs(kept.join('\n').replace(/```mermaid[\s\S]*?```\n?/g, ''), pageTitles, rowIds);
  const html = render(md);
  const cited = (fm.cites || []).map(id => sourcesById[id]).filter(Boolean);
  pages.push({
    slug,
    title: fm.title,
    question: fm.question,
    summary: fm.summary,
    askYourPro: fm.ask_your_pro,
    steps: fm.steps,
    lastVerified: iso(fm.last_verified),
    citations: (fm.citations || []).map(c => ({ ref: c.ref, covers: c.covers, label: VERIFIED_LABELS[c.verified] })),
    sources: cited.map(s => ({ id: s.id, title: s.title, version: s.stable_id, url: s.live_url, lastVerified: iso(s.last_verified), label: VERIFIED_LABELS[s.verified] || null })),
    underReview: underReview({ ...fm, last_verified: iso(fm.last_verified) }, Object.fromEntries(cited.map(s => [s.id, { ...s, last_verified: iso(s.last_verified) }])), flags),
    html,
    search: [fm.title, fm.question, fm.summary, ...(fm.ask_your_pro || []), ...flattenSteps(fm.steps), stripTags(html)].join(' ').toLowerCase(),
  });
}
pages.sort((a, b) => (ORDER.indexOf(a.slug) + 1 || 99) - (ORDER.indexOf(b.slug) + 1 || 99));

// ------------------------------------------------------------------ key numbers
let vvMd = dropPendingRows(vvRaw.body).replace(/^# .*\n/m, '');
vvMd = linkInternalRefs(vvMd, pageTitles, new Set());
const keyNumbersHtml = render(vvMd);

// ------------------------------------------------------------------ changes and flags
const changelogHtml = render(frontMatter(read('CHANGELOG.md')).body.replace(/^# .*\n/m, '').replace(/^Rule changes.*\n/m, ''));
const pageBySource = {};
for (const p of pages) for (const s of p.sources) (pageBySource[s.id] ||= []).push({ slug: p.slug, title: p.title });
const openFlags = Object.entries(flags)
  .map(([id, f]) => ({ id, title: sourcesById[id]?.title || id, flagged: iso(f.flagged), reason: f.reason || '', pages: pageBySource[id] || [] }))
  .filter(f => {
    const lv = iso(sourcesById[f.id]?.last_verified);
    return !(lv && f.flagged && lv >= f.flagged);
  })
  .sort((a, b) => b.flagged.localeCompare(a.flagged));
pinLogs.sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));

const lastVerified = pages.map(p => p.lastVerified).sort().at(-1) || null;

const out = {
  lastVerified,
  pages,
  keyNumbers: { html: keyNumbersHtml, search: stripTags(keyNumbersHtml).toLowerCase() },
  changes: { changelogHtml, pinLogs, openFlags },
};

const json = JSON.stringify(out, null, 1) + '\n';
if (process.argv.includes('--check')) {
  const current = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
  if (current !== json) {
    console.error('src/data/compliance.json is out of date. Run: node scripts/build-compliance.js');
    process.exit(1);
  }
  console.log('compliance.json is up to date');
} else {
  fs.writeFileSync(OUT, json);
  console.log(`compliance: ${pages.length} pages published, ${skipped.length} held back, ${openFlags.length} open flags`);
}
for (const s of skipped) console.log(`  held back ${s.slug}: ${s.problems.join('; ')}`);
