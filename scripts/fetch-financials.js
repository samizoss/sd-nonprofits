import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'fs';
import { fetchJson } from './http.js';

const API_BASE = 'https://projects.propublica.org/nonprofits/api/v2';
const INPUT = 'raw/orgs.json';
const OUTPUT = 'raw/financials.json';
const DELAY_MS = 300;
const BATCH_SAVE_EVERY = 100;

async function fetchOrg(ein) {
  const url = `${API_BASE}/organizations/${ein}.json`;
  return fetchJson(url);
}

async function main() {
  if (!existsSync(INPUT)) {
    console.error(`${INPUT} not found. Run fetch-orgs.js first.`);
    process.exit(1);
  }

  const orgsData = JSON.parse(readFileSync(INPUT, 'utf-8'));
  const orgs = orgsData.organizations;

  // Resume: load existing progress
  let results = {};
  if (existsSync(OUTPUT)) {
    const existing = JSON.parse(readFileSync(OUTPUT, 'utf-8'));
    results = existing.organizations || {};
    console.log(`Resuming: ${Object.keys(results).length} already fetched`);
  }

  const toFetch = orgs.filter(o => !results[o.ein]);
  console.log(`Fetching details for ${toFetch.length} orgs (${Object.keys(results).length} cached)...`);

  for (let i = 0; i < toFetch.length; i++) {
    const org = toFetch[i];
    if (i % 100 === 0 && i > 0) console.log(`  ${i}/${toFetch.length}...`);

    await new Promise(r => setTimeout(r, DELAY_MS));
    const detail = await fetchOrg(org.ein);
    if (detail) {
      const o = detail.organization;
      const filings = detail.filings_with_data || [];
      results[org.ein] = {
        ein: org.ein,
        name: o.name,
        city: o.city,
        state: o.state,
        ntee_code: o.ntee_code,
        subseccd: o.subseccd,
        income_amount: o.income_amount,
        revenue_amount: o.revenue_amount,
        asset_amount: o.asset_amount,
        filings: filings.map(f => ({
          tax_prd_yr: f.tax_prd_yr,
          formtype: f.formtype,
          totrevenue: f.totrevenue,
          totfuncexpns: f.totfuncexpns,
          totassetsend: f.totassetsend,
          totliabend: f.totliabend,
          totnetassetend: f.totnetassetend,
          totcntrbgfts: f.totcntrbgfts,
          compnsatncurrofcr: f.compnsatncurrofcr,
          othrsalwages: f.othrsalwages,
        })),
      };
    }

    // Periodic save for resume support
    if ((i + 1) % BATCH_SAVE_EVERY === 0) {
      writeFileSync(OUTPUT, JSON.stringify({
        fetched_at: new Date().toISOString(),
        total: Object.keys(results).length,
        organizations: results
      }, null, 2));
    }
  }

  // Final save
  writeFileSync(OUTPUT, JSON.stringify({
    fetched_at: new Date().toISOString(),
    total: Object.keys(results).length,
    organizations: results
  }, null, 2));
  console.log(`Done. ${Object.keys(results).length} orgs with details saved to ${OUTPUT}`);
}

main().catch(err => { console.error(err); process.exit(1); });
