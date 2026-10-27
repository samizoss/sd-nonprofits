---
title: In-kind gifts (contributed nonfinancial assets)
question: Do I record this noncash gift, at what value, and what IRS paperwork follows it?
cites: [asc-958-605, asu-2020-07, asc-958-205, form-8282-8283, form-990-schedule-m, pub-561, pub-1771]
citations:
  - ref: "ASU 2020-07; ASC 958-205-45-36; ASC 958-605-45-7A"
    covers: "contributed nonfinancial assets presented as a separate line in the statement of activities"
    verified: primary
  - ref: "ASC 958-605-50-1A"
    covers: "disclosures by category: use vs. monetize policy, donor restrictions, valuation techniques"
    verified: primary
  - ref: "ASC 958-605-25-19"
    covers: "collection items need not be recognized when the collections criteria are met"
    verified: secondary
  - ref: "ASC 958-605-25-16"
    covers: "contributed services are recognized only if they create or enhance nonfinancial assets, or require specialized skills, are provided by people with those skills, and would typically be purchased"
    verified: secondary
  - ref: "Form 8282 / 8283 instructions; IRS charities page on noncash contributions"
    covers: "3-year disposal reporting; 125-day deadline; who signs Section B"
    verified: primary
  - ref: "Schedule M (Form 990) instructions, tax year 2025, p. 3"
    covers: "who must file Schedule M"
    verified: primary
publish: true
summary: >-
  Donated goods, use of facilities, and qualifying services are recorded at fair value and shown on their own line,
  apart from cash gifts. General volunteer time is not recorded. Separate IRS rules (Forms 8283 and 8282, Schedule M)
  apply on their own thresholds.
ask_your_pro:
  - "Do these donated services meet the recognition criteria, and how should we value them?"
  - "What valuation method and inputs should we document for this donated item?"
  - "We are selling an item for which we signed Form 8283 Section B. Do we need to file Form 8282?"
steps:
  - text: "Is the gift goods, use of facilities, or services?"
    sub:
      - "Goods or use of facilities: record at fair value on a separate line for contributed nonfinancial assets."
      - "Services: go to the next question."
  - text: "Do the services create or enhance a nonfinancial asset, or require specialized skills, provided by people with those skills, that the organization would otherwise have to buy?"
    sub:
      - "Yes: record at fair value."
      - "No: do not record. Track volunteer hours for narrative reporting only."
  - "Check whether the donor restricted how the item may be used or sold; if so, record it with donor restrictions."
  - "If the gift was over $5,000 and the organization signed Form 8283 Section B, flag it: a sale or disposal within 3 years of receipt generally requires Form 8282 within 125 days."
last_verified: 2026-10-19
watch: occasional
---

# In-kind gifts

## The rule in one line

Record donated goods, use of facilities, and qualifying services at fair value when received, show them on their own line apart from cash gifts, and disclose them by category. Exception: contributed collection items (art, historical treasures) that meet the collections criteria in 958-605-25-19 need not be recognized; that matters for museums and historical societies. The IRS side (Forms 8283 and 8282, Schedule M) runs on separate thresholds.

## Decision tree

```mermaid
flowchart TD
    A[Noncash gift arrives] --> B{Goods, use of facilities,<br/>or services?}
    B -- Goods or facilities --> G[Record at fair value<br/>separate CNFA line]
    B -- Services --> S{Do the services create or enhance<br/>a nonfinancial asset, OR require<br/>specialized skills the org would<br/>otherwise buy?}
    S -- Yes --> G
    S -- No --> N[Do not record<br/>general volunteer time;<br/>track hours for narrative only]
    G --> R{Donor restricted how<br/>it may be used or sold?}
    R -- Yes --> RR[With donor restrictions]
    R -- No --> RW[Without donor restrictions]
    G --> T{Over $5,000 and the org<br/>signed Form 8283 Section B?}
    T -- Yes --> F[Flag the asset:<br/>if sold or disposed within 3 years of receipt,<br/>file Form 8282 within 125 days<br/>unless an exception applies]
```

## Valuation

- Use fair value at the date of the gift. The organization values the gift for its books; that is independent of what the donor claims.
- The organization should not state a dollar value on the donor's acknowledgment for noncash gifts. Describe the item; valuation is the donor's job (see Pub. 1771 and Pub. 561).
- A donor's appraisal can inform your fair value but doesn't bind you.
- Document the valuation technique and inputs; ASU 2020-07 requires disclosing them.

## Disclosure checklist (ASU 2020-07)

For each category of contributed nonfinancial assets recognized:

- [ ] Amount, by category (e.g., food, supplies, professional services, facilities)
- [ ] Whether the items were used or sold during the period; for items used, which programs or activities used them
- [ ] The organization's policy, if any, on selling rather than using donated items
- [ ] Any donor restrictions attached
- [ ] Valuation techniques and inputs, and the principal market used if the organization is barred from selling or using the item there

## IRS paperwork that follows the gift

| Trigger | Requirement | Row in volatile-values.md |
|---|---|---|
| Donor's noncash gift over $5,000 | Org signs Form 8283 Section B (acknowledging receipt, not value) | `form-8283-b` |
| Org sells or disposes of that property within 3 years of receiving it | File Form 8282 within 125 days; send the donor a copy. Not required for items the donor certified at $500 or less, or items consumed or distributed for charitable purposes | `form-8282` |
| Aggregate noncash gifts above the threshold, or any art, historical treasures, or conservation contributions | File Schedule M with Form 990 | `sched-m` |
| Noncash gift of $250+ | Written acknowledgment describing the property (no value) | `cwa-threshold` |

## Coding notes

- Use separate revenue accounts for contributed nonfinancial assets so the statement of activities line comes straight from the GL.
- Offset to the matching expense (if consumed) or asset (if held) at the same fair value.
- Keep a disposal log for items received with a signed Form 8283 Section B; the 3-year clock is easy to miss.
- Services from an affiliate's personnel that directly benefit the organization follow a separate rule; ask your accountant if an affiliated organization lends you staff.
- Volunteer hours that don't meet the services test can still appear in narrative reporting and grant match documentation; they just don't hit the GL.

## Pin log

| Date | What changed | Source |
|---|---|---|
| 2026-10-27 | Services criteria (958-605-25-16) confirmed; pending removed | PwC Viewpoint NP 7.5 (quotes 958-605-25-16); The CPA Journal, May 2022 |
| 2026-10-19 | Form 8282 clock corrected to date of receipt; exceptions added; collections exception added | Form 8282 instructions (pinned); independent review |
| 2026-10-19 | File created | ASU 2020-07 (FASB storage PDF, read via search excerpt); Moss Adams and IRS pages on Forms 8282/8283; Schedule M instructions (2024; 2025 draft). ASC 958-605-25-16 services criteria from memory, pending verification |
