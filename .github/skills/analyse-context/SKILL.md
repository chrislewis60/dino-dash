---
name: analyse-context
description: 'Use at Understand to trace a requested change through current source, tests and specs, identify scope, risks and evidence-backed unknowns.'
user-invocable: false
---

# Analyse context

Read the [standard](../../../docs/standards/delivery.md), profile, architecture,
relevant baseline spec and [open questions](../../../docs/registers/open-questions.md).
Inspect source/tests and dirty changes on the actual affected path.

State the problem, users, expected outcome, in/out of scope and Small/Standard/
Significant classification with reason. Map all affected engine/UI/config/test
surfaces. Separate fact from inferred intent; ask missing decisions with a question tool.
Consider security, input/lifecycle, accessibility, performance and failure boundaries.

Output: concise context in the run/spec, source revision/dirty state, provisional
assumptions and owned release blockers. Do not invent business policy or fix old gaps.
