---
name: validate-tests
description: 'Use at Test to execute the smallest relevant checks, trace actual results to ACs and distinguish unexpected failures from unverified capability.'
user-invocable: false
---

# Validate tests

Read the [standard](../../../docs/standards/delivery.md), profile and current spec.
Run relevant tests through available test integration or the verified runner;
combine related selectors, escalating only when evidence warrants it.

For code changes run applicable build/type-check and lint. For documentation/
customisation changes run the local documentation contracts. Capture command,
candidate/dirty state, UTC time, exit status, summary and AC mapping.
Unexpected failures stay visible; never relabel skipped checks as passed.

Check required negative/boundary cases and exact thresholds, not just suite success.
Prepare G3 evidence and carry missing checks/decisions as release blockers.

Output: actual results, coverage gaps and reasoned quality recommendation.
