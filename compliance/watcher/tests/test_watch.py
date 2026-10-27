"""Offline tests for the watcher. A fake fetcher stands in for the network."""

import datetime as dt
import shutil
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import watch  # noqa: E402

REPO = Path(__file__).resolve().parents[2]

SOURCES_YAML = """
sources:
  - id: pub-x
    title: Test pub
    kind: irs_pdf
    stable_id: "Pub X"
    live_url: "https://example.test/pubx.pdf"
    watch: occasional
    verified: primary
    last_verified: 2026-10-19
    public_domain: true
  - id: page-y
    title: Test page
    kind: web
    stable_id: "Page Y"
    live_url: "https://example.test/y"
    watch: static
    verified: secondary
    last_verified: 2024-01-01
    public_domain: false
  - id: feed
    title: ASU feed
    kind: asu_feed
    stable_id: "ASU index"
    live_url: "https://example.test/asus"
    watch: asu
    verified: primary
    last_verified: 2026-10-19
"""

DECISION = """---
title: T
question: Q?
cites: [pub-x, page-y]
citations:
  - ref: "X"
    covers: "Y"
    verified: primary
last_verified: 2026-10-19
watch: static
---
# T
"""


def fake_pdf(rev: str) -> bytes:
    return f"%PDF-1.4\n(Rev. {rev}) body text".encode()


class FakeNet:
    def __init__(self):
        self.pages = {}

    def __call__(self, url):
        if url.startswith("https://web.archive.org/save/"):
            return watch.FetchResult(ok=True, status=200, final_url="https://web.archive.org/web/2026/x",
                                     headers={"content-location": "/web/20261019000000/" + url[29:]})
        if url in self.pages:
            status, body = self.pages[url]
            return watch.FetchResult(ok=status < 400, status=status, body=body, final_url=url)
        return watch.FetchResult(ok=False, error="ConnectionError: offline")


class WatcherTests(unittest.TestCase):
    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp())
        (self.tmp / "decisions").mkdir()
        (self.tmp / "sources.yaml").write_text(SOURCES_YAML)
        (self.tmp / "decisions" / "d.md").write_text(DECISION)
        (self.tmp / "volatile-values.md").write_text(DECISION.replace("pub-x, page-y", "pub-x"))
        self.net = FakeNet()
        self.net.pages["https://example.test/pubx.pdf"] = (200, fake_pdf("January 2024"))
        self.net.pages["https://example.test/y"] = (200, b"<html><p>Rule text</p></html>")
        self.net.pages["https://example.test/asus"] = (200, b"<li>ASU 2025-01 Something</li><li>ASU 2025-02 Other</li>")
        self.today = dt.date(2026, 10, 19)

    def tearDown(self):
        shutil.rmtree(self.tmp)

    def run_check(self):
        return watch.check(fetch=self.net, root=self.tmp, today=self.today)

    def levels(self, findings, sid):
        return {f.level for f in findings if f.sid == sid}

    def test_real_repo_lints_clean(self):
        self.assertEqual(watch.lint(REPO), [])

    def test_lint_catches_unknown_cite(self):
        (self.tmp / "decisions" / "bad.md").write_text(DECISION.replace("pub-x, page-y", "nope"))
        errs = watch.lint(self.tmp)
        self.assertTrue(any("unknown source id 'nope'" in e for e in errs))

    def test_first_run_is_baseline_and_pins(self):
        findings, state = self.run_check()
        self.assertIn("baseline", self.levels(findings, "pub-x"))
        self.assertEqual(state["pub-x"]["revision"], "January 2024")
        self.assertTrue(any((self.tmp / "snapshots" / "pub-x").glob("*.pdf")))
        self.assertEqual(state["page-y"]["pins"][0]["type"], "wayback")
        self.assertEqual(state["_asu_seen"], ["2025-01", "2025-02"])

    def test_no_change_is_quiet(self):
        self.run_check()
        findings, _ = self.run_check()
        actionable = [f for f in findings if f.level in watch.ACTION_LEVELS and f.sid != "page-y"]
        self.assertEqual(actionable, [])

    def test_revision_change_flags_and_keeps_old_pin(self):
        self.run_check()
        self.net.pages["https://example.test/pubx.pdf"] = (200, fake_pdf("March 2026"))
        findings, state = self.run_check()
        changed = [f for f in findings if f.sid == "pub-x" and f.level == "changed"]
        self.assertEqual(len(changed), 1)
        self.assertIn("January 2024 -> March 2026", changed[0].detail)
        self.assertEqual(len(state["pub-x"]["pins"]), 2)

    def test_silent_replacement_same_url_is_caught(self):
        self.run_check()
        self.net.pages["https://example.test/y"] = (200, b"<html><p>Different rule text</p></html>")
        findings, _ = self.run_check()
        self.assertIn("changed", self.levels(findings, "page-y"))

    def test_fetch_failure_is_never_a_pass(self):
        self.run_check()
        del self.net.pages["https://example.test/y"]
        findings, state = self.run_check()
        self.assertIn("manual", self.levels(findings, "page-y"))
        self.assertIsNotNone(state["page-y"]["sha256"])  # prior hash kept for next comparison

    def test_404_is_broken(self):
        self.net.pages["https://example.test/y"] = (404, b"")
        findings, _ = self.run_check()
        self.assertIn("broken", self.levels(findings, "page-y"))

    def test_403_is_manual_not_broken(self):
        self.net.pages["https://example.test/y"] = (403, b"")
        findings, _ = self.run_check()
        self.assertIn("manual", self.levels(findings, "page-y"))
        self.assertNotIn("broken", self.levels(findings, "page-y"))

    def test_fetch_false_is_skipped_quietly(self):
        (self.tmp / "sources.yaml").write_text(
            SOURCES_YAML.replace('live_url: "https://example.test/y"', 'live_url: "https://example.test/y"\n    fetch: false'))
        findings, state = self.run_check()
        self.assertEqual(state["page-y"]["status"], "skipped")
        self.assertFalse(self.levels(findings, "page-y") & {"manual", "broken", "changed", "baseline"})

    def test_failed_pin_is_retried_next_run(self):
        self.net.__class__ = type("NoWayback", (FakeNet,), {
            "__call__": lambda s, u: watch.FetchResult(ok=False, error="blocked")
            if u.startswith("https://web.archive.org/") else FakeNet.__call__(s, u)})
        _, state = self.run_check()
        self.assertEqual(state["page-y"]["pins"][-1]["type"], "manual")
        self.net.__class__ = FakeNet
        _, state = self.run_check()
        self.assertEqual(state["page-y"]["pins"][-1]["type"], "wayback")

    def test_change_records_flag_and_verification_clears_it(self):
        import json
        self.run_check()
        self.net.pages["https://example.test/pubx.pdf"] = (200, fake_pdf("March 2026"))
        self.today = dt.date(2026, 11, 2)
        self.run_check()
        flags = json.loads((self.tmp / "state" / "flags.json").read_text())
        self.assertEqual(flags["pub-x"]["flagged"], "2026-11-02")
        # a human re-verifies: bump last_verified to the flag date
        y = (self.tmp / "sources.yaml").read_text().replace("last_verified: 2026-10-19\n    public_domain: true", "last_verified: 2026-11-02\n    public_domain: true")
        (self.tmp / "sources.yaml").write_text(y)
        self.today = dt.date(2026, 11, 3)
        self.run_check()
        flags = json.loads((self.tmp / "state" / "flags.json").read_text())
        self.assertNotIn("pub-x", flags)

    def test_published_page_with_pending_citation_fails_lint(self):
        bad = DECISION.replace("watch: static", "watch: static\npublish: true\nsummary: s\nask_your_pro: [q]\nsteps: [x]").replace("verified: primary", "verified: pending")
        (self.tmp / "decisions" / "p.md").write_text(bad)
        self.assertTrue(any("pending citation" in e for e in watch.lint(self.tmp)))

    def test_new_asu_detected(self):
        self.run_check()
        self.net.pages["https://example.test/asus"] = (200, b"<li>ASU 2026-03 Not-for-Profit Entities (Topic 958)</li><li>ASU 2025-01</li><li>ASU 2025-02</li>")
        findings, _ = self.run_check()
        new = [f for f in findings if f.level == "new_asu"]
        self.assertEqual(len(new), 1)
        self.assertIn("2026-03", new[0].detail)

    def test_stale_source_flagged(self):
        findings, _ = self.run_check()
        self.assertIn("stale", self.levels(findings, "page-y"))

    def test_report_maps_to_decision_files(self):
        self.run_check()
        self.net.pages["https://example.test/pubx.pdf"] = (200, fake_pdf("March 2026"))
        findings, _ = self.run_check()
        report, issue = watch.render(findings, watch.cites_map(self.tmp), "2026-10-19")
        self.assertIn("`decisions/d.md`", report)
        self.assertIn("`volatile-values.md`", report)
        self.assertIsNotNone(issue)

    def test_pdf_revision_patterns(self):
        self.assertEqual(watch.pdf_revision(b"%PDF (Rev. 3-2016)"), "3-2016")
        self.assertEqual(watch.pdf_revision(b"%PDF (Rev. December 2024)"), "December 2024")


if __name__ == "__main__":
    unittest.main()
