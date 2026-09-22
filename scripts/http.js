// Shared fetch helper: retries rate limits (429), server errors (5xx) and
// network failures with exponential backoff, so a brief ProPublica hiccup
// doesn't silently drop organizations from the dataset.
// Returns parsed JSON, or null for a real "not found" (404).

const MAX_ATTEMPTS = 6;

export async function fetchJson(url) {
  let lastErr;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'sd-nonprofits-dashboard (github.com/samizoss/sd-nonprofits)' } });
      if (res.ok) return await res.json();
      if (res.status === 404) return null;
      if (res.status === 429 || res.status >= 500) {
        lastErr = new Error(`HTTP ${res.status}`);
      } else {
        throw new Error(`HTTP ${res.status} (not retryable) for ${url}`);
      }
    } catch (err) {
      if (err.message.includes('not retryable')) throw err;
      lastErr = err;
    }
    if (attempt === MAX_ATTEMPTS) break;
    const wait = Math.min(60000, 1000 * 2 ** attempt);
    console.warn(`  retry ${attempt}/${MAX_ATTEMPTS - 1} in ${wait / 1000}s — ${lastErr.message} — ${url}`);
    await new Promise(r => setTimeout(r, wait));
  }
  throw new Error(`Gave up after ${MAX_ATTEMPTS} attempts: ${url} (${lastErr?.message})`);
}
