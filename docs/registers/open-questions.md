# Baseline questions and disagreements

Observed 2026-11-03. These are **not approved requirements or an automatically
authorised remediation backlog**. “Owner” is a role to assign, not an invented
person. Resolve intent with a human, then create a scoped `/deliver` change.

| ID | Evidence / question | Owner | Affects | Current treatment |
|---|---|---|---|---|
| Q-01 | Design/README promise tap-to-jump; [InputSystem](../../src/game/systems/InputSystem.ts) only emits keys for >30px vertical swipes. Touch listeners and 50ms timers lack explicit teardown. Which gesture/lifecycle contract is wanted? | Product + technical lead | SPEC-001-AC01, SPEC-001-AC08 | Observed swipe-only behaviour; tap parity and cleanup unresolved |
| Q-02 | Design and old test prompt say one-hit shield; [physics/collision](../../src/game/systems/index.ts) implements four seconds of immunity without consumption. Which mechanic is intended? | Product | SPEC-001-AC03, SPEC-001-AC07 | Describe timed immunity, do not claim one-hit behaviour |
| Q-03 | Sprint is labelled a speed boost, but [physics](../../src/game/systems/index.ts) sets a flag/timer and [engine](../../src/game/GameEngine.ts) speed ignores it. What speed/duration/scoring behaviour should a real boost have? | Product + technical lead | SPEC-001-AC07 | Visual/flag behaviour only; no invented boost amount |
| Q-04 | Design says roar clears all hazards; [engine](../../src/game/GameEngine.ts) clears only meteors/birds and collision ignores damage during the roar flag. Should vents/spikes clear too? | Product | SPEC-001-AC04, SPEC-001-AC06, SPEC-001-AC07 | Current scope stated explicitly |
| Q-05 | After level 3, [engine](../../src/game/GameEngine.ts) requests levelComplete -> gameOver, which [StateMachine](../../src/game/StateMachine.ts) rejects; levelIndex has already incremented. Should completion show victory, game over or another result? | Product + technical lead | SPEC-002-AC02 | No successful final-run completion contract or proof claimed |
| Q-06 | Pause stops the loop that polls Escape/P; [pause UI](../../src/components/PauseScreen.tsx) can resume. Should keyboard toggle resume too? Distance display also labels `floor(worldPixels / 10)` as metres while an engine comment calls it decametres. What are the intended controls/units? | Product + technical lead | SPEC-002-AC03, SPEC-001-AC06, SPEC-003-AC02 | UI resume and current displayed distance only |
| Q-07 | Device/browser support, screen-reader journey and measured performance targets have not been established. What is required for release? | Product + quality owner | SPEC-001 through SPEC-003 | Unverified; no invented fps/coverage/conformance target |
| Q-08 | SVG attribution exists; rights/provenance of the two supplied background images still need owner confirmation. Are distribution rights documented? | Project owner | SPEC-003-AC04, SPEC-003-AC05 | Preserve credits/assets; do not infer a licence |
| Q-09 | Named gate roles, evidence retention/access, live command discovery, hosting and rollback are unknown/unverified. Who owns them and what release process applies? | Project owner + release owner | SPEC-004, G0-G5 | Release blockers; implementation request is not approval |

The [design document](../../GAME_DESIGN.md) remains useful narrative intent.
Specs distinguish its promises from what source/tests currently demonstrate.
