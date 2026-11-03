# Specifications and agentic delivery

This is a **retrospective, observed baseline**, reconstructed on 2026-11-03 from the
working tree, including uncommitted gameplay changes, at the user's request. It is
not evidence that these requirements or decisions existed before development.
Product acceptance and architectural rationale still require human review.

## Start here

- [How spec-driven development and Playbook work](guides/spec-driven-development.md)
- [Project profile and actual commands](project-profile.md)
- [Architecture and dependency boundaries](architecture/overview.md)
- [Local delivery standard v1](standards/delivery.md)
- [Readiness and outstanding approvals](delivery/readiness.md)
- [Known disagreements between design and implementation](registers/open-questions.md)

## Reconstructed specifications

| Specification | Scope |
|---|---|
| [SPEC-001: Core gameplay](specs/0001-core-gameplay.md) | Input, movement, hazards, health, power-ups and scoring |
| [SPEC-002: Levels and platform routes](specs/0002-levels-and-platforms.md) | Progression, timing, spawn rules and measurable route constraints |
| [SPEC-003: Presentation](specs/0003-presentation.md) | Menus, HUD, results, backgrounds, artwork and credits |
| [SPEC-004: Playbook adoption](specs/0004-playbook-adoption.md) | Agent workflow, human decisions, reusable artefacts and validation |

These are the initial specification slices we would have wanted before building.
They describe the observed system, not an instruction to reimplement it. Existing
tests are mapped by file and test name; they have not been renamed to imply that
the new acceptance IDs historically existed.

## Architecture Decision Records (ADRs)

An ADR records **why** an important approach was chosen; a spec records **what**
observable outcome is required. “ADR” is the usual abbreviation, rather than “ARD”.

| ADR | Status |
|---|---|
| [0001: React shell and canvas simulation](adr/0001-react-shell-and-canvas.md) | Retrospective; rationale inferred; awaiting review |
| [0002: Fixed-timestep simulation](adr/0002-fixed-timestep.md) | Retrospective; rationale inferred; awaiting review |
| [0003: Typed level configuration](adr/0003-typed-level-configuration.md) | Retrospective; rationale inferred; awaiting review |
| [0004: Earned score ledger](adr/0004-earned-score-ledger.md) | Retrospective; rationale inferred; awaiting review |
| [0005: Repository-local Playbook](adr/0005-agentic-delivery-playbook.md) | Proposed; awaiting review |

## Use the workflow

In VS Code Copilot Chat, select a prompt using `/` or **Chat: Run Prompt**:

1. `/evolves` refreshes this existing project's profile and G0 readiness.
2. `/deliver` starts a single change through Understand, Build, Review, Test and Handover.
3. `/initiate` is the equivalent onboarding route for a genuinely new project, not
   a command to reset this one.

The **Onboarding** and **Playbook** custom agents can also be selected directly.
Skills are procedures the agent reads and follows, not installed CLI executables.
Host discovery still needs a live check; see [readiness](delivery/readiness.md).

Validate the local documentation contracts with:

```powershell
npm test -- tests/deliveryWorkflow.test.ts
```

For the first reconstruction's evidence and limitations, see the
[run record](delivery/2026-11-03-retrospective-baseline/run.md).
New work uses the [templates](templates/specification.md), not a new copy of this baseline.
