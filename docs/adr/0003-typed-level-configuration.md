# ADR-0003: Typed level configuration and constrained routes

Status: Retrospective; rationale inferred; awaiting human review.
Recorded: 2026-11-03. Original decision date and deciders: Unknown.
Evidence baseline: `e29a2cf` plus pre-existing uncommitted gameplay changes.

## Context

The three existing levels share mechanics but vary visuals, duration, speeds,
spawning and multipliers. Elevated routes must remain usable while world speed
changes. See [SPEC-002](../specs/0002-levels-and-platforms.md).

## Decision

Observed: define levels as typed LevelConfig objects in the
[level module](../../src/game/levels/index.ts), with shared identifiers and
[platform geometry constants](../../src/config/platforms.ts). The
[spawn system](../../src/game/systems/index.ts) combines timed entity rules with
distance-based platform spacing and bounded random elevation/width selection.

Inferred rationale: reuse mechanics across themes and keep pacing constraints
consistent under acceleration without creating one engine per level.

## Options considered

| Option | Benefit | Cost |
|---|---|---|
| Bespoke level engines | Complete per-level flexibility | Duplicated mechanics and divergence |
| Typed in-code configuration (observed) | Compiler checks, easy tests and shared systems | Content changes require a build; sequence/ID assumptions remain |
| External level format/editor | Non-programmer authoring | Runtime validation, format versioning and tooling |

The original alternatives and decision discussion are Unknown.

## Consequences

New ordinary levels normally need data, not a new engine. New entity types still
cross spawn/update/collision/rendering surfaces. TypeScript configuration is not
validation of external content. Randomness is unseeded.

Route tests should measure maximum-speed landing and jump distances. Final-level
progression is an unresolved implementation/design mismatch, not accepted by this
ADR. See [Q-05](../registers/open-questions.md).
