---
title: GAAP vs. fundraising counting
question: Why doesn't "raised" in the CRM match "contribution revenue" in the financials, and which rule does each field follow?
cites: [asc-958-605, case-grs, asu-2018-08]
citations:
  - ref: "CASE Global Reporting Standards, 1st ed. (2021), 2024 update"
    covers: "counting categories (Funds Received, New Funds Committed), pledge and deferred-gift counting, campaign counting"
    verified: secondary
  - ref: "ASC 958-605"
    covers: "GAAP recognition: unconditional promises at present value; conditional promises not recognized"
    verified: secondary
publish: true
summary: >-
  Accounting rules (GAAP) and fundraising counting rules measure different things, so "raised" in a CRM rarely
  matches contribution revenue in the financial statements. Both are legitimate. Every report should say which
  rule it follows, and the two should be reconciled regularly.
ask_your_pro:
  - "Does our gift counting policy align with CASE standards, and where do we intentionally depart from them?"
  - "How should our CRM designations map to donor-restriction status in the general ledger?"
  - "What reconciliation between CRM totals and GL revenue will our auditor expect?"
steps:
  - "Decide which rule each report follows: GAAP for financial statements, a written counting policy for fundraising reports."
  - "Keep separate fields for the GAAP amount and the counting amount on each gift."
  - "Map each CRM designation to a donor-restriction status explicitly."
  - "Reconcile CRM totals to GL contribution revenue monthly, by reason (pledge timing, conditions, soft credits, benefit value, in-kind)."
last_verified: 2026-10-19
watch: occasional
---

# GAAP vs. fundraising counting

## The rule in one line

GAAP answers "what does the organization have a right to, and when?" Fundraising counting answers "what did fundraisers secure, and who gets credit?" Both are legitimate; they just measure different things. Every CRM field and every report should state which rule it follows.

## Where the two diverge

| Item | GAAP (ledger) | Fundraising counting (CRM, campaign reports) |
|---|---|---|
| Unconditional multi-year pledge | Full amount recognized when promised, discounted to present value, less an allowance | Counted at face value when documented. CASE's 2024 update removed the five-year cap, so New Funds Committed now includes the full documented pledge |
| Conditional pledge or grant | Not recognized until barriers are met | Often counted when committed, depending on the organization's counting policy |
| Revocable bequest intention | Not recognized | CASE counts documented bequest intentions in New Funds Committed; they reach Funds Received only when realized |
| Irrevocable deferred gifts (e.g., charitable remainder trusts) | Recognized under split-interest guidance at present value | Counted under specific CASE rules, often at face and present value |
| Soft credits (spouse, DAF advisor, board member who solicited) | Not a concept; one donor of record | Credit to multiple people for recognition and reporting |
| Gala ticket | Split into exchange and contribution | Often counted in full as "event revenue raised" |
| Matching gift from an employer | Contribution from the employer | Often soft-credited to the employee |
| In-kind gifts | Recognized at fair value per the in-kind rules | Counting policies vary; many organizations exclude them from cash goals |

## How to keep both straight in a system

1. **Two fields, not one.** Keep "GAAP amount" and "counting amount" separate on the gift record, or derive one from the other with documented rules. Never let a report silently mix them.
2. **Name the rule on every report.** "Raised (CASE counting)" and "Contribution revenue (GAAP)" are different report titles, and both are defensible.
3. **Reconcile monthly.** A one-page reconciliation from CRM "raised" to GL contribution revenue, by reason code (pledge timing, conditional, soft credit, benefit value, in-kind), catches coding errors early and is the document auditors ask for.
4. **Write a counting policy.** If the organization has no written counting policy, borrow CASE's as the starting point and note where you depart from it.
5. **Designation is not restriction.** A CRM designation can be a soft preference. Map each designation to a GAAP restriction status explicitly (see `restricted-vs-unrestricted.md`).

## Pin log

| Date | What changed | Source |
|---|---|---|
| 2026-10-19 | Bequest and multi-year pledge rows corrected to CASE's own descriptions | CASE 2024 update page; CASE Standards Spotlight (Jul/Aug 2024) |
| 2026-10-19 | File created | CASE pages on the Global Reporting Standards and the 2024 update; PG Calc review of the 1st edition. Specific CASE counting rules not read in the primary text; check the current edition before citing CASE rules in client policy |
