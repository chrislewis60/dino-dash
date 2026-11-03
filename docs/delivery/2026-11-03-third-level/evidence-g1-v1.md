# G1 evidence

Evidence version: 1
Run/specification version: run 1 / SPEC-006 v1
Gate: G1; Waiting for human
Candidate: `3f3dcb3` plus new spec/run and acceptance-test working changes
Recorded at UTC: 2026-11-03
Standard: DD-DELIVERY / 1

## Change and acceptance evidence

Command: `npm test -- src\game\levels\levels.test.ts src\components\MainMenu.test.tsx src\components\ScoreBreakdown.test.tsx src\game\GameEngine.test.ts`

Exit 1: four files, 6 failing and 24 passing tests. VS Code runTests found no
discovered tests, so the existing npm runner supplied actual evidence.

| AC | Actual pre-implementation result |
|---|---|
| SPEC-006-AC01 | Fails: level 3 background undefined rather than supplied JPEG |
| SPEC-006-AC02 | Fails: double waves and 400/700/14 speed, rather than proposed single waves and 350/600/10 |
| SPEC-006-AC03 | Fails: homepage Level 3 button missing; existing direct-start engine API already supports 3 |
| SPEC-006-AC04 | Fails: final heading missing; final continuation emits two invalid-transition warnings |

Originally allocated as SPEC-005; subsequently renumbered to SPEC-006 with user
permission after concurrent leaderboard work allocated SPEC-005. Pre-build test
names/output used the original identifier; no red/green history is being recreated.

Midpoint one-minute spawn ordering already passes; it alone does not prove the
requested moderate difficulty. New tests also bound quantities and rate increases.

## Review findings and skipped checks

Build, lint, final tests and browser walkthrough pending. Bounded React specialist
advised that native buttons and derived final-level state need no hooks or new
abstraction. Final wording describes reaching the last level, not proof that the
player entered every earlier level. Existing focus-announcement limitations remain.

## Release blockers

Run B1-B4 remain: pending G0-G4/named roles, Proposed subjective balance targets,
required checks, background rights, readiness gaps and unknown release/rollback.
No exceptions or release authorisation.

## Recommendation and human decision

Recommend Approve with conditions for local implementation, based on reproduced
missing behaviour and a bounded configuration change. Require play feedback for
subjective balance and later verification; this recommendation is not approval.
Approver/authority/timestamp: unassigned/not recorded.
Decision: Waiting for human; G1 request accompanies this pack. Safe local work
can continue provisionally, at risk of rework.
