---
name: assess-delivery-readiness
description: 'Use to create or refresh versioned G0 readiness, named human decisions, stage prerequisites, exceptions and release blockers.'
user-invocable: false
---

# Assess delivery readiness

Read the [standard](../../../docs/standards/delivery.md), current profile,
architecture, [exceptions](../../../docs/registers/exceptions.md) and
[readiness template](../../../docs/templates/readiness.md).

Check evidence for purpose, commands, policies, authority, host discovery, toolkit,
review/retention, applicable checks and deployment/rollback. Missing required
capabilities are Unverified/Blocked, not passing or automatically inapplicable.
Increment readiness for material context changes; identify stale approvals.

Request explicit G0 from a named project owner for this exact version and exception
list. Until supplied record Waiting for human; do not guess authority or grant risk
acceptance. Safe local work can continue, but open items remain release blockers.

Output: reconciled readiness record, evidence references, decisions and owned gaps.
