## Why

The current damage-cloud particles are too small and remain too tightly grouped
around their hero-relative spawn point. Enlarging the clouds and their possible
offsets will make damage impacts more readable without changing the effect's
timing or lifecycle.

## What Changes

- Set the configured randomized cloud-size bounds to `1.65`-`2.7` Babylon
  world units so the effect is clearly visible at gameplay scale.
- Set the final maximum spawn offsets to `0.255` horizontally and `0.315`
  vertically in either direction, keeping the burst close to its owner.
- Render each cloud one depth unit in front of its owning hero while preserving
  the scene's global Y sorting, so the cloud does not bypass nearer heroes.
- Preserve the existing particle count, random distribution, texture, opacity
  animation, delay, lifetime, hero-relative parenting, layering, and cleanup.
- Preserve equivalent frame-relative presentation in the centered 9:16 game
  frame across desktop and portrait mobile browsers.
- Add no dependencies.

## Capabilities

### New Capabilities

- `babylon-lite-particle-effects`: Define the current damage-cloud effect and
  its enlarged size and spawn-offset bounds as the repository's main particle
  effect contract.

### Modified Capabilities

None.

## Impact

- Affects damage-cloud configuration in `src/particle-effects.js` and its
  focused coverage in `test/particle-effects.test.js`.
- Changes the visible scale, hero-relative placement, and owner-relative depth
  of the existing cloud planes; no public API, input, physics, or dependency
  changes.
- Requires focused tests, a production build, and live-browser checks at the
  project-required desktop and portrait viewport sizes.
