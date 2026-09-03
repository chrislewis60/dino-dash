---
mode: agent
description: Generate comprehensive tests for a Dino Dash game system or component.
---

# Generate Tests

Read [GAME_DESIGN.md](../../GAME_DESIGN.md) and the existing tests in `src/test/` before starting.

## What to test

Target: **${input:targetFile}**

Additional context / scenarios to cover: `${input:additionalContext}`

---

## Testing strategy

Use **Vitest** (already configured). Test files live next to their source or in `src/test/`.
Reference `src/test/setup.ts`, `src/test/StateMachine.test.ts`, and `src/test/systems.test.ts` for existing patterns.

### Required coverage areas

#### For game systems (`SpawnSystem`, `PhysicsSystem`, `CollisionSystem`):
- [ ] Entities spawn at correct positions and with valid initial state
- [ ] Entities despawn when off-screen
- [ ] Player takes damage on hazard collision (when not invincible / shielded)
- [ ] Player does NOT take damage during invincibility window
- [ ] Shield absorbs one hit and is then removed
- [ ] Collectibles are consumed and apply correct effect (score / life)
- [ ] Power-ups activate and expire correctly
- [ ] Roar clears all active hazards
- [ ] Stomp on pterodactyl grants score and removes entity

#### For `StateMachine`:
- [ ] Valid transitions succeed
- [ ] Invalid transitions throw or are rejected
- [ ] All reachable states are covered

#### For `GameEngine` (integration):
- [ ] Starts in `menu` state
- [ ] Transitions to `playing` on start
- [ ] Transitions to `gameOver` when lives reach 0
- [ ] Transitions to `levelComplete` when level timer elapses
- [ ] Score increases with distance

#### For React components (use `@testing-library/react`):
- [ ] Renders without crashing
- [ ] Displays correct stats from context
- [ ] User interactions trigger correct callbacks
- [ ] Conditional content shows/hides correctly

---

## Steps to follow

1. Create the test file adjacent to the source file (e.g. `Foo.ts` → `Foo.test.ts`) or in `src/test/`
2. Import only what is needed — do not import the full module if only a function is needed
3. Use `describe` blocks to group related tests
4. Use `beforeEach` to reset state between tests
5. Mock canvas APIs where needed using `vi.fn()` or jsdom stubs
6. Run tests after writing them: `npm test -- --run src/test/<filename>.test.ts`
7. Fix any failures before finishing

---

## Constraints

- Follow all conventions in [.github/copilot-instructions.md](../copilot-instructions.md)
- Test behaviour, not implementation details
- Each test must have a clear, readable name describing what it verifies
- Aim for at least **80% statement coverage** on the target file
- UK English in test descriptions
