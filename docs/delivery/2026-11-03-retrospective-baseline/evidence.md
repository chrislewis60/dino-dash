# Baseline adoption evidence

Evidence version: 1
Run/specification: 2026-11-03-retrospective-baseline / SPEC-004 v1
Observation baseline: `e29a2cf` plus pre-existing dirty gameplay edits
Validation candidate: documentation/test working tree on `c5cf14c`, with concurrent
menu-background edits preserved; no gameplay code modified by this task
Recorded: 2026-11-03
Standard: DD-DELIVERY / 1

## Source evidence

SPEC-001 through SPEC-003 cite actual source and existing test names. Those mappings
are not a claim that the tests were executed in this reconstruction or that their
coverage is complete. A shared Vite menu snapshot confirmed the current menu's two
start buttons, item/hazard key, keyboard controls and credits; it did not test a run.

## Executed adoption checks

| AC | Check | Result | Limitations |
|---|---|---|---|
| SPEC-004-AC01 through SPEC-004-AC06 | `npm test -- tests/deliveryWorkflow.test.ts` | Passed: 94 tests, exit 0, rechecked 2026-11-03 16:51 UTC | Static contracts only; not live host compliance |
| SPEC-004-AC06 | `npx eslint tests/deliveryWorkflow.test.ts` | Passed: exit 0, no findings, 2026-11-03 | Not a lint baseline for unrelated gameplay edits |
| SPEC-004-AC06 | `npx tsc --noEmit --target ES2022 --module NodeNext --moduleResolution NodeNext --skipLibCheck --strict tests/deliveryWorkflow.test.ts` | Passed: exit 0, 2026-11-03 | Focused strict type-check of the new test, not the game build |
| SPEC-004-AC06 | `git diff --check` | Passed: exit 0, 2026-11-03 | Git reported LF/CRLF conversion advice for the instructions file, not a whitespace error |

The VS Code test integration initially reported no discovered tests for the new
file. The direct repository Vitest invocation above successfully collected and
ran it; no dependency installation was needed.

## Structural review

A bounded, read-only Coupling Analyser review found no high-confidence structural
issues: all stages map to local skills, no blocking workflow cycle was identified,
package manifests are unchanged, and the adoption tests use only Node built-ins,
existing Vitest and repository files. It did not assess gameplay or live host behaviour.

## Skipped and unverified

- Full gameplay tests/build were not required to change Markdown/customisations;
  no runtime code was changed by this task.
- Copilot picker/agent routing, multi-turn delivery and actual human gate behaviour
  have not been exercised. Static checks do not prove these.
- No security scanner, device/screen-reader certification, remote CI/branch policy,
  release or rollback has been verified.
- Original rationale/acceptance of pre-existing implementation is Unknown.

## Recommendation and decisions

Recommendation: **Escalate** for operational adoption/release until the
[run blockers](run.md) and named human decisions are resolved. Static documentation
success alone cannot authorise release.

Human decision: Waiting for human. Approver, role/authority, UTC timestamp, reason,
spec/evidence version and conditions have not been supplied.
