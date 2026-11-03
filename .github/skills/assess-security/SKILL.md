---
name: assess-security
description: 'Use at Review to assess security applicability, trust boundaries, dependency and data-handling risks, with verified checks or explicit evidence gaps.'
user-invocable: false
---

# Assess security

Read the [standard](../../../docs/standards/delivery.md), profile and scoped diff.
Determine actual security impact; delivery agents do not imply product-AI risk.

Consider untrusted input/assets, source-as-data boundaries, secrets/logging,
dependency changes, external services and permission scope. Use configured approved
checks when applicable; absent scanners remain Unverified, not successful scans.
For an explicit exploit/vulnerability review use the host's security-review
specialist when available and follow its reporting contract.

Record findings, evidence, severity, owners and limitations. Never upload source,
authenticate, install or waive serious risk without appropriate authorisation.

Output: security applicability/findings and blocking evidence gaps for G2/G3.
