# ADR-0004: Store earned score categories, not reconstructed rewards

Status: Retrospective; rationale inferred; awaiting human review.
Recorded: 2026-11-03. Original decision date and deciders: Unknown.
Evidence baseline: `e29a2cf` plus pre-existing uncommitted gameplay changes.

## Context

Different levels have different multipliers; run totals survive level transitions.
Results need an understandable breakdown that adds up to the displayed score.
See [SPEC-001](../specs/0001-core-gameplay.md) and
[SPEC-003](../specs/0003-presentation.md).

## Decision

Observed in the [engine](../../src/game/GameEngine.ts): accumulate actual earned
distance/fossil/stomp/roar points under the multiplier active at reward time and
derive score from those totals. In the
[result component](../../src/components/ScoreBreakdown.tsx), allocate integer
display values by flooring cumulative categories in a stable order.

Inferred rationale: avoid changing earlier rewards when advancing to a level with
a different multiplier, and avoid independent rounding that makes visible totals disagree.

## Options considered

| Option | Benefit | Cost |
|---|---|---|
| Recalculate from counts and final multiplier | Less stored state | Incorrect across mixed multipliers |
| Store earned category totals (observed) | Preserves earned value; simple result projection | Requires immutable-enough snapshot updates and consistent award paths |
| Store every reward event | Detailed replay/audit possibilities | Unneeded storage/lifecycle complexity for current scope |

These are inferred alternatives; no historical approval is claimed.

## Consequences

Every award path must update the correct category exactly once. Eggs restore health,
not points. Counts are useful display statistics, not a way to reconstruct score.
Cumulative rounding can allocate a fractional carry to a later category; document
and test that ordering instead of changing it accidentally.

This behaviour includes pre-existing uncommitted work. Pending review does not
authorise reverting or rewriting it.
