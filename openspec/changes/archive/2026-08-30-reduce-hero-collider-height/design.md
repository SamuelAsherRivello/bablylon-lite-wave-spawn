## Context

See `proposal.md` for motivation. Hero artwork is currently a one-world-unit
square plane attached to a gameplay root. The physics box is centered on that
root, while the shadow center defines the separate pivot used for z sorting.
Movement, knockback, collision callbacks, and arena containment also depend on
the gameplay root and collider measurements. The collider therefore needs a
local vertical offset rather than a root-position adjustment.

## Goals / Non-Goals

**Goals:**

- Express the collider as a bottom-anchored footprint with explicit asymmetric
  vertical bounds relative to the hero root.
- Keep physics contacts, arena containment, and collision callback ownership
  consistent after changing the shape.
- Make collider geometry directly testable without relying only on visual
  judgment.

**Non-Goals:**

- Changing collider width or depth, hero artwork, the shadow, the sorting
  pivot, movement speed, knockback behavior, or formation placement.
- Adding permanent player-facing debug UI or changing touch input behavior.
- Changing the centered 9:16 game-frame composition or its resize behavior.

## Decisions

### Use an offset box shape on the existing gameplay root

The collider will retain its existing width and depth, use a height of `0.5`
world units for the one-unit-tall artwork, and have a local center at `y =
-0.25`. Its vertical bounds relative to the root are therefore `-0.5` at the
bottom and `0` at the top. The physics body and its box shape will remain owned
by the hero and will be disposed with it.

This keeps the root, artwork, shadow, and sorting pivot stationary. Moving the
root or artwork to compensate for a centered aggregate was rejected because it
would couple a collision-only change to spawn placement, movement, knockback,
and z sorting. Scaling the existing centered box without offsetting it was
rejected because it would cover the middle of the hero instead of the feet and
legs.

### Represent arena containment with directional collider offsets

Containment will use left, right, bottom, and top offsets from the gameplay
root, or an equivalent bounds representation. For the retained footprint these
are horizontally symmetric but vertically asymmetric: the top reaches the root
and the bottom reaches the artwork bottom. This replaces any assumption that a
single vertical half-extent describes both sides of the root.

Keeping a symmetric half-extent API was rejected because it would either allow
the collider below the arena boundary or constrain the root using empty space
above the collider.

### Verify geometry independently from responsive rendering

Unit tests will assert the shape height, center offset, resulting top and bottom
bounds, preserved width/depth, and asymmetric arena clamping. Browser
verification will inspect the effective collider bounds at the required large
desktop, narrow portrait, and width-limited tall mobile viewport shapes. Any
inspection overlay used for verification will be opt-in or temporary and will
not participate in physics.

The collider remains defined in Babylon world units, so viewport resizing and
touch input require no new runtime branch. Browser checks still confirm that
the scene and exact 9:16 frame scale uniformly around it.

## Risks / Trade-offs

- **[Risk]** An offset physics shape could be created in the wrong coordinate
  space. **Mitigation:** assert the derived root-relative bounds and inspect the
  collider against the artwork in a running browser.
- **[Risk]** Existing boundary logic may silently retain symmetric vertical
  assumptions. **Mitigation:** add focused top- and bottom-edge containment
  tests before updating production code.
- **[Risk]** Replacing a convenience physics aggregate may change resource
  ownership or collision metadata. **Mitigation:** preserve body metadata and
  callback wiring, and explicitly dispose both body and shape through the hero
  lifecycle.
- **[Trade-off]** The lower collider permits upper artwork to overlap visibly;
  this is intentional so only feet and legs block movement.

## Migration Plan

Implement the shape and containment changes together, then run focused geometry
and collision tests before the full test and build suites. Verify the running
scene at all required viewport shapes. Rollback is the additive reversal of
these source changes; no persisted data or content migration is required.
