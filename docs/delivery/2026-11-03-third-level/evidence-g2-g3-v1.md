# G2/G3 evidence

Evidence version: 1
Run/specification version: run 1 / SPEC-006 v1
Gates: G2 and G3; Waiting for human
Candidate: `3f3dcb3` plus this run's scoped working changes, no unrelated changes
Recorded at UTC: 2026-11-03
Standard: DD-DELIVERY / 1

## Change and acceptance evidence

| AC | Test/manual check | Actual result | Limitations |
|---|---|---|---|
| SPEC-006-AC01 | Level configuration tests; localhost:5173 fresh browser, Level 3 | JPEG renders on canvas with existing pan/cover; fallback ground hidden | Screenshot visually inspected; no new renderer code |
| SPEC-006-AC02 | Exact configuration table, bounded wave/rate tests, 60s midpoint spawn simulation, existing platform simulations | Initial 91-test focused selection passed; final expanded selection recorded in run | Midpoint randomness is not proof every random overlap is solvable |
| SPEC-006-AC03 | Homepage, context and engine tests; click Level 3 and keyboard Tab/Enter; earlier shortcuts | All three starts load the correct level at 100% health; Level 3 starts at zero progress; level 2-to-3 engine regression covered | Actual browser keyboard interaction required a fresh visible page |
| SPEC-006-AC04 | Engine final guard/repeated continuation and React final/earlier result tests | Final result state retained without warnings; final heading/Menu; earlier Next Level retained | Full 150-second live completion not exercised; engine time-boundary and component checks provide automated evidence |

Focused invocation:
`npm test -- src\game\levels\levels.test.ts src\components\MainMenu.test.tsx src\components\ScoreBreakdown.test.tsx src\game\GameEngine.test.ts src\test\systems.test.ts src\context\GameContext.test.tsx src\canvas\CanvasRenderer.test.ts`

Initial result: exit 0, seven files / 91 tests passed. Two additional exact
interval/variance cases added after review; final results recorded in the run.
Final renumbered selection: exit 0, seven files / 93 tests passed at 17:54 UTC.
A combined gameplay/documentation run previously returned 197 passed / 1 failed:
the only failure concerned the concurrent leaderboard's Proposed ADR-0006 status,
not this change's links, spec traceability or gameplay. That session owns the fix;
until verified, the global documentation check remains a visible evidence gap.
`npm run build`: exit 0, TypeScript and Vite production build succeeded (49 modules).
`npm run lint`: exit 0, zero errors, one pre-existing
react-refresh/only-export-components warning in GameContext.
IDE diagnostics on changed runtime code/new level tests: no errors.
`git diff --check`: exit 0.

## Review findings and skipped checks

- Correctness: reviewed actual scoped diff against SPEC-006. Existing LEVELS
  progression, renderer, resources, score multipliers and platform geometry reused.
  Final-level guard avoids invalid transition and index corruption without a new state.
- Review improvement completed: frequency ordering already passed in the baseline;
  added exact interval/variance assertions to prove level 2's requested increase.
- Coupling: no structural change or new runtime module; completion UI reads existing
  typed level configuration. No new dependency, abstraction or simulation-to-React
  coupling. No separate structural specialist review needed for this bounded change.
- Security applicability: local static asset/config/UI changes only; no new input,
  permissions, data storage, dependencies, external API or source upload.
  No new security finding identified in scoped review. No scanner executed or
  external security certification claimed.
- Accessibility: native labelled buttons retained; browser Tab navigation from
  Start Game through Level 2 to Level 3 showed visible keyboard focus; Enter started
  level 3. At 375x812, Level 3 wraps below the other buttons, entirely inside the
  viewport (x=130.56..229.44). Existing canvas non-visual and completion-focus
  announcement limitations remain; no screen-reader/device certification.
- Browser: original shared hidden tab stalled input and initially retained an HMR
  provider error. Reload restored the menu; a fresh visible local page worked with
  real controls. No product workaround added for a hidden automation tab.
- Play sample: visible level 3 rendered the new panorama, five lives and zero
  progress; a short natural-time sample exercised scrolling, hazards and a jump,
  reaching 5% progress with four lives and one fossil before pausing. This is a
  smoke check, not a balance certification or full-level victory.
- Regression browser checks: Level 2 and Start Game load Volcanic Badlands and
  Jurassic Jungle respectively at full health; pause/quit return to the menu.

## Release blockers

Run B1-B4 remain: named human G0-G4 decisions; product/quality validation of Proposed
balance, real-device and full-play evidence; background distribution rights;
existing readiness/retention gaps; unknown deployment/rollback. No exceptions.
The concurrent global documentation-contract failure was subsequently resolved
by its owner; our final rerun at 17:55 UTC passed 105 tests, exit 0.
All earlier required human/player/device decisions remain pending.

## Recommendation and human decision

Recommend Approve with conditions for scoped code correctness/review; Escalate
release readiness until missing human decisions and required player/device
evidence are resolved. Neither is approval.
Approver/role/authority/timestamp: unassigned/not recorded.
Decision: Waiting for human. No G5 request, commit, push or deployment.
