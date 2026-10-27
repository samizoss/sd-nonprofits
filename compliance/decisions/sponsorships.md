---
title: Corporate sponsorships
question: Is this sponsor payment a gift, a qualified sponsorship payment, or taxable advertising income, and how do I book it?
cites: [irc-513i, pub-598, asc-958-605, asc-606]
citations:
  - ref: "IRC 513(i)"
    covers: "qualified sponsorship payments are excluded from unrelated business income"
    verified: primary
  - ref: "Treas. Reg. 1.513-4(c)(1)"
    covers: "definition: payment by a business with no arrangement or expectation of a substantial return benefit"
    verified: primary
  - ref: "Treas. Reg. 1.513-4(c)(2)(ii)"
    covers: "benefits worth 2% of the payment or less are disregarded"
    verified: secondary
  - ref: "Treas. Reg. 1.513-4(d)(1)"
    covers: "if there IS a substantial return benefit, only the excess over its FMV qualifies, and only if the org can establish that FMV"
    verified: primary
  - ref: "Treas. Reg. 1.513-4(c)(2)(vi)(A) and (B)"
    covers: "exclusive sponsor is acknowledgment; exclusive provider is a substantial return benefit"
    verified: primary
  - ref: "Treas. Reg. 1.513-4(e)(2)"
    covers: "payments contingent on attendance, ratings, or public exposure are never qualified sponsorship payments"
    verified: primary
  - ref: "Treas. Reg. 1.513-4(b)"
    covers: "periodical advertising and qualified convention/trade-show activity are outside the safe harbor"
    verified: secondary
publish: true
summary: >-
  A business can be thanked by name and logo without its payment becoming taxable income. Once the sponsor gets
  advertising, an exclusive-provider deal, or other benefits worth more than 2% of the payment, the value of those
  benefits is treated differently for tax purposes and as exchange revenue in the books.
ask_your_pro:
  - "Does any language in our sponsor materials count as advertising rather than acknowledgment?"
  - "What is the fair market value of the benefits in each sponsorship tier?"
  - "If part of a payment is not a qualified sponsorship payment, is it unrelated business income for us?"
  - "Does this agreement create an exclusive-provider arrangement?"
steps:
  - text: "What does the sponsor receive?"
    sub:
      - "Only name, logo, and neutral acknowledgment: a qualified sponsorship payment, not unrelated business income."
      - "Other benefits: go to the next question."
  - text: "Are all benefits together worth 2% of the payment or less?"
    sub:
      - "Yes: the benefits are disregarded; the payment is a qualified sponsorship payment."
      - "No: the sponsor received a substantial return benefit. Go to the next question."
  - text: "Can the organization establish the fair market value of those benefits?"
    sub:
      - "Yes: the amount above that value is a qualified sponsorship payment; the benefit value may be unrelated business income unless an exception applies."
      - "No: no portion of the payment qualifies."
  - "Payments that depend on attendance or ratings, and ads in the organization's periodicals, never qualify."
last_verified: 2026-10-19
watch: occasional
---

# Corporate sponsorships

Sponsorships need two separate answers: one for the IRS (is any of this taxable unrelated business income?) and one for GAAP (how much is contribution vs. exchange revenue?). They usually line up, but they are different tests.

## The rule in one line

A business can be thanked by name and logo without the payment becoming taxable. Once the business receives advertising, exclusivity as a provider, or other benefits worth more than 2% of the payment, the value of those benefits stops being a qualified sponsorship payment.

## Decision tree (IRS side)

```mermaid
flowchart TD
    A[Payment from a business] --> B{What does the sponsor get?}
    B -- Name, logo, neutral<br/>product-line acknowledgment --> Q[Qualified sponsorship payment<br/>not UBI]
    B -- Other benefits --> C{Total FMV of benefits<br/>2% of payment or less?}
    C -- Yes --> Q
    C -- No --> D{Advertising: comparative or<br/>qualitative language, prices,<br/>endorsements, calls to buy?<br/>Or exclusive-provider deal?}
    D -- Yes --> E[Substantial return benefit]
    D -- No --> E2[Substantial return benefit<br/>tickets, hospitality, services]
    E --> V{Can the org establish the<br/>FMV of the benefit?}
    E2 --> V
    V -- Yes --> S[Excess over FMV = qualified sponsorship<br/>FMV portion = potential UBI,<br/>unless an exception applies]
    V -- No --> X[No portion qualifies]
```

## Acknowledgment vs. advertising

| Allowed (acknowledgment) | Turns it into advertising |
|---|---|
| Sponsor name, logo, slogan that doesn't compare or praise | Qualitative or comparative descriptions ("the best coffee in town") |
| Address, phone, website | Price information or discounts |
| Value-neutral list of product lines | Endorsements |
| Display or distribution of the sponsor's products at the event | Inducements to buy, sell, or use the products |
| Exclusive *sponsor* of the event | Exclusive *provider* arrangement (only their product may be sold or used) |

Two things are never qualified sponsorship payments, whatever the sponsor receives:

- **Contingent payments.** A payment whose amount depends on attendance, broadcast ratings, or other measures of public exposure. (A payment can depend on the event actually happening.)
- **Periodical ads and trade shows.** Payments for ads in the organization's magazines or newsletters, and qualified convention or trade-show activity, fall under other rules.

A payment that is not a qualified sponsorship payment is not automatically taxable. It is unrelated business income only if the activity is a regularly carried on trade or business; a one-time event often isn't. Run that question with the tax preparer.

## GAAP side

- **Benefits with real value** (tickets, tables, booth space, hospitality, advertising): that portion is an exchange, recognized under ASC 606 when the benefit is delivered.
- **The remainder** is a contribution, and may be restricted if the sponsor tied it to a specific program.
- Acknowledgment alone (name and logo) is generally not treated as commensurate value, so a pure name-and-logo sponsorship is usually entirely a contribution.

## Sponsorship packet checklist

- [ ] List every benefit in each sponsorship tier with an estimated fair value
- [ ] Check each tier's benefits against the 2% test
- [ ] Review the sponsor-facing copy for advertising language before it's printed
- [ ] Confirm no exclusive-provider language in the agreement unless the tax preparer has signed off
- [ ] Record the exchange and contribution portions separately at receipt

## Pin log

| Date | What changed | Source |
|---|---|---|
| 2026-10-19 | Fact-check corrections: paragraph numbers fixed to (c)(2)(ii), (d)(1), (c)(2)(vi); contingent-payment and periodical/trade-show exclusions added | eCFR text of 26 CFR 1.513-4, read 2026-10-19 |
| 2026-10-19 | File created | IRS pages "Advertising or qualified sponsorship payments?" and "Exclusive provider arrangement within qualified sponsorship agreements"; CapinCrouse and The Tax Adviser summaries of Treas. Reg. 1.513-4. GAAP split is standard practice, not a quoted standard |
