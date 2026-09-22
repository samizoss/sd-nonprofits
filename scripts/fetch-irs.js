// Downloads every public source file the dashboard is built from and records
// exactly what was downloaded (URL, size, Last-Modified) in raw/irs/manifest.json
// so each published number can be traced back to a specific IRS/Census file.
//
//  1. IRS Exempt Organizations Business Master File, one CSV per state
//     (the org list; IRS refreshes it roughly monthly)
//  2. IRS SOI Annual Extracts of Form 990 / 990-EZ / 990-PF financial data
//     (national files, one set per calendar year the returns were processed)
//  3. Census Bureau city/town population estimates (community-size tiers)

import { createWriteStream, mkdirSync, existsSync, statSync, writeFileSync } from 'fs';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import { selectedStates, IRS_DIR } from './states.js';

const IRS = 'https://www.irs.gov/pub/irs-soi';

// File names as linked on the IRS SOI page (the naming is not consistent year
// to year). https://www.irs.gov/statistics/soi-tax-stats-annual-extract-of-tax-exempt-organization-financial-data
const KNOWN_EXTRACTS = {
  2018: { f990: '18eoextract990.zip', ez: '18eoextractez.zip' },
  2019: { f990: '19eoextract990.zip' }, // IRS's 2019 990-EZ link is dead (404)
  2020: { f990: '20eoextract990.zip', ez: '20eoextractez.zip', pf: '20eoextract990pf.zip' },
  2021: { f990: '21eoextract990.zip', ez: '21eoextractez.zip', pf: '21eoextract990pf.zip' },
  2022: { f990: '22eoextract990.zip', ez: '22eoextractez.zip', pf: '22eoextract990pf.zip' },
  2023: { f990: '23eoextract990.zip', ez: '23eoextractez.zip', pf: '23eoextract990pf.zip' },
  2024: { f990: '24eoextract990.zip', ez: '24eoextract990EZ.zip', pf: '24eoextract990pf.zip' },
};
const NAME_VARIANTS = {
  f990: yy => [`${yy}eoextract990.zip`],
  ez: yy => [`${yy}eoextract990EZ.zip`, `${yy}eoextractez.zip`, `${yy}eoextract990ez.zip`],
  pf: yy => [`${yy}eoextract990pf.zip`, `${yy}eoextract990PF.zip`],
};

const CENSUS_CANDIDATES = [2026, 2025, 2024].map(v =>
  `https://www2.census.gov/programs-surveys/popest/datasets/2020-${v}/cities/totals/sub-est${v}.csv`);

async function head(url) {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return res.ok ? res : null;
  } catch { return null; }
}

async function download(url, dest, attempts = 4) {
  for (let i = 1; i <= attempts; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await pipeline(Readable.fromWeb(res.body), createWriteStream(dest));
      const size = statSync(dest).size;
      if (size === 0) throw new Error('empty file');
      return { url, file: dest, bytes: size, last_modified: res.headers.get('last-modified') };
    } catch (err) {
      if (i === attempts) throw new Error(`Download failed: ${url} (${err.message})`);
      console.warn(`  retry ${i} for ${url}: ${err.message}`);
      await new Promise(r => setTimeout(r, 2000 * i));
    }
  }
}

async function discoverNewYears() {
  const years = { ...KNOWN_EXTRACTS };
  const latest = Math.max(...Object.keys(years).map(Number));
  for (let y = latest + 1; y <= latest + 2; y++) {
    const yy = String(y).slice(-2);
    const found = {};
    for (const [form, variants] of Object.entries(NAME_VARIANTS)) {
      for (const name of variants(yy)) {
        if (await head(`${IRS}/${name}`)) { found[form] = name; break; }
      }
    }
    if (found.f990) {
      console.log(`Found a newer IRS extract year: ${y}`, found);
      years[y] = found;
    }
  }
  return years;
}

async function main() {
  mkdirSync(IRS_DIR, { recursive: true });
  const manifest = { fetched_at: new Date().toISOString(), bmf: {}, extracts: [], census: null };

  // 1. Business Master File per state
  for (const st of selectedStates()) {
    const url = `${IRS}/eo_${st.toLowerCase()}.csv`;
    console.log(`BMF ${st}: ${url}`);
    manifest.bmf[st] = await download(url, `${IRS_DIR}/eo_${st.toLowerCase()}.csv`);
  }

  // 2. Annual financial extracts (national; filtered to our states later)
  const years = await discoverNewYears();
  for (const [year, forms] of Object.entries(years)) {
    for (const [form, name] of Object.entries(forms)) {
      const dest = `${IRS_DIR}/${name}`;
      const url = `${IRS}/${name}`;
      if (existsSync(dest) && statSync(dest).size > 0) {
        const res = await head(url);
        manifest.extracts.push({ year: Number(year), form, url, file: dest, bytes: statSync(dest).size, last_modified: res?.headers.get('last-modified') ?? null });
        continue;
      }
      console.log(`Extract ${year} ${form}: ${url}`);
      try {
        manifest.extracts.push({ year: Number(year), form, ...(await download(url, dest)) });
      } catch (err) {
        console.warn(`  skipped: ${err.message}`);
      }
    }
  }
  if (!manifest.extracts.some(e => e.form === 'f990')) throw new Error('No Form 990 extracts downloaded.');

  // 3. Census population estimates (newest vintage available)
  for (const url of CENSUS_CANDIDATES) {
    if (await head(url)) {
      console.log(`Census: ${url}`);
      manifest.census = await download(url, `${IRS_DIR}/census-places.csv`);
      break;
    }
  }
  if (!manifest.census) throw new Error('Census city population file not found.');

  writeFileSync(`${IRS_DIR}/manifest.json`, JSON.stringify(manifest, null, 2));
  console.log(`Done. ${manifest.extracts.length} extract files, ${Object.keys(manifest.bmf).length} state BMF files.`);
}

main().catch(err => { console.error(err); process.exit(1); });
