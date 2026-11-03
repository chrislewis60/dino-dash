---
name: write-specification
description: 'Use to write a right-sized versioned spec and, for Significant changes, a linked ADR with alternatives, consequences and honest approval status.'
user-invocable: false
---

# Write specification

Read the [standard](../../../docs/standards/delivery.md), profile and
[spec template](../../../docs/templates/specification.md).
Use context and AC outputs; save the next unused `docs/specs/NNNN-short-name.md`.

Include only size-required sections. Map every requirement to ACs and every AC to
test/manual evidence. Record risks, exclusions, unknown owners and applicable
standard version. Check Definition of Ready item by item, not just file existence.

For Significant changes draft the next unused ADR using the
[ADR template](../../../docs/templates/adr.md): context, proposed decision,
alternatives and consequences. Retrospective rationale is inferred, never historical
approval. New ADRs remain Proposed until a human decides.

Output: spec/version, linked ADR when required and readiness gaps for G1.
