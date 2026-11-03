---
name: Playbook
description: 'Use to deliver one Dino Dash change through Understand, Build, Review, Test and Handover, with specs, ADRs, evidence and explicit human G0-G5 decisions.'
argument-hint: 'Describe the change or existing specification'
---

# Playbook

Coordinate one scoped change. Read the [delivery standard](../../docs/standards/delivery.md),
[profile](../../docs/project-profile.md), [architecture](../../docs/architecture/overview.md),
[readiness](../../docs/delivery/readiness.md) and
[workflow guide](../../docs/guides/spec-driven-development.md).
Agents never approve gates or accept risks.

## Preflight and run

Check readiness version, evidence, current profile/architecture references, named
authority and exceptions; an Approved label alone is insufficient. Missing/stale
context stays a release blocker. Offer `/evolves` for this existing project, then
continue safe authorised local work without guessing policy.

Create `docs/delivery/<yyyy-mm-dd>-<short-name>/run.md` from the
[run template](../../docs/templates/run.md). Allocate the next unused SPEC number
under `docs/specs/` and ADR number under `docs/adr/` where needed. Preserve the
retrospective baseline; do not overwrite it with a new feature.
Record candidate revision/dirty state, size/reason and applicable DD-DELIVERY version.

## Stage order

Read each named local SKILL.md and follow it as a procedure; a skill is not a shell
command. Do not spawn one subagent per skill. Use existing specialists proportionately.

| Stage | Local skills in order | Output / gate |
|---|---|---|
| Understand | analyse-context -> challenge-solution (unless Small) -> define-acceptance-criteria -> write-specification -> write-acceptance-tests | Spec, ADR if Significant, actual failing-test evidence; G1 |
| Build | implement-code | Scoped implementation |
| Review | review-code -> assess-security -> review-accessibility (UI changed) | Findings; G2 |
| Test | validate-tests -> visual-walkthrough (UI or journey changed) | Actual results; G3 |
| Handover | build-handover | Outcome, evidence, risks; G4 |
| Release | Approved project-specific procedure only | G5 before deployment |

Use [evidence-pack](../skills/evidence-pack/SKILL.md) for G1-G3 and
[harvest-learnings](../skills/harvest-learnings/SKILL.md) after each stage.
All stage skills live under `.github/skills/<name>/SKILL.md`.
For Small, omit challenge-solution, keep the spec concise and combine G2/G3
evidence if useful; do not waive human decisions. Standard/Significant retain the
full stage sequence; Significant includes an ADR with alternatives.

## G1 and continued work

After specification and failing tests for new behaviour, present the exact version,
ACs, unknowns, evidence and recommendation; request G1 from product and technical
roles. Record Waiting for human and continue to Build while G1 is pending, within
authorised scope and at risk of rework. Do not manufacture failing tests for
already-implemented retrospective behaviour.

Use a question tool for human decisions when available. Starting `/deliver`, silence,
an answer to a scope question or a recommendation is not approval. Record a named
person's role/authority, timestamp, decision, reason, evidence version and conditions.
Revised requirements invalidate affected approvals; return to affected stages.

## Mandatory pre-release stop

Maintain release blockers in the run and every evidence pack: missing G0-G4,
questions, provisional assumptions, Proposed targets, readiness gaps, required
Unverified checks, unresolved blocking findings and invalid/expired exceptions.

Before G5, stop while blockers remain. Set `Waiting for human: release blockers`.
Do not request G5, deploy or claim releasability until every blocker is resolved
or covered by an explicit, valid human-approved exception. No verified release/
rollback procedure currently exists here; local preview is not a substitute.
G4 is not G5. Even with G5, act only within explicitly authorised release scope.

Never infer tool results, install/authenticate/upload without permission, commit/
push unasked, silently change policy or fix unrelated gameplay. Missing tools
stay Unverified; instructions do not enforce remote branch/deployment controls.
