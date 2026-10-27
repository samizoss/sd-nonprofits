---
title: Quid pro quo gifts, events, and acknowledgments
question: How much of this payment is a gift, and what must the receipt say?
cites: [irc-170f8, irc-6115, irc-6714, rev-proc-90-12, rev-proc-2025-32, pub-1771, asc-958-605, asc-606]
citations:
  - ref: "IRC 170(f)(8)"
    covers: "donor needs a contemporaneous written acknowledgment for any single gift of $250+"
    verified: secondary
  - ref: "IRC 6115"
    covers: "charity must give a written disclosure when a payment over $75 is partly a gift and partly for goods/services"
    verified: secondary
  - ref: "IRC 6714"
    covers: "penalty $10 per contribution, capped at $5,000 per event or mailing; reasonable-cause exception"
    verified: primary
  - ref: "Rev. Proc. 90-12 (as amplified and modified) + annual inflation Rev. Proc."
    covers: "token-item and 2% safe harbors for insubstantial benefits"
    verified: secondary
  - ref: "Rev. Proc. 2025-32, sec. 4.33"
    covers: "2026 amounts for the safe harbors: $13.90 / $69.50 / $139"
    verified: primary
  - ref: "IRS Pub. 1771 (Rev. 11-2023), PDF pp. 3-6 and 9"
    covers: "$250 acknowledgment and its required contents, over-$75 disclosure, safe-harbor conditions, membership exception, $10 / $5,000 penalty"
    verified: primary
publish: true
summary: >-
  When a donor gets something back, only the amount above the fair market value of what they received is a gift.
  For payments over $75, the charity must tell the donor that in writing, unless the benefit is small enough to
  ignore under the IRS safe harbors. Receipts for gifts of $250 or more must say whether anything was provided in return.
ask_your_pro:
  - "What is a defensible fair market value for the benefits at our event (meal, entertainment, auction items)?"
  - "Do our token gifts or membership benefits qualify as insubstantial under the IRS safe harbors?"
  - "Does our receipt and disclosure language meet the IRS requirements?"
  - "How should event revenue and expenses be reported on Form 990 Part VIII?"
steps:
  - text: "Did the donor receive goods or services?"
    sub:
      - "No: the full amount is a gift. A gift of $250 or more needs a written acknowledgment."
      - "Yes: go to the next question."
  - text: "Is the benefit insubstantial under a safe harbor (token items, the 2% test, or the membership exception), and was the payment part of a campaign that told donors the deductible amount?"
    sub:
      - "Yes: treat the full amount as a gift."
      - "No: go to the next question."
  - "Was the only benefit an intangible religious benefit? If so, it is a full gift and the acknowledgment says so."
  - "Otherwise, split the payment: fair market value of the benefit is exchange revenue; the rest is a contribution."
  - "If the payment was over $75, give the donor a written disclosure with the deductible amount and a good-faith estimate of the benefit's value."
last_verified: 2026-10-19
watch: annual
---

# Quid pro quo gifts, events, and acknowledgments

## The rule in one line

When a donor gets something back, only the amount above the fair market value of what they received is a gift. If the payment is over $75, the charity must tell the donor that in writing, unless the benefit is small enough to ignore under the IRS safe harbors.

## Decision tree

```mermaid
flowchart TD
    A[Payment received] --> B{Did the donor receive<br/>goods or services?}
    B -- No --> G[Full amount is a gift<br/>$250+ needs written acknowledgment]
    B -- Yes --> C{Insubstantial under a safe harbor?<br/>token items OR 2% test<br/>see volatile-values.md}
    C -- Yes --> G
    C -- No --> D{Intangible religious benefit only?}
    D -- Yes --> G2[Full gift; acknowledgment<br/>states that only an intangible<br/>religious benefit was provided]
    D -- No --> E[Split: FMV of benefit = exchange<br/>remainder = contribution]
    E --> F{Payment over $75?}
    F -- Yes --> Q[Written disclosure required:<br/>deductible amount is limited to the excess;<br/>good-faith estimate of FMV]
    F -- No --> Q2[No 6115 disclosure required,<br/>but still record the split]
```

## Safe harbors for ignoring a benefit

Use the current year's figures in `volatile-values.md` (rows `low-cost-article`, `token-min-payment`, `two-percent-cap`, `membership-exception`).

**Both of the first two safe harbors only apply when** the payment is made as part of a fundraising campaign **and** the charity tells the donor how much of the payment is deductible (Pub. 1771, PDF p. 6; Rev. Proc. 90-12 sec. 3). Without that statement, value the benefit.

1. **Token items.** The donor pays at least the minimum, receives only items bearing the org's name or logo (mug, calendar, tote), and the org's total cost for those items is within the low-cost article ceiling. Measured by the charity's cost, not the item's retail value.
2. **2% test.** The fair market value of everything the donor receives is no more than 2% of the payment and no more than the annual dollar cap.
3. **Free, unordered items** mailed with a solicitation fall within the low-cost article rules (Rev. Proc. 92-49).
4. **Membership-benefits exception.** An annual payment of $75 or less that buys only recurring member privileges (free or discounted admission, gift-shop or parking discounts, member-only events within the low-cost limits) is treated as insubstantial. Membership dues at that level don't need to be split (Pub. 1771, PDF p. 6).

Rev. Proc. 90-12 states that benefits in cash or cash equivalents are never insubstantial (text read via the Tax Notes reproduction; not yet checked against the IRS copy). Treat gift cards as valued benefits.

## What the $250+ acknowledgment must say (Pub. 1771, PDF pp. 3-5)

- Name of the organization and the amount of cash, or a description (not the value) of noncash property.
- **A statement of whether the organization provided any goods or services in return.** This is the element receipts most often miss. "No goods or services were provided" is enough when true.
- If goods or services were provided: a description and good-faith estimate of their value, or a statement that only intangible religious benefits were provided.
- It must reach the donor by the earlier of the date they file their return or the return's due date (with extensions).

## What the written disclosure must say (payments over $75)

- The deductible amount is limited to what the donor paid in excess of the value of the goods or services received.
- A good-faith estimate of that value.
- It can be combined with the $250 acknowledgment in one letter.

## Event coding

| Item | Treatment |
|---|---|
| Gala ticket | Split at the ticket's fair value of the benefits (meal, entertainment): exchange revenue for the benefit, contribution for the rest |
| Auction item purchase | Buyer's payment above the item's fair value is a contribution; up to fair value is exchange revenue. Donated auction item is an in-kind gift recorded when received |
| Sponsorship of the event | See `sponsorships.md` |
| Raffle ticket | Not a contribution at all; gaming rules apply |
| Donor declines the benefit at purchase | If declined in advance and the org documents it, the full amount can be a gift. Not attending, without declining, doesn't count |

Fair value is what the benefit would cost in a normal market (a comparable dinner at a comparable venue), not what the org paid. A donated venue doesn't make the dinner worth $0.

## Coding notes

- Book the exchange and contribution portions to separate accounts at receipt. Most CRMs support a "non-deductible" or "benefit value" field on the gift; map it to the exchange account in the GL integration.
- On Form 990, the contribution portion of event payments goes on Part VIII line 1c (and is shown again in parentheses on line 8a); the exchange portion goes on line 8a, with direct benefit costs on line 8b. Keep event expenses tagged to the event; indirect fundraising costs go in Part IX column (D), not line 8b. If donors receive only items of nominal value, the whole amount is reported as contributions and nothing goes on line 8 (Instructions for Form 990, TY2025, PDF pp. 38 and 41).
- Keep the fair-value estimate memo for each event with the event's records.

## Pin log

| Date | What changed | Source |
|---|---|---|
| 2026-10-19 | Fact-check corrections: campaign-and-disclosure condition on safe harbors, membership exception, acknowledgment content, cash-equivalent sourcing, Form 990 line placement | Independent review against Pub. 1771 (pinned) and Rev. Proc. 90-12 |
| 2026-10-19 | File created | IRC 6714 text (Tax Notes); Pub. 1771 (Rev. 11-2023) and Rev. Proc. 2025-32 read from IRS PDFs pinned in `snapshots/`; NC Bar summary of 6115 |
