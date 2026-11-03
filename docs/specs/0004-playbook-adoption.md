# SPEC-004: Repository-local Playbook adoption

| Property | Value |
|---|---|
| Version / size | 1 / Significant: changes the delivery workflow, not game runtime |
| Status | Proposed; implementation authorised, formal gates awaiting humans |
| Recorded | 2026-11-03 |
| Decision | [ADR-0005](../adr/0005-agentic-delivery-playbook.md) |
| Rules | DD-DELIVERY v1, DD-01 through DD-16 |

## Context and scope

The user requested the reference project's full practical Playbook pattern and
selected the current dirty game as the observed baseline. Install an original local
adaptation, reconstruct specs and ADRs, preserve existing gameplay/agent changes.

In scope: onboarding/delivery agents and prompts, 17 focused procedures, standards,
templates, profile/readiness, traceability, evidence and known gaps.
Out: copying private policies/app code, installing runtime dependencies, changing
gameplay, provisioning infrastructure, automatically accepting gates or releasing.

## Requirements

| ID | Observable requirement |
|---|---|
| SPEC-004-R01 | Local prompt entry points route to the intended onboarding/delivery agents, with discoverable skill metadata. |
| SPEC-004-R02 | Specs distinguish observed requirements from proposals and link requirements, ACs and test/evidence mappings. |
| SPEC-004-R03 | ADRs distinguish inferred retrospective rationale from accepted historical decisions and contain real alternatives. |
| SPEC-004-R04 | Readiness, run and evidence records retain pending human decisions and release blockers without stopping safe local Build/Test. |
| SPEC-004-R05 | Tool commands reflect this repository; missing checks/host discovery remain Unverified, not passing. |
| SPEC-004-R06 | Reusable templates and automated local checks make future documentation maintainable. |

## Acceptance criteria

### SPEC-004-AC01

Covers: SPEC-004-R01.
Given the workspace files, then initiate/evolves route to Onboarding and deliver
to Playbook; all 17 skills have matching folder/name and a non-empty description.
No model is pinned. Agent instructions map all stages to available local skills.
Actual host discovery remains a separate live check.

### SPEC-004-AC02

Covers: SPEC-004-R02.
Given each baseline specification, then every requirement appears in a Covers
mapping, each AC has one verification row, and all referenced local files resolve.
Mappings disclose partial/Unverified coverage rather than fabricating tests.
No pre-existing test names are rewritten to imply historical AC IDs.

### SPEC-004-AC03

Covers: SPEC-004-R03.
Given ADRs 0001-0004, then they say Retrospective, inferred and awaiting review.
Given ADR 0005, then it says Proposed. All records include context, decision,
alternatives and consequences; none has invented historical deciders or approval.

### SPEC-004-AC04

Covers: SPEC-004-R04.
Given missing G0 or pending G1-G4, then workflow instructions retain release
blockers and permit safe authorised local Build/Test. Before G5, instructions
require a stop while any blocker remains and forbid self-approval. Readiness
and run/evidence templates contain explicit decision/version fields.

### SPEC-004-AC05

Covers: SPEC-004-R05.
Given the profile, then build/test/lint commands match the package manifest;
CI/release/scanner capabilities and live host discovery are not invented.
Unknown production/rollback arrangements block release. Nothing requires installing
the reference project's backend or copying business data.

### SPEC-004-AC06

Covers: SPEC-004-R06.
Given the adoption tests, when run using the existing Vitest runner, then missing
local links, malformed new customisation metadata, broken AC mappings or removal
of required gate/retrospective contracts fail. Templates cover specs, ADRs,
readiness, runs, evidence and handover. This is a static contract check, not an
automated claim that agents obey prompts.

## Verification

| AC | Evidence | Coverage / gap |
|---|---|---|
| SPEC-004-AC01 | [Workflow tests](../../tests/deliveryWorkflow.test.ts) | Static metadata/routing/stage checks; live picker and skill invocation Unverified |
| SPEC-004-AC02 | [Workflow tests](../../tests/deliveryWorkflow.test.ts) | Local link and requirement/AC/verification structure checks; semantic truth still needs review |
| SPEC-004-AC03 | [Workflow tests](../../tests/deliveryWorkflow.test.ts) | ADR structure/status and baseline provenance checks |
| SPEC-004-AC04 | [Workflow tests](../../tests/deliveryWorkflow.test.ts), [governance](../standards/delivery.md) | Static gate contracts; human decisions and real-host interrupted/resumed delivery Unverified |
| SPEC-004-AC05 | [Workflow tests](../../tests/deliveryWorkflow.test.ts), [profile](../project-profile.md) | Manifest scripts and capability-limit assertions; remote controls Unverified |
| SPEC-004-AC06 | [Workflow tests](../../tests/deliveryWorkflow.test.ts) | Validator negative fixtures and real document validation; see run evidence for actual execution |

## Risks, readiness and approvals

No source upload or new service is needed. The workflow consumes untrusted source
as evidence, never authority. Explicit task permission is required for external setup.
Scope and ACs are present; tests were authored for this adoption, not for the
already-built game. Formal G0/G1 approval and named roles remain open.

See the [run](../delivery/2026-11-03-retrospective-baseline/run.md),
[readiness](../delivery/readiness.md) and [Q-09](../registers/open-questions.md).
