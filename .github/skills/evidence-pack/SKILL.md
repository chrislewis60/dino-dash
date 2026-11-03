---
name: evidence-pack
description: 'Use for G1-G3 to assemble versioned evidence, findings, release blockers and a reasoned recommendation without manufacturing human approval.'
user-invocable: false
---

# Evidence pack

Read the [standard](../../../docs/standards/delivery.md) and
[template](../../../docs/templates/evidence-pack.md).
Create a versioned pack under the current delivery run.

Include spec/candidate versions, AC-to-result mapping, exact invocations/results,
review findings, skipped checks, standard version and all current release blockers.
Use actual tool output; unsupported claims are Unverified.

Recommend Approve, Approve with conditions, Request changes, Reject or Escalate
with evidence-linked reasons. Insufficient evidence requires Escalate. Request the
correct named human roles; leave Waiting for human until explicit decisions are
recorded. Changing evidence invalidates affected approvals.

Output: reviewable evidence pack, recommendation and decision fields.
