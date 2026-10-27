import { test } from 'node:test';
import assert from 'node:assert/strict';
import { publishProblems, underReview, dropPendingRows, linkInternalRefs } from './compliance-lib.js';

const base = {
  publish: true,
  summary: 's',
  ask_your_pro: ['q'],
  steps: ['x'],
  last_verified: '2026-10-19',
  cites: ['pub-x', 'page-y'],
  citations: [{ ref: 'A', verified: 'primary' }, { ref: 'B', verified: 'secondary' }],
};
const sources = {
  'pub-x': { title: 'Pub X', last_verified: '2026-10-19' },
  'page-y': { title: 'Page Y', last_verified: '2026-10-19' },
};

test('publishable page has no problems', () => {
  assert.deepEqual(publishProblems(base), []);
});

test('pending citation blocks publication', () => {
  const fm = { ...base, citations: [...base.citations, { ref: 'C', verified: 'pending' }] };
  assert.match(publishProblems(fm).join(), /pending citation: C/);
});

test('unpublished and incomplete pages are blocked', () => {
  assert.ok(publishProblems({ ...base, publish: false }).length);
  assert.match(publishProblems({ ...base, ask_your_pro: [] }).join(), /missing ask_your_pro/);
});

test('no flags means not under review', () => {
  assert.equal(underReview(base, sources, {}), null);
});

test('flag after verification puts the page under review', () => {
  const r = underReview(base, sources, { 'pub-x': { flagged: '2027-01-01', reason: 'revision changed' } });
  assert.equal(r.date, '2027-01-01');
  assert.equal(r.sources[0].id, 'pub-x');
});

test('re-verifying the source clears the review', () => {
  const s2 = { ...sources, 'pub-x': { title: 'Pub X', last_verified: '2027-01-02' } };
  assert.equal(underReview(base, s2, { 'pub-x': { flagged: '2027-01-01' } }), null);
});

test('re-verifying the page clears the review', () => {
  assert.equal(underReview({ ...base, last_verified: '2027-01-05' }, sources, { 'pub-x': { flagged: '2027-01-01' } }), null);
});

test('flags on sources the page does not cite are ignored', () => {
  assert.equal(underReview(base, sources, { other: { flagged: '2027-01-01' } }), null);
});

test('earliest flag date is reported', () => {
  const r = underReview(base, sources, { 'pub-x': { flagged: '2027-02-01' }, 'page-y': { flagged: '2027-01-15' } });
  assert.equal(r.date, '2027-01-15');
  assert.equal(r.sources.length, 2);
});

test('pending rows are dropped from tables', () => {
  const md = '| a | b |\n|---|---|\n| x | P |\n| y | pending |';
  assert.equal(dropPendingRows(md), '| a | b |\n|---|---|\n| x | P |');
});

test('internal references become site links', () => {
  const out = linkInternalRefs('see `sponsorships.md`, `volatile-values.md`, row `form-8282`, code `other`', { sponsorships: 'Corporate sponsorships' }, new Set(['form-8282']));
  assert.equal(out, 'see [Corporate sponsorships](#guide/sponsorships), [Key numbers](#guide/key-numbers), row [form-8282](#guide/key-numbers/form-8282), code `other`');
});
