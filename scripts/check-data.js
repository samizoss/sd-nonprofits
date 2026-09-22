// Publish guard: compares each state's freshly built data with the version
// currently committed. If counts collapse (a bad download, an IRS outage),
// exit non-zero so the workflow stops BEFORE committing: the live sites keep
// last week's data and GitHub emails a failure notice instead.
import { readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { selectedStates } from './states.js';

const MAX_DROP = 0.10; // normal churn is a few percent; block anything over 10%
const problems = [];

for (const st of selectedStates()) {
  const file = `src/data/${st.toLowerCase()}.json`;
  if (!existsSync(file)) { problems.push(`${st}: ${file} was not built.`); continue; }
  const next = JSON.parse(readFileSync(file, 'utf-8'));
  if (!next.overview?.total_orgs || !next.orgs?.length) { problems.push(`${st}: new data is empty or malformed.`); continue; }

  let prev = null;
  try { prev = JSON.parse(execSync(`git show HEAD:${file}`, { maxBuffer: 512 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] }).toString()); }
  catch { console.log(`${st}: no committed baseline yet; skipping comparison.`); continue; }

  for (const key of ['total_orgs', 'with_financials']) {
    const before = prev.overview?.[key], after = next.overview[key];
    if (typeof before !== 'number' || before === 0) continue;
    const change = (after - before) / before;
    console.log(`${st} ${key}: ${before} -> ${after} (${(change * 100).toFixed(1)}%)`);
    if (change < -MAX_DROP) problems.push(`${st} ${key} dropped ${(-change * 100).toFixed(1)}% (${before} -> ${after}).`);
  }
}

if (problems.length) {
  console.error('\nNot publishing — data failed the safety check:');
  for (const p of problems) console.error(`  - ${p}`);
  console.error('\nIf a drop is real, run the workflow manually with the "Publish even if counts dropped" box checked.');
  process.exit(1);
}
console.log('Safety check passed.');
