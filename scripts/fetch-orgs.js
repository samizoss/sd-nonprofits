import { writeFileSync, mkdirSync } from 'fs';
import { fetchJson } from './http.js';

const API_BASE = 'https://projects.propublica.org/nonprofits/api/v2';
const STATE = process.env.STATE || 'SD';
const SEARCH_CAP = 10000; // ProPublica search returns at most 400 pages x 25
const DELAY_MS = 500;
const OUTPUT = 'raw/orgs.json';

async function fetchPage(page) {
  const url = `${API_BASE}/search.json?state%5Bid%5D=${STATE}&page=${page}`;
  const data = await fetchJson(url);
  if (!data) throw new Error(`No data on page ${page}`);
  return data;
}

async function main() {
  mkdirSync('raw', { recursive: true });

  console.log(`Fetching all ${STATE} organizations from ProPublica...`);
  const first = await fetchPage(0);
  const totalPages = first.num_pages;
  const totalResults = first.total_results;
  console.log(`Total: ${totalResults} orgs across ${totalPages} pages`);
  if (totalResults >= SEARCH_CAP) {
    throw new Error(`${STATE} has ${totalResults}+ orgs, which hits ProPublica's ${SEARCH_CAP}-result search cap. ` +
      `The org list would be incomplete; switch this state to the IRS EO BMF file (eo_${STATE.toLowerCase()}.csv).`);
  }

  const allOrgs = [...first.organizations];

  for (let page = 1; page < totalPages; page++) {
    if (page % 50 === 0) console.log(`  Page ${page}/${totalPages}...`);
    await new Promise(r => setTimeout(r, DELAY_MS));
    const data = await fetchPage(page);
    allOrgs.push(...data.organizations);
  }

  console.log(`Fetched ${allOrgs.length} organizations`);
  writeFileSync(OUTPUT, JSON.stringify({
    fetched_at: new Date().toISOString(),
    total: allOrgs.length,
    organizations: allOrgs
  }, null, 2));
  console.log(`Saved to ${OUTPUT}`);
}

main().catch(err => { console.error(err); process.exit(1); });
