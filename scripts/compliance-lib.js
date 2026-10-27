// Pure logic for the Compliance Guide build. No file or network access here,
// so it can be tested directly (see compliance-lib.test.js).

export const VERIFIED_LABELS = {
  primary: 'Checked against the original text',
  secondary: 'Summarized from professional sources',
};

function toDate(v) {
  if (v == null) return null;
  const s = v instanceof Date ? v.toISOString().slice(0, 10) : String(v).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
}

/** A page publishes only when marked publish: true and none of its citations is pending. */
export function publishProblems(fm) {
  if (fm.publish !== true) return ['not marked publish: true'];
  const problems = [];
  for (const c of fm.citations || []) {
    if (c.verified === 'pending') problems.push(`pending citation: ${c.ref}`);
    else if (!VERIFIED_LABELS[c.verified]) problems.push(`unknown verification level on ${c.ref}`);
  }
  for (const k of ['summary', 'ask_your_pro', 'steps']) if (!fm[k] || (Array.isArray(fm[k]) && !fm[k].length)) problems.push(`missing ${k}`);
  return problems;
}

/**
 * A page is under review when any source it cites has an open flag dated after
 * both that source's last_verified and the page's last_verified.
 * Returns null, or { date, sources: [{ id, title, flagged, reason }] } with the earliest date.
 */
export function underReview(fm, sourcesById, flags) {
  const pageLv = toDate(fm.last_verified);
  const hits = [];
  for (const id of fm.cites || []) {
    const f = flags[id];
    const src = sourcesById[id];
    if (!f || !src) continue;
    const flagged = toDate(f.flagged);
    const srcLv = toDate(src.last_verified);
    if (!flagged) continue;
    if (srcLv && srcLv >= flagged) continue;
    if (pageLv && pageLv >= flagged) continue;
    hits.push({ id, title: src.title, flagged, reason: f.reason || '' });
  }
  if (!hits.length) return null;
  hits.sort((a, b) => a.flagged.localeCompare(b.flagged));
  return { date: hits[0].flagged, sources: hits };
}

/** Split markdown into sections keyed by "## " headings. */
export function splitSections(md) {
  const out = [];
  let cur = { heading: null, lines: [] };
  for (const line of md.split('\n')) {
    const m = /^## (.+)$/.exec(line);
    if (m) {
      out.push(cur);
      cur = { heading: m[1].trim(), lines: [] };
    } else cur.lines.push(line);
  }
  out.push(cur);
  return out;
}

/** Parse the rows of the first markdown table in a block of text. */
export function parseTable(text) {
  const rows = text.split('\n').filter(l => /^\|.*\|\s*$/.test(l.trim()));
  if (rows.length < 2) return [];
  const cells = r => r.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
  const head = cells(rows[0]);
  return rows.slice(2).map(r => Object.fromEntries(cells(r).map((c, i) => [head[i] || `col${i}`, c])));
}

/** Drop table rows whose last cell says "pending" (unverified values stay off the public site). */
export function dropPendingRows(md) {
  return md
    .split('\n')
    .filter(l => !(/^\|/.test(l.trim()) && /\|\s*pending\s*\|\s*$/i.test(l)))
    .join('\n');
}

/**
 * Turn repo-internal references into in-site links:
 *   `sponsorships.md`        -> link to that guide page
 *   `volatile-values.md`     -> link to Key numbers
 *   `form-8282` (a row id)   -> link to that row on Key numbers
 */
export function linkInternalRefs(md, pageTitles, rowIds) {
  return md.replace(/`([a-z0-9-]+)(\.md)?`/g, (whole, name, ext) => {
    if (ext && name === 'volatile-values') return '[Key numbers](#guide/key-numbers)';
    if (ext && pageTitles[name]) return `[${pageTitles[name]}](#guide/${name})`;
    if (!ext && rowIds.has(name)) return `[${name}](#guide/key-numbers/${name})`;
    return whole;
  });
}

export function stripTags(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim();
}

export function flattenSteps(steps) {
  const out = [];
  for (const s of steps || []) {
    if (typeof s === 'string') out.push(s);
    else {
      out.push(s.text);
      out.push(...flattenSteps(s.sub));
    }
  }
  return out;
}
