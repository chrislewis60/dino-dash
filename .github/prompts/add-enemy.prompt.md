---
mode: agent
description: Add a new enemy/hazard type to Dino Dash, touching all required systems end-to-end.
---

# Add a New Enemy / Hazard

Read [GAME_DESIGN.md](../../GAME_DESIGN.md) and the following files before starting:
- `src/types/index.ts` — entity type definitions
- `src/game/systems/index.ts` — SpawnSystem, PhysicsSystem, CollisionSystem
- `src/canvas/CanvasRenderer.ts` — drawing logic

## What to build

Add a new hazard called **${input:enemyName}** (type identifier: `${input:enemyTypeId}`).

### Behaviour description
`${input:behaviourDescription}`

### Visual description (drawn on canvas using shapes/arcs/lines)
`${input:visualDescription}`

### How the player avoids or defeats it
`${input:avoidanceMethod}`

---

## Steps to follow

### 1. Types (`src/types/index.ts`)
- Add `'${input:enemyTypeId}'` to the `EntityType` union
- Add `'${input:enemyTypeId}'` to the `HazardType` union (if it's a damage-dealing hazard)
- Create a new `${input:enemyName}Entity` interface extending `Entity` with any extra fields needed

### 2. Spawn System (`src/game/systems/index.ts`)
- Add a `create${input:enemyName}()` private method to `SpawnSystem`
- Add a `case '${input:enemyTypeId}'` branch in the `switch` inside `SpawnSystem.tick()`
- Add a matching array property to `GameEngine` for this entity type

### 3. Physics / Movement (`src/game/systems/index.ts`)
- Add movement logic in `PhysicsSystem` for the new entity
- Despawn entities that have scrolled off-screen (x < -200)

### 4. Collision (`src/game/systems/index.ts`)
- Add collision detection between `PlayerEntity` and the new entity
- Apply damage, stomp, or interaction as appropriate
- Respect the player's `shield`, `invincibilityTimer`, and `roarActive` flags

### 5. Renderer (`src/canvas/CanvasRenderer.ts`)
- Add a `draw${input:enemyName}()` private method
- Call it from the main `render()` method
- Use only canvas 2D API calls (no DOM, no image assets unless already in the project)

### 6. Level integration
- Add `{ entityType: '${input:enemyTypeId}', intervalMs: ..., intervalVariance: ..., quantity: 1 }` to relevant levels in `src/game/levels/index.ts`

### 7. Verify
```
npm run build
npm test -- --run
```

---

## Constraints

- Follow all conventions in [.github/copilot-instructions.md](../copilot-instructions.md)
- No magic strings — define the type string as a constant if used in comparisons
- UK English in all comments
- Keep `CollisionSystem` cognitive complexity below 15 — extract helper methods if needed
- After implementation, run the Coupling Analyser agent to check for layer violations
