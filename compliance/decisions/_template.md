---
title: <Question as a short title>
question: <The decision this file answers, as a question>
cites: [<source ids from sources.yaml>]
citations:
  - ref: "<stable citation, e.g. ASC 958-605-25-5A or IRC 6115>"
    covers: "<what this citation settles, in your words>"
    verified: pending   # primary | secondary | pending
last_verified: YYYY-MM-DD
watch: static          # annual | asu | occasional | static
publish: false         # true only when no citation is pending
summary: >-
  <2-3 plain-language sentences shown at the top of the public page>
ask_your_pro:
  - "<specific question for an accountant or attorney>"
steps:
  - text: "<question>"
    sub:
      - "<answer and outcome>"
---

# <Title>

## The rule in one line

<Paraphrase. No pasted rule text.>

## Decision tree

```mermaid
flowchart TD
    A[Start] --> B{Question?}
    B -- Yes --> C[Outcome]
    B -- No --> D[Outcome]
```

## Common cases

| Situation | Usual answer | Why |
|---|---|---|

## Coding notes

-

## Pin log

| Date | What changed | Source |
|---|---|---|
| YYYY-MM-DD | File created | |
