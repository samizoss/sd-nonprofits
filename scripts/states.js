// States this dashboard is built for. Adding a state = one line here plus a
// Vercel project with VITE_STATE set to its code.
export const STATES = {
  SD: { name: 'South Dakota', fips: '46' },
  MN: { name: 'Minnesota', fips: '27' },
};

// Which states a pipeline run builds: STATES env var ("SD,MN"), default all.
export function selectedStates() {
  const list = (process.env.STATES || Object.keys(STATES).join(','))
    .split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
  for (const st of list) if (!STATES[st]) throw new Error(`Unknown state "${st}". Add it to scripts/states.js.`);
  return list;
}

export const RAW_DIR = 'raw';
export const IRS_DIR = 'raw/irs';
