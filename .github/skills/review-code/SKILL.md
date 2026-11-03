---
name: review-code
description: 'Use at Review to compare the actual change with its spec, detect correctness/lifecycle/regression risks and record evidence-backed findings.'
user-invocable: false
---

# Review code

Read the [standard](../../../docs/standards/delivery.md), spec and actual diff.
Review only in-scope changes and tightly coupled effects; preserve unrelated work.

Check correctness, state transitions, cleanup, type safety, rounding/timing,
error reporting and all affected surfaces. Verify tests prove the requirement,
not a proxy. Use existing specialists where expertise is needed; for structural
changes consult the Coupling Analyser. Do not delegate a trivial direct review.

Record location, impact, confidence, owner and blocking/non-blocking disposition.
An agent cannot accept its own findings. Fix authorised issues and rerun checks.

Output: review evidence/findings and G2 decision inputs, not an automatic approval.
