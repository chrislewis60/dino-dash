---
name: define-acceptance-criteria
description: 'Use to turn agreed requirements into stable, observable Given/When/Then criteria with negative cases, boundaries and explicit evidence mappings.'
user-invocable: false
---

# Define acceptance criteria

Read the [standard](../../../docs/standards/delivery.md) and
[spec template](../../../docs/templates/specification.md).
Use SPEC-prefixed requirement/AC IDs and do not renumber established IDs.

Give each requirement at least one measurable criterion. Include invalid/missing
input, timing/rounding boundaries and relevant dependency failures. Complex rules
need a precedence table with row-to-test mapping. Avoid implementation prescriptions
unless they are actual constraints.

Identify unit/integration/manual proof for each AC. Proposed thresholds stay Proposed
with an owner. Unanswered questions remain release blockers, not agent decisions.

Output: ACs, Covers mappings, verification plan and owned unknowns.
