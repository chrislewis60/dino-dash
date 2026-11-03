# Observed architecture

Observed 2026-11-03 at `e29a2cf` plus the current dirty working tree.
This is source evidence, not an approved target architecture.

Current local extension: [SPEC-006](../specs/0006-third-level-and-difficulty.md)
wires the supplied third background, adds the Level 3 shortcut, moderates hazard
progression and retains final-level completion results. It reuses the same
configuration/rendering path without new systems or dependencies. The completion
UI reads the last configured level; the engine guards against advancing past it.
This does not retrospectively approve or replace the baseline observation below.

```text
App -> GameProvider / GameContext -> GameEngine
  |               ^                  | StateMachine
  |               | stats callback   | SpawnSystem / PhysicsSystem / CollisionSystem
  |               +------------------| InputSystem
  |                                  | CanvasRenderer
  +-> React menus, HUD and results    +-> typed level data + shared configuration
```

## Responsibilities and actual coupling

| Area | Responsibility / evidence |
|---|---|
| [App](../../src/App.tsx) | Canvas and overlay composition, logical canvas dimensions |
| [GameContext](../../src/context/GameContext.tsx) | Engine lifecycle, commands and statistics/state bridge into React |
| [GameEngine](../../src/game/GameEngine.ts) | Mutable simulation state, fixed-step loop, timing, hazards, scoring and progression |
| [StateMachine](../../src/game/StateMachine.ts) | Allowed transitions, warning on invalid requests |
| [Systems](../../src/game/systems/index.ts) | Spawning, physics, collision and shared world dimensions in one module |
| [InputSystem](../../src/game/systems/InputSystem.ts) | Keyboard and touch flags |
| [CanvasRenderer](../../src/canvas/CanvasRenderer.ts) | World rendering, background/icon caches, emoji player artwork |
| [Levels](../../src/game/levels/index.ts) | Three typed configurations and spawn rules |
| [Types](../../src/types/index.ts) | Entity, input, level and statistics contracts |
| [Components](../../src/components/) | React menus, HUD, pause, level and final results |

The engine directly constructs renderer/input/systems; it is not an abstract,
dependency-injected clean architecture. The renderer imports dimensions from the
systems module. React state receives simulation snapshots; React does not own
per-entity motion. CSS, not Tailwind utilities, supplies the current styling.

## Runtime contracts

- One 1196 x 650 logical canvas, scaled by the surrounding UI.
- `requestAnimationFrame` scheduling, 60Hz fixed simulation increments, 200ms
  maximum frame contribution.
- Spawns use timers and randomness, with distance-driven platform spacing after
  the initial timed spawn.
- Collision coordinates are independent of enlarged icon drawing bounds.
- Statistics accumulate actual earned points under each level's multiplier.
- Provider cleanup calls engine destruction; keyboard listeners and animation
  scheduling have explicit teardown. Touch listener/timer teardown is an open gap,
  not a guaranteed lifecycle property.

## Extending the system

A new hazard crosses types, spawn rules, engine storage/update/pruning, collision,
renderer, asset/key metadata and tests. A new power-up also touches activation and
expiry. A new level normally fits the existing LevelConfig, but sequence/ID
assumptions and completion must be tested. Do not split modules or add abstractions
merely to satisfy a diagram.

See the [ADRs](../README.md) for reconstructed decision rationale and
[known gaps](../registers/open-questions.md), especially final-level progression,
input and power-ups. No backend, persistence or cloud deployment is specified.
