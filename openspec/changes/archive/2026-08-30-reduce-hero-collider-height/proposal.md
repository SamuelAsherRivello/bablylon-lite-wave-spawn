## Why

The current hero collider reaches too high into the artwork, so contacts can be triggered by a hero's torso or head instead of the grounded part of the character. Restricting collision to the lower half makes heroes interact through their feet and legs while preserving their visual silhouettes.

## What Changes

- Reduce every battle hero collider to 50% of the hero artwork height.
- Anchor the reduced collider to the bottom center of the hero artwork so it covers the feet and legs, not the head.
- Preserve the existing collider width and depth, physics behavior, hero root, shadow-centered sorting pivot, movement, knockback, and arena containment.
- Add automated geometry coverage and opt-in browser-visible collider verification at the required desktop and portrait viewport shapes.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `hero-line-battle`: Replace the existing fixed bottom-center collider requirement with a collider whose height is half the hero artwork height and whose bottom edge is anchored to the artwork bottom.

## Impact

- Affects hero physics shape construction and collider extent values in the Babylon scene.
- Updates collision geometry tests and debug-collider verification without changing hero artwork or responsive composition.
- Adds no dependencies and continues using Babylon world units inside the centered 9:16 frame.
