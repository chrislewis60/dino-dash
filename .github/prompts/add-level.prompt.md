---
mode: agent
description: Scaffold a new level for Dino Dash following the LevelConfig schema and project conventions.
---

# Add a New Level

Read [GAME_DESIGN.md](../../GAME_DESIGN.md) and [src/game/levels/index.ts](../../src/game/levels/index.ts) before starting.

## What to build

Add a new level to the game called **${input:levelName}**.

### Theme & visuals
- Sky colour: `${input:skyColour}`
- Ground colour: `${input:groundColour}`
- Background style (e.g. snowy tundra, asteroid field, underground): `${input:backgroundDescription}`

### Difficulty settings
- Position in level sequence (1 = easiest): `${input:levelPosition}`
- Base scroll speed (px/s, e.g. 260–400): `${input:baseSpeed}`
- Max scroll speed (px/s): `${input:maxSpeed}`
- Level duration (ms, e.g. 60000): `${input:durationMs}`
- Score multiplier (e.g. 2.0): `${input:multiplier}`

### Platform density
- How often platforms spawn (intervalMs, e.g. 5000 = relaxed, 3000 = dense): `${input:platformInterval}`

### Spike pit density
- How often spike pits spawn (intervalMs, e.g. 7000 = sparse, 4000 = frequent): `${input:spikePitInterval}`

---

## Steps to follow

1. **Define the `LevelConfig` object** in `src/game/levels/index.ts`
   - Use the existing levels as templates
   - Design 2–3 `backgroundLayers` with appropriate shapes, colours, and parallax `scrollFactor` values
   - Set `spawnRules` — increase intensity compared to the previous level
   - Include `platform` and `spikePit` entries in `spawnRules` using the density inputs above
   - All colours must be valid CSS hex values

2. **Insert the level** into the `LEVELS` export array at the correct index position

3. **Verify** the TypeScript compiles: `npm run build`

4. **Run tests** to confirm nothing is broken: `npm test -- --run`

---

## Constraints

- Follow all conventions in [.github/copilot-instructions.md](../copilot-instructions.md)
- No magic strings — if you introduce a new identifier, define it as a constant in `src/config/`
- UK English in all comments and names
- Do not modify `LevelConfig` type shape — work within the existing interface in `src/types/index.ts`
- After implementation, run the Coupling Analyser agent to verify no new coupling violations
