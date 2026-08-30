## Why

Overlapping heroes can render in the wrong visual order because depth sorting is not explicitly tied to the point where each hero meets the arena floor. This makes a hero that is lower on the screen sometimes appear behind a hero that is higher on the screen.

## What Changes

- Define each battle hero's depth-sorting pivot as the hero pivot already located at the center of its shadow.
- Use the pivot's screen-space y-coordinate as the authoritative value for hero z/depth ordering.
- Ensure a hero with a lower on-screen pivot renders in front of a hero with a higher on-screen pivot.
- Keep sorting correct while heroes move and overlap without changing their physics-plane behavior or frame-relative visual composition.

## Capabilities

### New Capabilities

- `hero-depth-ordering`: Defines shadow-centered hero pivots and their screen-y-based rendering order.

### Modified Capabilities

None.

## Impact

- Affects the shared hero depth calculation and the per-frame hero depth update.
- Adds focused automated coverage for pivot-based overlap ordering and browser-visible verification on desktop and portrait mobile viewports.
- Adds no dependencies and does not change the centered 9:16 game-frame composition.
