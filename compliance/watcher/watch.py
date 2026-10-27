#!/usr/bin/env python3
"""Quarterly source watcher for the nonprofit finance reference repo.

Checks every source in sources.yaml for:
  - link health (does the live URL resolve?)
  - content or revision change since the last run
  - new FASB ASUs
  - stale verification (last_verified older than STALE_DAYS)
and pins a snapshot of anything new or changed.

Writes REPORT.md (always) and issue.md (only when something needs a human).
Updates state/sources.json. Never treats a failed fetch as a pass.

Usage:
  python watcher/watch.py --lint     structure check only, no network
  python watcher/watch.py            full run
"""

from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import html
import io
import json
import logging
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Callable, Optional

import yaml

ROOT = Path(__file__).resolve().parent.parent
SOURCES = ROOT / "sources.yaml"
STATE = ROOT / "state" / "sources.json"
SNAPSHOTS = ROOT / "snapshots"
REPORT = ROOT / "REPORT.md"
ISSUE = ROOT / "issue.md"
DECISION_GLOBS = ["decisions/*.md", "volatile-values.md"]

STALE_DAYS = 400
VALID_KINDS = {"irs_pdf", "web", "ecfr", "asu_feed", "book"}
VALID_WATCH = {"annual", "asu", "occasional", "static"}
VALID_VERIFIED = {"primary", "secondary", "pending"}
REQUIRED = ["id", "title", "kind", "stable_id", "live_url", "watch", "verified", "last_verified"]
USER_AGENT = "nonprofit-finance-ref-watcher/1.0 (+quarterly link and revision check)"
logging.getLogger("pypdf").setLevel(logging.ERROR)


# --------------------------------------------------------------------------- data

@dataclass
class FetchResult:
    ok: bool
    status: Optional[int] = None
    body: bytes = b""
    final_url: str = ""
    headers: dict = field(default_factory=dict)
    error: str = ""


Fetcher = Callable[[str], FetchResult]


def http_fetch(url: str) -> FetchResult:
    import requests

    try:
        r = requests.get(url, headers={"User-Agent": USER_AGENT}, timeout=45, allow_redirects=True)
        return FetchResult(
            ok=r.status_code < 400,
            status=r.status_code,
            body=r.content,
            final_url=r.url,
            headers={k.lower(): v for k, v in r.headers.items()},
        )
    except Exception as e:  # network errors are reported, never swallowed
        return FetchResult(ok=False, error=f"{type(e).__name__}: {e}")


# --------------------------------------------------------------------------- parsing

def load_sources(path: Path = SOURCES) -> list[dict]:
    data = yaml.safe_load(path.read_text(encoding="utf-8"))
    return data.get("sources", [])


def front_matter(path: Path) -> dict:
    text = path.read_text(encoding="utf-8")
    m = re.match(r"^---\n(.*?)\n---\n", text, re.S)
    if not m:
        return {}
    return yaml.safe_load(m.group(1)) or {}


def decision_files(root: Path = ROOT) -> list[Path]:
    files: list[Path] = []
    for g in DECISION_GLOBS:
        files.extend(sorted(root.glob(g)))
    return [f for f in files if not f.name.startswith("_")]


def cites_map(root: Path = ROOT) -> dict[str, list[str]]:
    """source id -> decision files that cite it"""
    out: dict[str, list[str]] = {}
    for f in decision_files(root):
        for sid in front_matter(f).get("cites", []) or []:
            out.setdefault(sid, []).append(str(f.relative_to(root)))
    return out


def as_date(v) -> Optional[dt.date]:
    if isinstance(v, dt.date):
        return v
    try:
        return dt.date.fromisoformat(str(v))
    except Exception:
        return None


# --------------------------------------------------------------------------- lint

def lint(root: Path = ROOT) -> list[str]:
    errors: list[str] = []
    sources = load_sources(root / "sources.yaml")
    ids = set()
    for s in sources:
        sid = s.get("id", "<missing id>")
        for k in REQUIRED:
            if k not in s:
                errors.append(f"sources.yaml: {sid} missing field '{k}'")
        if sid in ids:
            errors.append(f"sources.yaml: duplicate id {sid}")
        ids.add(sid)
        if s.get("kind") not in VALID_KINDS:
            errors.append(f"sources.yaml: {sid} has invalid kind {s.get('kind')!r}")
        if s.get("watch") not in VALID_WATCH:
            errors.append(f"sources.yaml: {sid} has invalid watch {s.get('watch')!r}")
        if s.get("verified") not in VALID_VERIFIED:
            errors.append(f"sources.yaml: {sid} has invalid verified {s.get('verified')!r}")
        if as_date(s.get("last_verified")) is None:
            errors.append(f"sources.yaml: {sid} last_verified is not a date")

    for f in decision_files(root):
        rel = f.relative_to(root)
        fm = front_matter(f)
        if not fm:
            errors.append(f"{rel}: missing front matter")
            continue
        for sid in fm.get("cites", []) or []:
            if sid not in ids:
                errors.append(f"{rel}: cites unknown source id '{sid}'")
        for c in fm.get("citations", []) or []:
            if c.get("verified") not in VALID_VERIFIED:
                errors.append(f"{rel}: citation {c.get('ref')!r} has invalid verified level")
        if as_date(fm.get("last_verified")) is None:
            errors.append(f"{rel}: last_verified is not a date")
        if fm.get("publish") is True:
            for c in fm.get("citations", []) or []:
                if c.get("verified") == "pending":
                    errors.append(f"{rel}: published page has a pending citation {c.get('ref')!r}; verify it or set publish: false")
            for k in ("summary", "ask_your_pro", "steps"):
                if not fm.get(k):
                    errors.append(f"{rel}: published page is missing '{k}'")
    return errors


def update_flags(findings: list, sources: list[dict], flags: dict, today: str) -> dict:
    """Record a flag for every changed/broken source; drop flags a human has cleared.

    A flag clears when the source's last_verified in sources.yaml is on or after the flag date.
    The earliest flag date is kept while a flag stays open.
    """
    lv = {s["id"]: as_date(s.get("last_verified")) for s in sources}
    out = {}
    for sid, f in flags.items():
        d = as_date(f.get("flagged"))
        if d and lv.get(sid) and lv[sid] >= d:
            continue
        if sid in lv:
            out[sid] = f
    for f in findings:
        if f.level in ("changed", "broken") and f.sid not in out:
            out[f.sid] = {"flagged": today, "reason": f.detail}
    return out


# --------------------------------------------------------------------------- content signals

def pdf_revision(body: bytes) -> Optional[str]:
    """Pull the revision marker from the first pages of an IRS PDF."""
    text = ""
    try:
        from pypdf import PdfReader

        reader = PdfReader(io.BytesIO(body))
        pages = list(reader.pages)
        for page in pages[:3] + pages[-2:]:
            text += (page.extract_text() or "") + "\n"
    except Exception:
        text = body[:200000].decode("latin-1", errors="ignore")
    patterns = [
        r"\(Rev\.\s*([A-Za-z]+\.?\s*\d{4})\)",          # (Rev. January 2024)
        r"Rev\.\s*(\d{1,2}-\d{4})",                     # Rev. 3-2016
        r"\(Rev\.\s*(\d{1,2}/\d{4})\)",                 # (Rev. 12/2023)
        r"Cat\.\s*No\.\s*\d+[A-Z]?\s.*?(\d{4})",        # catalog line fallback
        r"\b(20\d{2})\s+(?:Instructions|Schedule|Form)\b",  # tax-year forms
    ]
    for p in patterns:
        m = re.search(p, text, re.S)
        if m:
            return re.sub(r"\s+", " ", m.group(1)).strip()
    return None


def html_text(body: bytes) -> str:
    s = body.decode("utf-8", errors="ignore")
    s = re.sub(r"(?is)<(script|style|noscript|header|footer|nav).*?</\1>", " ", s)
    s = re.sub(r"(?s)<[^>]+>", " ", s)
    return html.unescape(s)


def irs_page_revision(text: str) -> Optional[str]:
    m = re.search(r"Page Last Reviewed or Updated:\s*([0-9]{1,2}-[A-Za-z]{3}-[0-9]{4})", text)
    return m.group(1) if m else None


def normalized_hash(kind: str, body: bytes) -> str:
    if kind == "irs_pdf" or body[:5] == b"%PDF-":
        return hashlib.sha256(body).hexdigest()
    text = html_text(body)
    # strip volatile bits: dates, times, session tokens, whitespace
    text = re.sub(r"\b\d{1,2}[-/][A-Za-z0-9]{2,3}[-/]\d{2,4}\b", " ", text)
    text = re.sub(r"\b(19|20)\d{2}-\d{2}-\d{2}(T[\d:.Z+-]+)?\b", " ", text)
    text = re.sub(r"Page Last Reviewed or Updated:.*", " ", text)
    text = re.sub(r"\s+", " ", text).strip().lower()
    return hashlib.sha256(text.encode()).hexdigest()


def ecfr_revision(fetch: Fetcher, src: dict) -> Optional[str]:
    """Latest amendment date for 2 CFR part 200 via the eCFR versioner API."""
    m = re.search(r"title-(\d+).*?part-(\d+)", src["live_url"])
    if not m:
        return None
    title, part = m.groups()
    r = fetch(f"https://www.ecfr.gov/api/versioner/v1/versions/title-{title}.json?part={part}")
    if not r.ok:
        return None
    try:
        data = json.loads(r.body)
        dates = [v.get("amendment_date") or v.get("date") for v in data.get("content_versions", [])]
        dates = [d for d in dates if d]
        return max(dates) if dates else None
    except Exception:
        return None


ASU_RE = re.compile(r"ASU\s*(?:No\.\s*)?(20\d{2}-\d{2})")


def asu_numbers(body: bytes) -> dict[str, str]:
    text = re.sub(r"\s+", " ", html_text(body))
    found: dict[str, str] = {}
    for m in ASU_RE.finditer(text):
        num = m.group(1)
        if num not in found:
            found[num] = text[m.end(): m.end() + 160].strip()
    return found


# --------------------------------------------------------------------------- pinning

def pin(src: dict, r: FetchResult, today: str, fetch: Fetcher, root: Path) -> dict:
    """Freeze what was seen. Returns a pin record."""
    sha8 = hashlib.sha256(r.body).hexdigest()[:8] if r.body else "nobody"
    if src.get("public_domain") and src["kind"] == "irs_pdf" and r.body[:5] == b"%PDF-":
        dest = root / "snapshots" / src["id"] / f"{today}_{sha8}.pdf"
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(r.body)
        return {"date": today, "type": "stored_pdf", "ref": str(dest.relative_to(root))}
    if src["kind"] == "ecfr" and src.get("pin_template"):
        return {"date": today, "type": "ecfr_point_in_time", "ref": src["pin_template"].format(date=today)}
    if src["kind"] in ("asu_feed",):
        return {"date": today, "type": "asu_set", "ref": "state/sources.json:_asu_seen"}
    w = fetch(f"https://web.archive.org/save/{src['live_url']}")
    loc = w.headers.get("content-location") if w.ok else None
    if loc:
        return {"date": today, "type": "wayback", "ref": f"https://web.archive.org{loc}"}
    if w.ok and "web.archive.org/web/" in (w.final_url or ""):
        return {"date": today, "type": "wayback", "ref": w.final_url}
    return {"date": today, "type": "manual", "ref": None,
            "note": f"Wayback capture failed ({w.status or w.error}); capture manually"}


# --------------------------------------------------------------------------- main check

@dataclass
class Finding:
    sid: str
    level: str      # changed | broken | manual | new_asu | stale | baseline | unverified
    detail: str


def check(fetch: Fetcher = http_fetch, root: Path = ROOT, today: Optional[dt.date] = None) -> tuple[list[Finding], dict]:
    today = today or dt.date.today()
    tstr = today.isoformat()
    sources = load_sources(root / "sources.yaml")
    state_path = root / "state" / "sources.json"
    state = json.loads(state_path.read_text()) if state_path.exists() else {}
    findings: list[Finding] = []

    for src in sources:
        sid = src["id"]
        prev = state.get(sid)
        cur = {"last_checked": tstr, "pins": (prev or {}).get("pins", [])}

        # staleness and verification backlog do not need the network
        lv = as_date(src.get("last_verified"))
        if lv and (today - lv).days > STALE_DAYS:
            findings.append(Finding(sid, "stale", f"last verified {lv}, over {STALE_DAYS} days ago"))
        if src.get("verified") != "primary":
            findings.append(Finding(sid, "unverified", f"verification level: {src.get('verified')}"))

        if src.get("fetch") is False:
            cur["status"] = "skipped"
            state[sid] = cur
            continue

        r = fetch(src["live_url"])
        cur["status"] = r.status
        cur["final_url"] = r.final_url
        if not r.ok:
            cur.update({k: (prev or {}).get(k) for k in ("sha256", "revision")})
            if r.status in (404, 410):
                findings.append(Finding(sid, "broken", f"page not found ({r.status})"))
            elif r.status in (401, 403, 429):
                findings.append(Finding(sid, "manual", f"site refused the automated check ({r.status}); open the link by hand"))
            else:
                findings.append(Finding(sid, "manual", f"fetch failed: {r.status or r.error}"))
            state[sid] = cur
            continue

        if src["kind"] == "asu_feed":
            seen = set(state.get("_asu_seen", []))
            now = asu_numbers(r.body)
            if not now:
                findings.append(Finding(sid, "manual", "page loaded but no ASU numbers found; page layout may have changed"))
            elif not seen:
                findings.append(Finding(sid, "baseline", f"recorded {len(now)} ASUs as the baseline"))
            else:
                for num in sorted(set(now) - seen):
                    findings.append(Finding(sid, "new_asu", f"ASU {num}: {now[num][:140]}"))
            state["_asu_seen"] = sorted(seen | set(now))
            if not seen and now:
                cur["pins"].append(pin(src, r, tstr, fetch, root))
            state[sid] = cur
            continue

        h = normalized_hash(src["kind"], r.body)
        if src["kind"] == "irs_pdf":
            rev = pdf_revision(r.body)
        elif src["kind"] == "ecfr":
            rev = ecfr_revision(fetch, src)
        else:
            rev = irs_page_revision(html_text(r.body)) if "irs.gov" in r.final_url else None
        cur.update({"sha256": h, "revision": rev})

        if prev is None or not prev.get("sha256"):
            cur["pins"].append(pin(src, r, tstr, fetch, root))
            findings.append(Finding(sid, "baseline", f"first capture; revision seen: {rev or 'n/a'}"))
        else:
            rev_changed = rev is not None and prev.get("revision") not in (None, rev)
            hash_changed = h != prev.get("sha256")
            if rev_changed or hash_changed:
                cur["pins"].append(pin(src, r, tstr, fetch, root))
                why = (f"revision {prev.get('revision')} -> {rev}" if rev_changed
                       else "content changed (same revision marker)" if rev else "content changed")
                if src["kind"] == "web" and not rev_changed:
                    why += "; HTML page, may be cosmetic"
                findings.append(Finding(sid, "changed", why))
            elif not cur["pins"] or cur["pins"][-1].get("type") == "manual":
                # backfill: an earlier pin attempt failed (e.g., Wayback unreachable); try again
                retry = pin(src, r, tstr, fetch, root)
                if retry["type"] != "manual":
                    cur["pins"].append(retry)
        if r.final_url and prev and prev.get("final_url") and r.final_url != prev["final_url"]:
            findings.append(Finding(sid, "manual", f"now redirects to {r.final_url}; update live_url if permanent"))
        state[sid] = cur

    state_path.parent.mkdir(parents=True, exist_ok=True)
    state_path.write_text(json.dumps(state, indent=2, sort_keys=True) + "\n")
    flags_path = root / "state" / "flags.json"
    flags = json.loads(flags_path.read_text()) if flags_path.exists() else {}
    flags = update_flags(findings, sources, flags, tstr)
    flags_path.write_text(json.dumps(flags, indent=2, sort_keys=True) + "\n")
    return findings, state


# --------------------------------------------------------------------------- reporting

ACTION_LEVELS = ["changed", "broken", "new_asu", "manual", "stale"]
LABELS = {
    "changed": "Source changed: re-verify the decision files that cite it",
    "broken": "Link broken: find the new location and update live_url",
    "new_asu": "New FASB ASUs: skim for Topic 958 or 606",
    "manual": "Could not check automatically: check by hand",
    "stale": "Not verified in over a year",
    "baseline": "Baseline captured (first run for these sources)",
    "unverified": "Verification backlog (not yet read in primary text)",
}


def render(findings: list[Finding], cmap: dict[str, list[str]], today: str) -> tuple[str, Optional[str]]:
    by_level: dict[str, list[Finding]] = {}
    for f in findings:
        by_level.setdefault(f.level, []).append(f)

    lines = [f"# Watcher report, {today}", ""]
    needs_human = any(l in by_level for l in ACTION_LEVELS) or "baseline" in by_level
    affected = sorted({d for l in ("changed", "broken", "stale") for f in by_level.get(l, []) for d in cmap.get(f.sid, [])})
    if affected:
        lines += ["## Decision files to re-verify", ""] + [f"- [ ] `{d}`" for d in affected] + [""]
    for level in ACTION_LEVELS + ["baseline", "unverified"]:
        if level not in by_level:
            continue
        lines += [f"## {LABELS[level]}", ""]
        for f in by_level[level]:
            used = cmap.get(f.sid, [])
            suffix = f" (cited by {', '.join(f'`{u}`' for u in used)})" if used and level != "unverified" else ""
            lines.append(f"- **{f.sid}**: {f.detail}{suffix}")
        lines.append("")
    if not findings:
        lines += ["Nothing to report.", ""]
    lines += ["---", "When done: update the decision file, bump `last_verified`, add a pin-log line, close this issue."]
    report = "\n".join(lines) + "\n"
    return report, (report if needs_human else None)


def main(argv: Optional[list[str]] = None) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--lint", action="store_true", help="structure check only, no network")
    args = ap.parse_args(argv)

    errors = lint()
    if errors:
        print("LINT ERRORS:")
        for e in errors:
            print(f"  - {e}")
        return 1
    print("lint: ok")
    if args.lint:
        return 0

    today = dt.date.today().isoformat()
    findings, _ = check()
    report, issue = render(findings, cites_map(), today)
    REPORT.write_text(report, encoding="utf-8")
    if issue:
        ISSUE.write_text(issue, encoding="utf-8")
    elif ISSUE.exists():
        ISSUE.unlink()
    print(report)
    return 0


if __name__ == "__main__":
    sys.exit(main())
