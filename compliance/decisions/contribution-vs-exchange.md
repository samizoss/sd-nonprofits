---
title: Contribution or exchange?
question: Is this incoming money a gift (ASC 958-605) or payment for something (ASC 606 or other guidance)?
cites: [asc-958-605, asu-2018-08, asc-606]
citations:
  - ref: "ASC 958-605-15-5A"
    covers: "indicators of contribution vs. exchange; what counts as commensurate value"
    verified: secondary
  - ref: "ASC 958-605-15-6(e)"
    covers: "payments from a third party on behalf of an identified customer are not contributions"
    verified: secondary
  - ref: "ASC 958-605-55-1A"
    covers: "FASB flowchart: contribution, exchange, or other; then conditional or not"
    verified: secondary
  - ref: "ASU 2018-08"
    covers: "the clarifications this file paraphrases"
    verified: secondary
publish: true
summary: >-
  Money that comes in is either a gift (a contribution) or payment for something the payer gets back (an exchange).
  It is an exchange only when the payer itself receives roughly equal value. Benefit to the public, to the funder's
  mission, or the good feeling of giving does not count as value received.
ask_your_pro:
  - "Does anything in this grant or contract give the funder goods or services of roughly equal value in return?"
  - "Is this a third-party payer arrangement (Medicaid, insurance, vouchers) that should be treated as exchange revenue?"
  - "How should we split payments that are part gift and part purchase, and where does each part go on Form 990 Part VIII?"
steps:
  - text: "Does the payer itself receive goods or services of roughly equal value?"
    sub:
      - "Yes: treat it as an exchange (ASC 606 or other revenue guidance)."
      - "No: go to the next question."
  - text: "Is the payer paying on behalf of an identified customer who receives the goods or services (for example Medicaid, insurance, or a tuition voucher)?"
    sub:
      - "Yes: treat it as an exchange with a third-party payer."
      - "No: it is a contribution. Next, decide whether it is conditional."
last_verified: 2026-10-19
watch: asu
---

# Contribution or exchange?

## The rule in one line

It is an exchange only if the party paying receives value of roughly equal worth in return. Benefit to the public, or to the payer's mission, does not count as value received.

## Decision tree

```mermaid
flowchart TD
    A[Money or assets come in] --> B{Does the payer itself get<br/>goods or services of<br/>commensurate value?}
    B -- Yes --> X[Exchange<br/>ASC 606 or other guidance]
    B -- No --> C{Is the payer paying on behalf of<br/>an identified customer who gets<br/>the goods or services?}
    C -- Yes --> Y[Exchange with a third-party payer<br/>e.g. Medicaid, insurance, tuition voucher<br/>958-605-15-6e]
    C -- No --> D[Contribution<br/>go to conditional-vs-unconditional.md]
```

## What does NOT count as value to the payer

ASU 2018-08 settled these, and they decide most grant questions:

- **Public benefit.** A foundation or government agency is not the same as the public. When the public benefits from what the money pays for, the funder has not received that value.
- **Mission fulfillment.** Advancing the funder's own mission is not value received.
- **Good feeling.** The donor's satisfaction from giving is not value received.

## Indicators in the current standard (958-605-15-5A, as rewritten by ASU 2018-08)

ASU 2018-08 replaced the older, longer indicator list. What the standard now says:

| Points toward exchange | Points toward contribution |
|---|---|
| Contract penalties for nonperformance go beyond returning the money transferred | The funder had full discretion over the amount; it wasn't set by the value of a deliverable |
| | The type of funder (foundation, government, corporation) doesn't matter on its own |

Plus the three "not value to the payer" rules above.

## Practice judgment (not in the current standard; use as supporting evidence only)

- Both parties described the deal as a purchase of goods or services at a negotiated price.
- The payer owns or directly uses the work product.
- The recipient solicited the money without offering anything of equal value back.

Older guides and audit memos still cite these from the pre-2018 indicator table. They can support a conclusion, but don't rest a memo on them alone.

## Common cases

| Situation | Usual answer | Why |
|---|---|---|
| Foundation program grant with reporting requirements | Contribution | Reporting is not value to the foundation; the public is the beneficiary |
| Government grant to run a public program | Contribution (often conditional) | Same reasoning; check for barriers next |
| Government contract to deliver services to the agency itself | Exchange | The agency receives the services |
| Medicaid or insurance reimbursement for client services | Exchange | Third-party payer on behalf of an identified customer |
| Sponsor payment with tickets, ads, or exclusive rights | Split: exchange for the benefits, contribution for the rest | See `sponsorships.md` |
| Gala ticket | Split: exchange for the meal and event, contribution for the rest | See `quid-pro-quo-and-events.md` |
| Membership dues with real member benefits | Split, or exchange if benefits roughly equal the dues | Value the benefits |

## Coding notes

- Exchange revenue goes in program service revenue, fees, or contract revenue lines, not contribution lines. That choice also drives Form 990 Part VIII (contributions on line 1, program service revenue on line 2).
- When you split a payment, record the two pieces separately at the time of receipt. Reconstructing the split at year-end is where errors come from.
- Write down which indicators drove the call. When the auditor asks, the memo is the evidence.

## Pin log

| Date | What changed | Source |
|---|---|---|
| 2026-10-19 | Fact-check corrections: indicator table reduced to what 958-605-15-5A now says; superseded indicators moved to "practice judgment"; third-party payer citation added | Independent review against ASU 2018-08 (FASB PDF) |
| 2026-10-19 | File created | ASU 2018-08 via BDO and PwC Viewpoint summaries; primary ASC text not yet read here |
