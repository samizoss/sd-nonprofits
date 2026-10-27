# Changelog

Rule changes and verification upgrades. Routine watcher state updates are in the git log, not here.

## 2026-10-19

- Repo created: `sources.yaml` (24 sources), `volatile-values.md` (2025 and 2026 columns), seven decision files, quarterly watcher with 15 offline tests.
- Verification status at creation: 8 primary, 11 secondary, 5 pending sources.
- Read in primary text and pinned in `snapshots/`: Rev. Proc. 2025-32 sec. 4.33 (2026 token amounts), Pub. 1771 (Rev. 11-2023), Form 990 instructions (TY2025), Schedule M instructions (TY2025), Form 8282 instructions (Rev. October 2021), Pub. 561 (Rev. December 2025), Pub. 598 (Rev. March 2021), Pub. 4221-PC (Rev. 3-2018).
- Baseline watcher run from the build environment. FASB, CASE, and the legacy UCOA URL refused automated requests (403) there; the first GitHub Actions run will show whether they also refuse GitHub. If they do, they stay on the "check by hand" list each quarter.
- Wayback captures could not be made from the build environment; the watcher retries them automatically on the next run.
- Independent fact-check (separate reviewer, same day) corrected: the Form 8282 three-year clock (runs from receipt, not from signing Form 8283) and its exceptions; the campaign-and-disclosure condition on the token and 2% safe harbors; the missing membership-benefits exception and $250 acknowledgment contents; Treas. Reg. 1.513-4 paragraph numbers; the contribution-vs-exchange indicator table (pre-2018 indicators moved to "practice judgment"); CASE bequest and multi-year pledge counting; 2025 tax-law carryforward and exclusions. Resolved paragraph numbers: 958-605-25-5E, 25-5C, 45-4A, 45-4B, 15-6(e), 25-19.
- Open verification backlog:
  - Read the ASC paragraphs cited as `secondary` in Basic View and upgrade them (FASB login required).
  - Confirm ASC 958-605-25-16 (contributed services criteria).
  - Confirm Rev. Proc. 90-12's cash-equivalent statement against the IRS copy.
  - Confirm the current home of the UCOA and the FASB ASU index URL.
  - Read the CASE Global Reporting Standards (current edition) before citing specific counting rules in client policy.
