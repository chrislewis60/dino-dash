---
name: implement-code
description: 'Use at Build to implement only the agreed spec scope, preserve unrelated working changes and verify every affected runtime surface.'
user-invocable: false
---

# Implement code

Read the [standard](../../../docs/standards/delivery.md), current spec/ADR, profile
commands and existing patterns. Inspect dirty state before editing.

Make coherent, typed changes through every relevant type/config/spawn/update/
collision/render/UI surface. Prefer existing helpers and simple boundaries.
Do not implement open product questions as if resolved. Work before G1 approval
is provisional and may require rework; pending G1 is not permission to exceed scope.

Run focused tests during implementation and applicable build/type-check/lint.
Record actual output. No dependency setup, unrelated fixes, commit/push or external
changes without scoped permission. Keep specs/architecture aligned with the change.

Output: implementation, test evidence and remaining blockers.
