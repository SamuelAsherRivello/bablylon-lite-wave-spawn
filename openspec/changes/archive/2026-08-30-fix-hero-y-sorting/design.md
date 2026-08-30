## Context

The battle already keeps each hero's sprite and shadow on one root and updates hero depth during gameplay. The existing shared y-to-depth calculation does not make the shadow-centered pivot contract explicit, allowing the numerical mapping or its tests to disagree with the intended visible order. See `proposal.md` for motivation and `specs/hero-depth-ordering/spec.md` for the behavior contract.

## Goals / Non-Goals

**Goals:**

- Make the hero pivot at the center of the current shadow the sole y input to hero depth ordering.
- Map lower pivot y values to higher hero z-sort values and verify the resulting front-to-back overlap.
- Recalculate ordering as heroes move while retaining planar physics and existing visual layers.

**Non-Goals:**

- Repositioning or resizing hero artwork, shadows, pivots, or colliders.
- Changing projectile ordering, arena geometry, camera orientation, movement, targeting, or combat behavior.
- Adding a dependency or changing responsive layout.

## Decisions

### Use the existing hero root as the shadow-centered pivot

Treat the hero root position as the sorting pivot because the shadow is already centered on and parented to that root. Depth calculations will consume that pivot y directly rather than deriving a point from sprite dimensions or the artwork's visual center.

An alternative was to estimate the feet from a percentage of each image's bounds. That would couple ordering to transparent padding and art variations, and it contradicts the established pivot at the shadow center.

### Express hero ordering through one monotonic mapping

The shared hero depth mapping will guarantee that decreasing pivot y produces an increasing hero z-sort value. Per-frame depth updates will continue to use that mapping so moving heroes can exchange order as soon as their pivots cross.

An alternative was pairwise sorting of all active heroes. A direct monotonic mapping preserves the existing update model, avoids collection-order dependence, and naturally handles any number of heroes.

### Test both the numeric invariant and visible overlap

Focused tests will cover the mapping invariant, hero use of the shadow-centered pivot, and order reversal when two pivots cross. Browser verification will use a controlled overlap at the three viewport categories required by the game-frame contract.

Source-pattern assertions alone are insufficient because they cannot prove which hero actually renders in front.

## Risks / Trade-offs

- [Risk] Reversing the hero mapping could cross fixed ground, shadow, or projectile depth bands. → Mitigation: keep hero values within their existing layer band and test layer separation at arena y-extremes.
- [Risk] Equal pivot y values have no geometric front-to-back distinction. → Mitigation: preserve a deterministic stable tie behavior without allowing artwork size or visual center to influence the result.
- [Risk] A numeric z convention may not match visible camera depth. → Mitigation: verify the observable overlap in a real browser in addition to unit-testing the requested z-sort invariant.
