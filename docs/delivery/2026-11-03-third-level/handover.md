# Third-level change handover

Run/specification/evidence versions: run 1 / SPEC-006 v1 / G1 v1, G2-G3 v1
Candidate: `3f3dcb3` plus scoped uncommitted changes
Status: Local implementation verified; Waiting for human G4 and release blockers

## Delivered and excluded

- Level 3 uses the supplied JPEG panorama and is directly accessible from the menu.
- Level 2 timed hazards increase about 17%; level 3 increases another 15%.
- Final-level waves spawn single meteors/birds; speed is moderated to 350-600px/s.
- Five starting lives, eggs, power-ups, platform safety geometry, durations and
  score multipliers remain unchanged.
- Final results show All Levels Complete! and Menu with no invalid Next Level.
- No extra level beyond three, renderer rewrite, input repair, dependency, cloud,
  commit, push or release. Earlier retrospective specs remain historical records;
  SPEC-006 describes the new behaviour.

## Evidence

See [review/test evidence](evidence-g2-g3-v1.md) and [run](run.md) for commands,
final counts and browser checks. Automated checks cover fresh starts, progression,
final completion and platform geometry; browser checks cover the artwork,
three shortcuts, keyboard Level 3 activation and narrow-layout wrapping.

## Remaining risks and release blockers

Difficulty is deliberately moderate but subjective: full player runs/random
overlaps and real-device/screen-reader evidence remain Unverified.
Run B1-B4 include pending named G0-G4 decisions, Proposed balance approval,
artwork distribution rights and existing readiness gaps. No exceptions accepted.

## Operations and rollback

Development page remains available at localhost:5173. Production release and
rollback procedure Unknown; local build/preview is not a release authorisation.
No new process or dependency was needed.

## Decisions requested

G4 acceptance requested from the named product owner for SPEC-006 v1 and this
evidence, with explicit name/authority, timestamp, reason and conditions.
G2/G3 require technical/quality decisions separately; G1 remains pending by
the user's explicit selection to continue implementation provisionally.
No G5 request while blockers remain. Status: Waiting for human: release blockers.

User handover response on 2026-11-03: "Leave acceptance pending; I'll play-test it".
No named authority, gate approval or exception inferred; G4 remains Waiting for human.
