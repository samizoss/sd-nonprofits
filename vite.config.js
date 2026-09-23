import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';

// One codebase, one site per state. Each Vercel project sets VITE_STATE
// (SD, MN, ...) and gets only that state's data in its bundle.
const STATE = (process.env.VITE_STATE || 'SD').toLowerCase();
const NAMES = { sd: 'South Dakota', mn: 'Minnesota' };
const NAME = NAMES[STATE];
if (!NAME) throw new Error(`Unknown VITE_STATE "${STATE}". Add it to vite.config.js and scripts/states.js.`);

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'state-html',
      transformIndexHtml: html => html.replaceAll('%STATE_NAME%', NAME),
    },
  ],
  resolve: {
    alias: {
      '@state-data': fileURLToPath(new URL(`./src/data/${STATE}.json`, import.meta.url)),
    },
  },
  build: { chunkSizeWarningLimit: 8000 },
});
