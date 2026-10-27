# Compliance guide: source of truth

This folder holds the content of the site's **Compliance Guide** tab. The site builds its pages from these files; nothing in the guide is edited anywhere else.

> General information, not legal, tax, or accounting advice. Readers should confirm with their own accountant or attorney before acting.

## What's here

```
sources.yaml          Every source, with three anchors: stable citation, live URL, pin
volatile-values.md    Every dollar threshold and rate, by year (the "Key numbers" page)
decisions/            One page per recurring question; front matter drives the public page
snapshots/            Pinned copies of public-domain federal documents (written by the watcher)
state/sources.json    What the watcher saw last time (status, hash, revision, pins)
state/flags.json      Sources that changed and haven't been re-verified yet
watcher/watch.py      The quarterly check (run by .github/workflows/watch-sources.yml)
CHANGELOG.md          Public "What changed" page
```

## How a page gets published

A decision file appears on the site only when its front matter has `publish: true` **and** none of its citations is `pending`. The watcher's lint step enforces this, and the build fails otherwise. Published pages must also have `summary`, `ask_your_pro`, and `steps`. Copy `decisions/_template.md` to start a new page.

Verification levels shown to readers:

| In the file | On the site |
|---|---|
| `primary` | Checked against the original text |
| `secondary` | Summarized from professional sources |
| `pending` | Not published |

Every page shows each citation, the version relied on, and the date it was last checked.

## How updates work

The watcher runs quarterly (Jan 1, Apr 1, Jul 1, Oct 1) and on demand from the Actions tab. It checks every source for broken links, changed content, changed IRS revision dates, and new FASB updates. It pins what it sees and opens a GitHub issue when something needs review.

When a source changes, the watcher records a flag in `state/flags.json`. The next site build shows an **under review** banner on every page that cites that source. The banner clears automatically once a maintainer re-verifies the source and updates its `last_verified` date in `sources.yaml` to the flag date or later.

To resolve a flag: compare the new source with the pinned snapshot, update the decision file if the rule changed, bump `last_verified` on the source and the page, add a pin-log line, and close the issue.

## Annual chore (October)

The IRS publishes next year's inflation adjustments around October. Add the new Rev. Proc. to `sources.yaml` and a new year column to `volatile-values.md`; keep last year's column.

## Run locally

```bash
pip install -r watcher/requirements.txt
python watcher/watch.py --lint      # structure check only
python watcher/watch.py             # full check; updates state/ and snapshots/
```
