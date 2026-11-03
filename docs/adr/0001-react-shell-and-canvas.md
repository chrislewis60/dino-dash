# ADR-0001: React shell and canvas simulation

Status: Retrospective; rationale inferred; awaiting human review.
Recorded: 2026-11-03. Original decision date and deciders: Unknown.
Evidence baseline: `e29a2cf` plus pre-existing uncommitted gameplay changes.

## Context

[SPEC-001](../specs/0001-core-gameplay.md) needs many moving entities;
[SPEC-003](../specs/0003-presentation.md) needs ordinary accessible menu/HUD controls.
[App](../../src/App.tsx), [GameContext](../../src/context/GameContext.tsx) and
[renderer](../../src/canvas/CanvasRenderer.ts) evidence a hybrid implementation.

## Decision

Observed: use React for the UI shell and engine lifecycle; render and simulate
the world with canvas 2D and mutable engine entities. Send statistics to React
through GameContext rather than storing every moving entity in React state.

Inferred rationale: keep the simulation/drawing path independent of DOM layout
while retaining familiar React components for interactive overlays.

## Options considered

| Option | Benefit | Cost |
|---|---|---|
| React DOM entities | Inspectable elements, familiar styling | Per-entity reconciliation/layout and a different physics/rendering model |
| Canvas plus React shell (observed) | Direct drawing control, conventional UI controls | Manual hitboxes/assets and two state lifecycles |
| Dedicated game framework | Established scene/asset tooling | New dependency, migration and framework learning |

These are reconstructed alternatives, not evidence that the original author evaluated them.

## Consequences

Engine/UI state synchronisation and teardown need explicit tests. Canvas content
does not inherit DOM accessibility. Renderer caches, logical dimensions and hitboxes
must remain coherent. Plain CSS and React 19.1 manifest ranges are the observed stack;
React Compiler/Tailwind/Radix are not established by this decision.

Acceptance of the architecture and rationale remains pending. See the
[overview](../architecture/overview.md) for actual, non-idealised coupling.
