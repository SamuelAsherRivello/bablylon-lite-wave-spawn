## Context

The current battle already has per-unit runtime heroes, mutable health, removal on defeat, normalized movement helpers, and physics-driven collisions. The existing movement selection is performed during frame movement, which does not yet provide target memory or target-aware assignment. See proposal.md and the two delta specs for the required behavior.

## Goals / Non-Goals

**Goals:**

- Keep targeting state on the runtime battle unit/hero boundary so it survives movement frames and can be invalidated with removal.
- Centralize eligibility, distance, health, and stable tie-breaking in pure testable battle-rule logic.
- Reacquire only when the remembered target is unavailable, avoiding target thrashing.
- Preserve current physics, collision damage, animation/jiggle, depth, frame timing, and responsive frame behavior.

**Non-Goals:**

- Hero-specific targeting personalities, ranged attacks, attack range, pathfinding, formations changes, or new UI.
- New Babylon.js resources or dependencies.

## Decisions

- Store a direct target reference (or equivalent stable unit identity) on each active runtime unit. A reference matches the existing in-memory unit collections and allows removal checks without serializing gameplay state.
- Select targets from the opposing active collection in a deterministic pass. Filter removed/unavailable units, partition candidates into untargeted and already-targeted groups, then rank the selected pool by squared distance, current health, and original collection order. This avoids square roots and makes tests reproducible.
- Reuse normalized 2D velocity toward the target and retain the current profile-speed/movement-scale calculation. A coincident target produces zero velocity; collision and removal systems remain the authority for defeat.
- Re-evaluate ownership after removals and before movement when a target is unavailable. Do not switch a valid target because another candidate moves closer.
- Keep touch input and resize handling unchanged because targeting is automatic and has no new interactive control or Babylon.js resource ownership. Existing scene resources continue to be owned and disposed by their current hero/gameplay owners.

## Risks / Trade-offs

- [Risk] “Closest with least health” can be interpreted as a weighted score. → Use distance as the primary ordering and health as the tie-breaker, making the stated preference deterministic and easy to validate.
- [Risk] Several heroes can select the same target during one update. → Assign targets in a stable hero iteration order and calculate untargeted eligibility from prior assignments plus selections made in the current pass.
- [Risk] A removed target can retain a stale reference. → Validate target activity before every movement update and clear it during removal/reacquisition.
- [Risk] Target-directed paths may change battle duration and collision timing. → Preserve the existing movement scale and verify both unit tests and a real browser battle run.
