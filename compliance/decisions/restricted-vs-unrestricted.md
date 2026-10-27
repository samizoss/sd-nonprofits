---
title: With or without donor restrictions?
question: Which net asset class does this contribution go in, and when is the restriction released?
cites: [asc-958-205, asc-958-605, asu-2016-14, asu-2018-08]
citations:
  - ref: "ASU 2016-14 / ASC 958-205"
    covers: "two classes: with donor restrictions, without donor restrictions; board-designated disclosure"
    verified: secondary
  - ref: "ASC 958-605-45-4A"
    covers: "policy option: report restricted gifts whose restrictions are met in the same period as without restrictions"
    verified: secondary
  - ref: "ASC 958-605-45-5"
    covers: "implied time restriction on promises payable in future periods"
    verified: secondary
  - ref: "ASC 958-205-45-12"
    covers: "restriction on long-lived assets expires when the asset is placed in service"
    verified: secondary
  - ref: "ASC 958-605-45-4B"
    covers: "separate same-period election for contributions that were initially conditional"
    verified: secondary
publish: true
summary: >-
  Only a donor can restrict a gift, by limiting it to a purpose or time period narrower than the organization's
  mission. Board-designated money stays "without donor restrictions." Restricted amounts are released when the
  purpose is met or the time passes.
ask_your_pro:
  - "Has our organization elected the policy to report restricted gifts met in the same period as without donor restrictions?"
  - "Does this appeal or gift agreement create a donor restriction, or is it general support?"
  - "How should we document board-designated funds and their purposes in the financial statements?"
steps:
  - text: "Did the donor limit the purpose or timing more narrowly than the organization's mission?"
    sub:
      - "No, and it is not a promise payable in a future period: without donor restrictions."
      - "No, but it is a promise payable in a future period: with donor restrictions (implied time restriction)."
      - "Yes: go to the next question."
  - text: "Is the restriction perpetual, such as endowment corpus?"
    sub:
      - "Yes: with donor restrictions, perpetual. It is never released."
      - "No: with donor restrictions (purpose and/or time)."
  - text: "Was the restriction met in the same period it was received, and has the organization elected the same-period policy?"
    sub:
      - "Yes: it may be reported as without donor restrictions."
      - "No: release it to without donor restrictions when the purpose is met or the time passes."
last_verified: 2026-10-19
watch: asu
---

# With or without donor restrictions?

## The rule in one line

Only a donor can restrict a gift. A restriction exists when the donor limits the gift to a purpose or a time period more specific than the organization's general mission. The board can earmark unrestricted money, but that remains "without donor restrictions" (board-designated).

## Decision tree

```mermaid
flowchart TD
    A[Unconditional contribution] --> B{Did the DONOR limit<br/>purpose or timing more narrowly<br/>than the org's mission?}
    B -- No --> C{Is it a promise payable<br/>in a future period?}
    C -- Yes --> T[With donor restrictions<br/>implied time restriction]
    C -- No --> W[Without donor restrictions]
    B -- Yes --> P{Perpetual?<br/>e.g. endowment corpus}
    P -- Yes --> R2[With donor restrictions<br/>perpetual; never released]
    P -- No --> R1[With donor restrictions<br/>purpose and/or time]
    R1 --> S{Restriction met in the<br/>same period it was received,<br/>and the org elected the policy?}
    S -- Yes --> W
    S -- No --> REL[Release to without-restrictions<br/>when purpose met or time passes]
```

## Tests for whether the donor actually restricted it

- **Source documents decide.** Gift agreement, response card, appeal language, online form designation, email from the donor. Keep it with the gift record.
- **Appeal language counts.** If the appeal said "give to the new van fund," gifts responding to it are purpose-restricted even if the donor wrote nothing.
- **Mission-level purpose is not a restriction.** "For your programs" or "to support your work" at an org that only does that work is unrestricted.
- **Board action never creates a donor restriction.** Board-designated funds (operating reserve, quasi-endowment) stay without donor restrictions and are disclosed by amount and purpose.

## Release mechanics

| Restriction type | Released when |
|---|---|
| Purpose | Qualifying expenses are incurred |
| Time (explicit date) | The date passes |
| Time (implied, pledge payments) | The payment is due / received in the period it was meant for |
| Long-lived asset purchase | The asset is placed in service (unless the donor stipulated a longer restriction) |
| Perpetual (endowment corpus) | Never; earnings follow the gift instrument and state UPMIFA law |

## Same-period policy option

An organization can elect to report restricted gifts whose restriction is met in the same reporting period as "without donor restrictions," provided it treats investment gains the same way, applies the policy consistently, and discloses it (958-605-45-4A). ASU 2018-08 added a separate version of this election limited to gifts that started out conditional (958-605-45-4B). Note which policy, if any, each client has elected in their client file; it changes how you code every restricted gift.

## Coding notes

- Use a fund or class dimension in the GL for each restriction, not separate revenue accounts per fund. Revenue accounts describe the type of income; the fund dimension describes the restriction.
- Release entries are reclassifications between net asset classes, not revenue.
- A gift with both purpose and time restrictions is released only when both are satisfied.
- The CRM's "designation" field and the GL's restriction are not automatically the same thing. A CRM designation can be the donor's soft preference. Map designations to restriction status explicitly (see `gaap-vs-fundraising-counting.md`).

## Pin log

| Date | What changed | Source |
|---|---|---|
| 2026-10-19 | Same-period election paragraphs confirmed (45-4A, 45-4B); placed-in-service wording corrected | Independent review against ASU 2018-08 and ASU 2016-14 (FASB PDFs) |
| 2026-10-19 | File created | ASU 2016-14 summaries (Keiter, Warren Averett, GHJ); PwC Viewpoint excerpt of 958-605-45-4; primary ASC text not yet read here |
