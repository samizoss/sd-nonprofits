import { execSync } from 'child_process';

const steps = [
  { name: 'Fetch organizations', cmd: 'node scripts/fetch-orgs.js' },
  { name: 'Fetch financial details', cmd: 'node scripts/fetch-financials.js' },
  { name: 'Process dashboard data', cmd: 'node scripts/process-data.js' },
];

for (const step of steps) {
  console.log(`\n=== ${step.name} ===\n`);
  execSync(step.cmd, { stdio: 'inherit' });
}

console.log('\nPipeline complete!');
