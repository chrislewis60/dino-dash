# ADR-0002: Fixed-timestep simulation

Status: Retrospective; rationale inferred; awaiting human review.
Recorded: 2026-11-03. Original decision date and deciders: Unknown.
Evidence baseline: `e29a2cf` plus pre-existing uncommitted gameplay changes.

## Context

[SPEC-002](../specs/0002-levels-and-platforms.md) contains physics and distance-based
route constraints. Browser animation timing varies, including after backgrounding.
The [engine loop](../../src/game/GameEngine.ts) uses an accumulator.

## Decision

Observed: schedule with requestAnimationFrame, consume `1000 / 60`ms simulation
steps and cap each frame's contribution at 200ms. Stop the loop for pause and
terminal/intermediate result states; reset timing on restart.

Inferred rationale: reduce frame-rate-dependent physics changes and unbounded
catch-up work after stalls.

## Options considered

| Option | Benefit | Cost |
|---|---|---|
| Variable delta | Simple, follows elapsed wall time | Large deltas can destabilise collisions and route movement |
| Fixed step with capped accumulator (observed) | Stable update increments, bounded catch-up | Lost simulation time after long stalls; multiple updates per render |
| Worker simulation | Potential main-thread separation | Synchronisation and deployment complexity not required by current scope |

Alternatives/rationale are reconstructed, not a historical decision log.

## Consequences

Simulation time is not wall-clock elapsed time after long stalls. A fixed 60Hz
update is not proof of 60fps rendering, replay determinism or device performance.
Rendering is not interpolated between simulation snapshots. Swept stomp handling
is still needed because a small step alone does not prevent fast crossing.

Long-frame and pause boundaries need explicit evidence; see SPEC-002 verification.
