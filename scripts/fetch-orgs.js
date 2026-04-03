import { writeFileSync, mkdirSync } from 'fs';

const API_BASE = 'https://projects.propublica.org/nonprofits/api/v2';
const STATE = 'SD';
const DELAY_MS = 500;
const OUTPUT = 'raw/orgs.json';

async function fetchPage(page) {
  const url = `${API_BASE}/search.json?state%5Bid%5D=${STATE}&page=${page}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} on page ${page}`);
  return res.json();
}

async function main() {
  mkdirSync('raw', { recursive: true });

  console.log(`Fetching all ${STATE} organizations from ProPublica...`);
  const first = await fetchPage(0);
  const totalPages = first.num_pages;
  const totalResults = first.total_results;
  console.log(`Total: ${totalResults} orgs across ${totalPages} pages`);

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
