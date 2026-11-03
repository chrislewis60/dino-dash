---
name: deliver
description: 'Deliver one change through Playbook with a spec, acceptance tests, review, evidence, handover and human gates.'
agent: Playbook
argument-hint: 'Change to deliver or specification to implement'
---

Follow [Playbook](../agents/playbook.agent.md) for this one change:

${input:change:Describe the change or specification}

Check [readiness](../../docs/delivery/readiness.md) before Understand. Missing G0,
pending G1-G4 and unknowns remain release blockers, not permission to guess.
Request G1 for the current spec/evidence version, then continue safe authorised
local Build/Test while it is pending. This invocation approves no gate.
Before G5, stop while blockers remain; do not release without explicit G5 and a
verified project release/rollback procedure.
