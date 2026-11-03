---
name: review-accessibility
description: 'Use when a UI or player journey changes to review keyboard, focus, semantics, labels, contrast and non-visual limitations without claiming unsupported conformance.'
user-invocable: false
---

# Review accessibility

Read the [standard](../../../docs/standards/delivery.md), UI criteria and actual
components/styles. Mark Not applicable with reason only when no UI/journey changed.

Check keyboard reachability, focus visibility/order, semantic controls, accessible
names, status/progress communication, touch usability and colour-only meaning.
Treat canvas accessibility as an explicit limitation, not solved by HUD labels.

Use component tests and relevant browser/manual checks. Full screen-reader/device
claims require actual evidence; a jsdom test does not certify conformance.
Record required but unavailable checks as Unverified with an owner.

Output: findings, reproducible checks and residual accessibility risk for G2/G3.
