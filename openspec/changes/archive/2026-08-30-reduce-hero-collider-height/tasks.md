## 1. Collider Geometry Tests

- [x] 1.1 Add failing tests for a collider height equal to 50% of the one-unit hero artwork, a local center at `y = -0.25`, bottom/top bounds of `-0.5` and `0`, and unchanged width/depth; verify the focused test fails for the current centered collider.
- [x] 1.2 Add failing tests for asymmetric top- and bottom-edge arena containment while preserving horizontal containment; verify the focused boundary tests fail under the current symmetric half-extent behavior.

## 2. Physics Implementation

- [x] 2.1 Replace the centered hero collider with a bottom-offset box on the existing gameplay root, preserve collision metadata and callbacks, and verify the focused geometry and collision tests pass.
- [x] 2.2 Update hero resource ownership so the physics body and shape are disposed with the hero, and verify lifecycle tests or disposal assertions pass without leaked Babylon resources.
- [x] 2.3 Update arena containment to use directional collider offsets and verify focused boundary, movement, jiggle, collision, and knockback tests pass.

## 3. Regression Verification

- [x] 3.1 Run the complete automated test suite and verify hero formation, movement, collision, knockback, arena containment, and shadow-centered z sorting remain passing.
- [x] 3.2 Run the production build and verify it completes without new dependencies, import errors, or bundling regressions.
- [x] 3.3 Run the game in a real browser and inspect collider alignment in a large desktop viewport, a narrow portrait viewport, and a tall mobile viewport where width limits the frame; verify the collider covers only the feet and legs from the artwork bottom to its midpoint, the head does not collide, and the centered frame remains exactly 9:16 without overlap or incidental reflow.
