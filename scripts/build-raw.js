// Turns the downloaded IRS + Census files into per-state inputs for
// process-data.js:
//   raw/<st>/orgs.json        every org in the state's IRS Business Master File
//   raw/<st>/financials.json  that org's Form 990 / 990-EZ / 990-PF filings
//                             from the IRS SOI annual extracts
// Field names mirror ProPublica's API so process-data.js stays unchanged in spirit.

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { spawn } from 'child_process';
import { createInterface } from 'readline';
import { STATES, selectedStates, IRS_DIR, RAW_DIR } from './states.js';

// ---------- CSV helpers ----------
function parseCsvLine(line) {
  const out = [];
  let cur = '', q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) {
      if (c === '"') { if (line[i + 1] === '"') { cur += '"'; i++; } else q = false; }
      else cur += c;
    } else if (c === '"') q = true;
    else if (c === ',') { out.push(cur); cur = ''; }
    else cur += c;
  }
  out.push(cur);
  return out;
}
const cleanHeader = h => h.replace(/^﻿/, '').replace(/"/g, '').trim().toLowerCase();
const num = v => {
  if (v == null) return null;
  const s = String(v).trim();
  if (s === '') return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};

function readCsv(file) {
  const lines = readFileSync(file, 'latin1').split(/\r?\n/).filter(Boolean);
  const header = parseCsvLine(lines[0]).map(cleanHeader);
  return lines.slice(1).map(l => {
    const cells = parseCsvLine(l);
    const row = {};
    header.forEach((h, i) => { row[h] = cells[i]; });
    return row;
  });
}

// "SIOUX FALLS" -> "Sioux Falls" (matches how ProPublica displays IRS names)
function titleCase(s) {
  return (s || '').toLowerCase().replace(/(^|[\s\-\/(&.])([a-z])/g, (m, p, c) => p + c.toUpperCase()).trim();
}

// Normalize a place name so IRS city strings and Census place names line up.
function placeKey(s) {
  return (s || '').toUpperCase()
    .replace(/\s+(CITY|TOWN|VILLAGE|BOROUGH|CDP|MUNICIPALITY)$/, '')
    .replace(/\(BALANCE\)/, '')
    .replace(/[.']/g, '')
    .replace(/\bSAINT\b/g, 'ST').replace(/\bSAINTE\b/g, 'STE')
    .replace(/\bMOUNT\b/g, 'MT').replace(/\bFORT\b/g, 'FT')
    .replace(/\s+/g, ' ').trim();
}

export function tierForPop(pop) {
  if (pop == null) return 'R';
  if (pop >= 50000) return 'U';
  if (pop >= 10000) return 'M';
  if (pop >= 2500) return 'S';
  return 'R';
}

// ---------- Census populations ----------
function loadPlacePops(stateName) {
  const rows = readCsv(`${IRS_DIR}/census-places.csv`);
  const popCol = Object.keys(rows[0]).filter(k => k.startsWith('popestimate')).sort().pop();
  const pops = {};
  for (const r of rows) {
    if (r.stname !== stateName || r.sumlev !== '162') continue; // incorporated places
    const key = placeKey(r.name);
    const pop = num(r[popCol]);
    if (pop != null && (pops[key] == null || pop > pops[key])) pops[key] = pop;
  }
  return { pops, vintage: popCol.replace('popestimate', '') };
}

// ---------- Extract parsing ----------
const FORM = { f990: 0, ez: 1, pf: 2 };

function taxYear(taxPd) {
  // Year the accounting period ENDS (a June 2023 fiscal year-end -> 2023).
  // Same convention as ProPublica's tax_prd_yr, which the site used before,
  // so freshness buckets mean the same thing. (Verified on 2,593 SD orgs.)
  const s = String(taxPd || '').trim();
  if (!/^\d{6}$/.test(s)) return null;
  return Number(s.slice(0, 4));
}

function mapFiling(form, r) {
  const taxPd = r.tax_pd ?? r.taxpd ?? r.tax_prd;
  const base = { tax_prd: num(taxPd), tax_prd_yr: taxYear(taxPd), formtype: FORM[form] };
  if (form === 'f990') return {
    ...base,
    totrevenue: num(r.totrevenue), totfuncexpns: num(r.totfuncexpns),
    totassetsend: num(r.totassetsend), totliabend: num(r.totliabend),
    totnetassetend: num(r.totnetassetend), totcntrbgfts: num(r.totcntrbgfts),
    compnsatncurrofcr: num(r.compnsatncurrofcr), othrsalwages: num(r.othrsalwages),
  };
  if (form === 'ez') return {
    ...base,
    totrevenue: num(r.totrevnue), totfuncexpns: num(r.totexpns),
    totassetsend: num(r.totassetsend), totliabend: num(r.totliabend),
    totnetassetend: num(r.totnetassetsend), totcntrbgfts: num(r.totcntrbs),
    compnsatncurrofcr: null, othrsalwages: null,
  };
  // 990-PF: book-value revenue/expenses; net assets = assets - liabilities
  const assets = num(r.totassetsend), liab = num(r.totliabend);
  return {
    ...base,
    totrevenue: num(r.totrcptperbks), totfuncexpns: num(r.totexpnspbks),
    totassetsend: assets, totliabend: liab,
    totnetassetend: assets != null ? assets - (liab || 0) : null,
    totcntrbgfts: num(r.grscontrgifts), compnsatncurrofcr: num(r.compofficers), othrsalwages: null,
  };
}

async function scanExtract(entry, wanted, sink) {
  const proc = spawn('unzip', ['-p', entry.file]);
  const rl = createInterface({ input: proc.stdout, crlfDelay: Infinity });
  let header = null, einIdx = -1, kept = 0, rows = 0;
  for await (const line of rl) {
    if (!header) {
      header = parseCsvLine(line).map(cleanHeader);
      einIdx = header.indexOf('ein');
      if (einIdx < 0) throw new Error(`No EIN column in ${entry.file}`);
      continue;
    }
    rows++;
    // cheap EIN check before parsing the whole line
    const cells = line.split(',', einIdx + 1);
    const ein = (cells[einIdx] || '').replace(/"/g, '').trim().padStart(9, '0');
    if (!wanted.has(ein)) continue;
    const parsed = parseCsvLine(line);
    const r = {};
    header.forEach((h, i) => { r[h] = parsed[i]; });
    sink(ein, { ...mapFiling(entry.form, r), source_year: entry.year });
    kept++;
  }
  await new Promise((res, rej) => proc.on('close', code => code === 0 ? res() : rej(new Error(`unzip exited ${code} for ${entry.file}`))));
  console.log(`  ${entry.file}: ${rows.toLocaleString()} rows, ${kept.toLocaleString()} for our states`);
}

async function main() {
  const manifest = JSON.parse(readFileSync(`${IRS_DIR}/manifest.json`, 'utf-8'));
  const states = selectedStates();

  // Org lists from each state's Business Master File
  const orgsByState = {};
  const einState = new Map();
  for (const st of states) {
    const rows = readCsv(`${IRS_DIR}/eo_${st.toLowerCase()}.csv`);
    const { pops, vintage } = loadPlacePops(STATES[st].name);
    let matched = 0;
    orgsByState[st] = rows.map(r => {
      const ein = String(r.ein).padStart(9, '0');
      einState.set(ein, st);
      const pop = pops[placeKey(r.city)];
      if (pop != null) matched++;
      return {
        ein: Number(ein),
        name: titleCase(r.name),
        city: titleCase(r.city),
        state: st,
        ntee_code: (r.ntee_cd || '').trim() || null,
        subseccd: num(r.subsection),
        city_pop: pop ?? null,
        community: tierForPop(pop),
      };
    });
    console.log(`${st}: ${orgsByState[st].length.toLocaleString()} orgs in BMF; ${matched.toLocaleString()} matched to a Census ${vintage} place`);
    orgsByState[st]._census_vintage = vintage;
  }

  // Filings from the national annual extracts, keyed by EIN
  const filings = new Map(); // ein -> Map(tax_prd|form -> filing)
  const sink = (ein, f) => {
    if (!filings.has(ein)) filings.set(ein, new Map());
    const key = `${f.tax_prd}|${f.formtype}`;
    const prev = filings.get(ein).get(key);
    if (!prev || f.source_year >= prev.source_year) filings.get(ein).set(key, f); // later extract wins (amended/corrected)
  };
  const wanted = new Set(einState.keys());
  const entries = [...manifest.extracts].sort((a, b) => a.year - b.year);
  for (const e of entries) await scanExtract(e, wanted, sink);

  for (const st of states) {
    const dir = `${RAW_DIR}/${st.toLowerCase()}`;
    mkdirSync(dir, { recursive: true });
    const vintage = orgsByState[st]._census_vintage;
    const orgs = orgsByState[st];
    const fin = {};
    for (const o of orgs) {
      const ein = String(o.ein).padStart(9, '0');
      const f = filings.get(ein);
      if (f) fin[o.ein] = { filings: [...f.values()].sort((a, b) => a.tax_prd - b.tax_prd) };
    }
    const sources = {
      bmf: manifest.bmf[st],
      extracts: manifest.extracts.map(({ year, form, url, last_modified }) => ({ year, form, url, last_modified })),
      census: { ...manifest.census, vintage },
    };
    writeFileSync(`${dir}/orgs.json`, JSON.stringify({ fetched_at: manifest.fetched_at, total: orgs.length, sources, organizations: orgs }));
    writeFileSync(`${dir}/financials.json`, JSON.stringify({ fetched_at: manifest.fetched_at, total: Object.keys(fin).length, organizations: fin }));
    console.log(`${st}: wrote ${orgs.length.toLocaleString()} orgs, ${Object.keys(fin).length.toLocaleString()} with at least one filing -> ${dir}/`);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
