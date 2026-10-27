import { useEffect, useMemo, useRef, useState } from 'react';
import guide from '../data/compliance.json';
import { MAINTAINER, ISSUES_URL, SOURCE_FOLDER_URL, NOT_ADVICE } from './config';

const NOTICE_KEY = 'compliance-guide-notice-dismissed';

export function fmtDay(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function readStorage(key) {
  try { return window.localStorage.getItem(key); } catch { return null; }
}
function writeStorage(key, value) {
  try { window.localStorage.setItem(key, value); } catch { /* storage unavailable; notice just shows again */ }
}

const link = 'text-[#1b4965] underline underline-offset-2 hover:text-[#0f2f42] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1b4965] rounded-sm';

/* ------------------------------------------------------------------ shared pieces */

function FirstVisitNotice() {
  const [open, setOpen] = useState(() => readStorage(NOTICE_KEY) !== '1');
  if (!open) return null;
  return (
    <div role="note" aria-labelledby="guide-notice-title" className="guide-notice mb-6 rounded-lg border border-[#1b4965]/30 bg-[#1b4965]/5 p-4 text-sm text-slate-700">
      <div className="flex gap-4 items-start justify-between">
        <div>
          <p id="guide-notice-title" className="font-semibold text-slate-900">Before you use this guide</p>
          <p className="mt-1">
            This guide summarizes and links to IRS, accounting-standard, and federal grant rules. It is general information,
            not legal, tax, or accounting advice, and it can't account for your organization's facts. Confirm with your own
            accountant or attorney before acting. See the <a className={link} href="#guide/terms">Terms of use</a>.
          </p>
        </div>
        <button
          type="button"
          onClick={() => { writeStorage(NOTICE_KEY, '1'); setOpen(false); }}
          className="shrink-0 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1b4965]"
        >
          I understand
        </button>
      </div>
    </div>
  );
}

function ReviewBanner({ review }) {
  if (!review) return null;
  return (
    <div role="alert" className="review-banner mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
      <p className="font-semibold">Under review</p>
      <p className="mt-1">
        The source behind this page changed on {fmtDay(review.date)}. This summary is being re-checked; confirm against the
        linked source before relying on it.
      </p>
      <ul className="mt-2 list-disc pl-5">
        {review.sources.map(s => <li key={s.id}>{s.title} (flagged {fmtDay(s.flagged)})</li>)}
      </ul>
    </div>
  );
}

function StatusBadge({ page }) {
  return page.underReview
    ? <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">Under review</span>
    : <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800">Checked {fmtDay(page.lastVerified)}</span>;
}

function GuideNav({ current }) {
  const items = [
    ['', 'All topics'],
    ['key-numbers', 'Key numbers'],
    ['changes', 'What changed'],
    ['terms', 'Terms of use'],
  ];
  return (
    <nav aria-label="Compliance Guide" className="guide-nav mb-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
      {items.map(([slug, label]) => (
        <a
          key={slug || 'index'}
          href={`#guide${slug ? `/${slug}` : ''}`}
          aria-current={current === slug ? 'page' : undefined}
          className={`${current === slug ? 'font-semibold text-slate-900' : 'text-[#1b4965] hover:underline'} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1b4965] rounded-sm`}
        >
          {label}
        </a>
      ))}
    </nav>
  );
}

function Steps({ steps, level = 0 }) {
  const List = level === 0 ? 'ol' : 'ul';
  return (
    <List className={level === 0 ? 'list-decimal pl-6 space-y-3' : 'list-disc pl-6 mt-2 space-y-1'}>
      {steps.map((s, i) => (
        <li key={i}>
          {typeof s === 'string' ? s : (<>{s.text}{s.sub && <Steps steps={s.sub} level={level + 1} />}</>)}
        </li>
      ))}
    </List>
  );
}

/* ------------------------------------------------------------------ views */

function IndexView({ stateName }) {
  const [q, setQ] = useState('');
  const query = q.trim().toLowerCase();
  const words = query.split(/\s+/).filter(Boolean);
  const matches = p => words.every(w => p.search.includes(w));
  const pages = query ? guide.pages.filter(matches) : guide.pages;
  const keyMatch = query && words.every(w => guide.keyNumbers.search.includes(w));
  const reviewing = guide.pages.filter(p => p.underReview);

  return (
    <>
      <div className="mb-8 pb-4 border-b border-slate-200">
        <h2 className="text-2xl font-semibold text-slate-900">Compliance Guide</h2>
        <p className="text-slate-600 mt-2 max-w-3xl">
          A guide to the sources, not a substitute for them. Each topic summarizes a recurring nonprofit finance question,
          links to the IRS, accounting-standard, or federal rule it rests on, and shows when it was last checked.
        </p>
      </div>

      {reviewing.length > 0 && (
        <div role="alert" className="review-banner mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">Some topics are under review</p>
          <p className="mt-1">A source behind {reviewing.length === 1 ? 'one topic' : `${reviewing.length} topics`} changed and is being re-checked:</p>
          <ul className="mt-2 list-disc pl-5">
            {reviewing.map(p => <li key={p.slug}><a className={link} href={`#guide/${p.slug}`}>{p.title}</a> (source changed {fmtDay(p.underReview.date)})</li>)}
          </ul>
        </div>
      )}

      <div className="mb-6 max-w-xl">
        <label htmlFor="guide-search" className="block text-sm font-medium text-slate-700">Search the guide</label>
        <input
          id="guide-search"
          type="search"
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Try: gala tickets, donated car, sponsor logo, grant conditions"
          className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1b4965] focus:outline-2 focus:outline-[#1b4965]/40"
        />
        <p className="sr-only" aria-live="polite">{query ? `${pages.length + (keyMatch ? 1 : 0)} results` : ''}</p>
      </div>

      <ul className="grid gap-4 md:grid-cols-2">
        {pages.map(p => (
          <li key={p.slug} className="rounded-lg border border-slate-200 bg-white p-5">
            <h3 className="text-lg font-semibold text-slate-900">
              <a className="hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1b4965] rounded-sm" href={`#guide/${p.slug}`}>{p.title}</a>
            </h3>
            <p className="mt-1 text-sm text-slate-600">{p.question}</p>
            <div className="mt-3"><StatusBadge page={p} /></div>
          </li>
        ))}
        {(!query || keyMatch) && (
          <li className="rounded-lg border border-slate-200 bg-white p-5">
            <h3 className="text-lg font-semibold text-slate-900">
              <a className="hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1b4965] rounded-sm" href="#guide/key-numbers">Key numbers</a>
            </h3>
            <p className="mt-1 text-sm text-slate-600">Dollar thresholds and rates by year: acknowledgment and disclosure thresholds, token-gift limits, reporting triggers, federal grant thresholds.</p>
          </li>
        )}
      </ul>
      {query && !pages.length && !keyMatch && <p className="text-sm text-slate-600">No topics match "{q}". Try a simpler word, such as "pledge" or "sponsor."</p>}

      <p className="mt-8 text-sm text-slate-500 max-w-3xl">
        These topics cover federal rules, so they apply in {stateName} and elsewhere. State-specific modules
        {stateName === 'South Dakota' ? ' (such as South Dakota nonprofit corporation law, SDCL Title 47)' : ''} are planned.
      </p>
    </>
  );
}

function PageView({ page }) {
  return (
    <article aria-labelledby="guide-page-title">
      <ReviewBanner review={page.underReview} />
      <header className="mb-6 pb-4 border-b border-slate-200">
        <h2 id="guide-page-title" className="text-2xl font-semibold text-slate-900">{page.title}</h2>
        <p className="mt-1 text-slate-600">{page.question}</p>
        <p className="mt-3 text-xs text-slate-500">Last checked {fmtDay(page.lastVerified)} · {NOT_ADVICE}</p>
      </header>

      <section aria-labelledby="sum-h" className="mb-8">
        <h3 id="sum-h" className="sr-only">Summary</h3>
        <p className="text-lg leading-relaxed text-slate-800 max-w-3xl">{page.summary}</p>
      </section>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0">
          <section aria-labelledby="steps-h" className="mb-8">
            <h3 id="steps-h" className="text-xl font-semibold text-slate-900 mb-3">Questions to work through</h3>
            <div className="text-slate-800 leading-relaxed max-w-3xl"><Steps steps={page.steps} /></div>
          </section>
          <p className="mb-4 text-xs text-slate-500">{NOT_ADVICE} The detail below summarizes the cited sources.</p>
          <div className="guide-prose" dangerouslySetInnerHTML={{ __html: page.html }} />
        </div>

        <aside className="space-y-6" aria-label="Sources and questions for your advisor">
          <section aria-labelledby="pro-h" className="rounded-lg border border-[#1b4965]/30 bg-[#1b4965]/5 p-5">
            <h3 id="pro-h" className="text-base font-semibold text-slate-900">Bring this to your accountant or attorney</h3>
            <ul className="mt-3 list-disc pl-5 space-y-2 text-sm text-slate-700">
              {page.askYourPro.map((q, i) => <li key={i}>{q}</li>)}
            </ul>
          </section>

          <section aria-labelledby="prov-h" className="rounded-lg border border-slate-200 bg-white p-5">
            <h3 id="prov-h" className="text-base font-semibold text-slate-900">Where this comes from</h3>
            <h4 className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Citations</h4>
            <ul className="mt-2 space-y-3 text-sm">
              {page.citations.map((c, i) => (
                <li key={i}>
                  <p className="font-medium text-slate-900">{c.ref}</p>
                  <p className="text-slate-600">{c.covers}</p>
                  <p className="text-xs text-slate-500">{c.label}</p>
                </li>
              ))}
            </ul>
            <h4 className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-500">Source documents</h4>
            <ul className="mt-2 space-y-3 text-sm">
              {page.sources.map(s => (
                <li key={s.id}>
                  <a className={`${link} source-link`} href={s.url} rel="noopener noreferrer" target="_blank">{s.title}<span className="sr-only"> (opens in a new tab)</span></a>
                  <p className="text-xs text-slate-500">Version relied on: {s.version}</p>
                  <p className="text-xs text-slate-500">{s.label ? `${s.label}; last` : 'Last'} checked {fmtDay(s.lastVerified)}</p>
                </li>
              ))}
            </ul>
          </section>

          <p className="text-xs text-slate-500">
            Spot an error? <a className={link} href={`${ISSUES_URL}${encodeURIComponent(page.title)}`} rel="noopener noreferrer" target="_blank">Report it on GitHub<span className="sr-only"> (opens in a new tab)</span></a>.
          </p>
        </aside>
      </div>
    </article>
  );
}

function KeyNumbersView({ row }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!row || !ref.current) return;
    const el = ref.current.querySelector(`#${CSS.escape(row)}`);
    const tr = el?.closest('tr');
    if (tr) {
      tr.classList.add('row-highlight');
      tr.scrollIntoView({ block: 'center' });
      return () => tr.classList.remove('row-highlight');
    }
  }, [row]);
  return (
    <article aria-labelledby="kn-title">
      <header className="mb-6 pb-4 border-b border-slate-200">
        <h2 id="kn-title" className="text-2xl font-semibold text-slate-900">Key numbers</h2>
        <p className="mt-3 text-xs text-slate-500">{NOT_ADVICE} Confirm the current figure in the cited source before relying on it.</p>
      </header>
      <div ref={ref} className="guide-prose" dangerouslySetInnerHTML={{ __html: guide.keyNumbers.html }} />
    </article>
  );
}

function ChangesView() {
  const { openFlags, pinLogs, changelogHtml } = guide.changes;
  return (
    <article aria-labelledby="ch-title">
      <header className="mb-6 pb-4 border-b border-slate-200">
        <h2 id="ch-title" className="text-2xl font-semibold text-slate-900">What changed</h2>
        <p className="mt-1 text-slate-600 max-w-3xl">
          Every source is checked automatically each quarter for broken links, new revisions, and new accounting-standard updates.
          When a source changes, the pages that rely on it are marked "Under review" until they're re-checked.
        </p>
      </header>

      <section aria-labelledby="flags-h" className="mb-10">
        <h3 id="flags-h" className="text-xl font-semibold text-slate-900 mb-3">Sources currently under review</h3>
        {openFlags.length === 0
          ? <p className="text-sm text-slate-600">None. Every source behind the guide matched the version last checked.</p>
          : (
            <ul className="space-y-3 text-sm">
              {openFlags.map(f => (
                <li key={f.id} className="rounded-md border border-amber-300 bg-amber-50 p-3 text-amber-900">
                  <p className="font-medium">{f.title}</p>
                  <p>Flagged {fmtDay(f.flagged)}: {f.reason}</p>
                  {f.pages.length > 0 && <p>Affects: {f.pages.map((p, i) => <span key={p.slug}>{i ? ', ' : ''}<a className={link} href={`#guide/${p.slug}`}>{p.title}</a></span>)}</p>}
                </li>
              ))}
            </ul>
          )}
      </section>

      <section aria-labelledby="pin-h" className="mb-10">
        <h3 id="pin-h" className="text-xl font-semibold text-slate-900 mb-3">Page history</h3>
        <div className="guide-prose">
          <div className="table-wrap" tabIndex={0} role="region" aria-label="Page history">
            <table>
              <thead><tr><th>Date</th><th>Page</th><th>What changed</th><th>Based on</th></tr></thead>
              <tbody>
                {pinLogs.map((r, i) => (
                  <tr key={i}>
                    <td className="whitespace-nowrap">{fmtDay(r.date)}</td>
                    <td><a className={link} href={`#guide/${r.page}`}>{r.title}</a></td>
                    <td>{r.change}</td>
                    <td>{r.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section aria-labelledby="log-h">
        <h3 id="log-h" className="text-xl font-semibold text-slate-900 mb-3">Change log</h3>
        <div className="guide-prose" dangerouslySetInnerHTML={{ __html: changelogHtml }} />
      </section>
    </article>
  );
}

function TermsView() {
  return (
    <article aria-labelledby="terms-title" className="max-w-3xl">
      <header className="mb-6 pb-4 border-b border-slate-200">
        <h2 id="terms-title" className="text-2xl font-semibold text-slate-900">Terms of use</h2>
      </header>
      <div className="guide-prose">
        <h3>What this guide is</h3>
        <p>
          The Compliance Guide summarizes publicly available federal tax rules, accounting standards, and federal grant
          regulations that nonprofits commonly deal with, and links to each original source. It is maintained by {MAINTAINER}.
        </p>
        <h3>What it is not</h3>
        <ul>
          <li>It is general information only. It is not legal, tax, accounting, or other professional advice.</li>
          <li>It doesn't consider your organization's facts, agreements, or state law, any of which can change the answer.</li>
          <li>Using the guide, or contacting the maintainer about it, does not create an attorney-client, accountant-client, or any other professional relationship.</li>
        </ul>
        <h3>Confirm before you act</h3>
        <p>
          Before making a decision based on this guide, read the linked source and confirm with your own accountant or attorney.
          Each topic lists questions to bring to them.
        </p>
        <h3>Accuracy and updates</h3>
        <p>
          Each page shows the citations it relies on, how each was checked, and when. Sources are checked automatically every
          quarter; when a source changes, affected pages are marked "Under review" until they are re-checked. Even so, rules can
          change between checks, and summaries can contain errors. The original sources control. See <a href="#guide/changes">What changed</a> for the full history.
        </p>
        <h3>No warranty</h3>
        <p>
          The guide is provided as is, without warranties of any kind, including accuracy, completeness, or fitness for a
          particular purpose. To the fullest extent the law allows, the maintainer is not liable for decisions made or actions
          taken based on it.
        </p>
        <h3>Report an error</h3>
        <p>
          If something looks wrong or out of date, <a href={ISSUES_URL} rel="noopener noreferrer" target="_blank">open an issue on GitHub</a>.
          The content and its full source history are public in the <a href={SOURCE_FOLDER_URL} rel="noopener noreferrer" target="_blank">compliance folder of the site's repository</a>.
        </p>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ tab */

export default function ComplianceTab({ route, stateName }) {
  const [first, second] = route.split('/').filter(Boolean);
  const page = useMemo(() => guide.pages.find(p => p.slug === first), [first]);

  // New page: start at the top, unless the link points at a specific row (Key numbers handles that scroll).
  useEffect(() => { if (!second) window.scrollTo?.(0, 0); }, [first, second]);

  let view;
  let current = '';
  if (!first) view = <IndexView stateName={stateName} />;
  else if (first === 'key-numbers') { view = <KeyNumbersView row={second} />; current = 'key-numbers'; }
  else if (first === 'changes') { view = <ChangesView />; current = 'changes'; }
  else if (first === 'terms') { view = <TermsView />; current = 'terms'; }
  else if (page) { view = <PageView page={page} />; current = null; }
  else view = (
    <div>
      <h2 className="text-2xl font-semibold text-slate-900">Page not found</h2>
      <p className="mt-2 text-slate-600">That topic isn't in the guide. <a className={link} href="#guide">See all topics</a>.</p>
    </div>
  );

  return (
    <div className="compliance-guide">
      <FirstVisitNotice />
      <GuideNav current={current} />
      {view}
    </div>
  );
}
