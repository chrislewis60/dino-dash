---
name: write-acceptance-tests
description: 'Use before implementing new behaviour to write AC-tagged tests, execute them and capture actual failing evidence without fabricating a retrospective TDD history.'
user-invocable: false
---

# Write acceptance tests

Read the [standard](../../../docs/standards/delivery.md), current spec and existing
tests on the affected path. Use existing Vitest/Testing Library patterns.

For new behaviour add AC IDs to test names, include negative/boundary cases, run the
smallest relevant selection and capture real failure output. Check that the failure
proves missing behaviour rather than an unrelated environment error.
For already-implemented baseline behaviour use honest existing-test mappings and
coverage gaps; do not deliberately break code to invent historical failing evidence.

Prepare G1 with the spec/version, ACs, failure evidence, questions and recommendation.
Pending approval stays a release blocker while safe local Build/Test can continue.

Output: tests and actual results, or explicit Unverified/manual proof gaps.
