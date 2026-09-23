// Local convenience: runs the same steps as the weekly GitHub Action.
//   node scripts/run-pipeline.js            (all states)
//   STATES=MN node scripts/run-pipeline.js  (one state)
import { execSync } from 'child_process';
import { selectedStates } from './states.js';

const run = (name, cmd, env = {}) => {
  console.log(`\n=== ${name} ===\n`);
  execSync(cmd, { stdio: 'inherit', env: { ...process.env, ...env } });
};
run('Download IRS and Census source files', 'node scripts/fetch-irs.js');
run('Build per-state inputs', 'node scripts/build-raw.js');
for (const st of selectedStates()) run(`Process ${st}`, 'node scripts/process-data.js', { STATE: st });
run('Safety check', 'node scripts/check-data.js');
console.log('\nPipeline complete!');
