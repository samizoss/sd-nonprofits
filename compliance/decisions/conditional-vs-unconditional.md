---
title: Conditional or unconditional?
question: When do I record a contribution as revenue?
cites: [asc-958-605, asu-2018-08]
citations:
  - ref: "ASC 958-605-25-5A"
    covers: "a contribution is conditional only if it has BOTH a barrier and a right of return or release"
    verified: secondary
  - ref: "ASC 958-605-25-5D"
    covers: "indicators that an agreement contains a barrier"
    verified: secondary
  - ref: "ASC 958-605-25-11"
    covers: "conditional promises are recognized when the conditions are substantially met"
    verified: secondary
  - ref: "ASC 958-605-25-5E"
    covers: "ambiguous stipulations are presumed conditional"
    verified: secondary
  - ref: "ASC 958-605-25-5C"
    covers: "how likely the org is to meet the barrier is not considered"
    verified: secondary
publish: true
summary: >-
  A contribution is conditional only when the agreement has both a barrier the organization must clear and a right
  for the donor to take the money back (or not pay) if the barrier is not cleared. If either piece is missing, the
  gift is recorded when it is received or promised.
ask_your_pro:
  - "Does this grant agreement contain a measurable barrier, and does the funder have a right of return or release?"
  - "Should cash we received in advance on this grant sit in a refundable advance (liability) until the barrier is met?"
  - "Which parts of this agreement are conditional and which are unconditional?"
steps:
  - text: "Is there a barrier the organization must overcome to be entitled to the money?"
    sub:
      - "No: the contribution is unconditional. Record it now, then check for donor restrictions."
      - "Yes: go to the next question."
  - text: "Does the donor have a right of return, or a right to be released from paying, if the barrier is not met?"
    sub:
      - "No: the contribution is unconditional."
      - "Yes: the contribution is conditional. Record no revenue yet; cash received is a refundable advance."
  - "When the barrier is substantially met, the contribution becomes unconditional and is recorded as revenue."
last_verified: 2026-10-19
watch: asu
---

# Conditional or unconditional?

## The rule in one line

A contribution is conditional only when the agreement has **both** a barrier the organization must overcome **and** a right for the donor to get the money back (or to be released from paying) if the barrier isn't met. If either piece is missing, it's unconditional and is recorded when received or promised.

## Decision tree

```mermaid
flowchart TD
    A[It is a contribution] --> B{Is there a barrier the org<br/>must overcome to be entitled<br/>to the money?}
    B -- No --> U[Unconditional<br/>record revenue now<br/>then check restrictions]
    B -- Yes --> C{Does the donor have a right<br/>of return, or a right to be<br/>released from paying,<br/>if the barrier isn't met?}
    C -- No --> U
    C -- Yes --> K[Conditional<br/>no revenue yet<br/>cash received = refundable advance liability]
    K --> M{Barrier substantially met?}
    M -- Yes --> U
```

## Indicators of a barrier (weigh together; none is decisive)

1. **A measurable, performance-related target.** Examples: serve 500 households, raise a matching amount, hold a specified number of sessions.
2. **Limited discretion over how the activity is carried out.** Example: the agreement dictates staffing qualifications or protocols in detail.
3. **The stipulation is tied to the purpose of the agreement.** Administrative requirements such as routine reporting usually are not barriers.

## Common cases

| Agreement language | Barrier? | Return or release? | Result |
|---|---|---|---|
| "Grant of $100,000 to be paid as costs are incurred; unspent funds revert" | Yes: incurring qualifying costs | Yes | Conditional; recognize as costs are incurred |
| "$50,000 if you raise $50,000 in matching gifts by June 30" | Yes: the match | Yes: no payment if unmet | Conditional until the match is raised |
| "$25,000 for the literacy program; submit an annual report" | No: the report is administrative | Doesn't matter | Unconditional, purpose-restricted |
| "$10,000; return any amount not used for the program" | No measurable barrier | Yes | Unconditional, restricted. A right of return alone does not make it conditional |
| Multi-year pledge with no conditions | No | No | Unconditional; implied time restriction (see `restricted-vs-unrestricted.md`) |

## Coding notes

- Cash received on a conditional grant goes to a refundable advance (liability), not revenue.
- Conditional promises not yet received are not recorded at all; they are disclosed in the notes.
- Partly conditional agreements are common: recognize the unconditional piece now and the conditional piece as each barrier is met.
- If an agreement is ambiguous about whether a stipulation is a barrier, the standard presumes the contribution is conditional (958-605-25-5E).
- How likely the organization is to meet the barrier doesn't matter. A barrier you will certainly clear is still a barrier (958-605-25-5C).
- Federal cost-reimbursement grants are the classic conditional contribution. They are not exchanges just because they come from government.

## Pin log

| Date | What changed | Source |
|---|---|---|
| 2026-10-19 | Ambiguity rule confirmed at 25-5E; probability rule (25-5C) added | Independent review against ASU 2018-08 (FASB PDF) |
| 2026-10-19 | File created | ASU 2018-08 via BDO bulletin and PwC Viewpoint (NP 6.6); primary ASC text not yet read here |
