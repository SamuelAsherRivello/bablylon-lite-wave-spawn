## 1. Depth-Ordering Regression Coverage

- [x] 1.1 Add focused tests proving that a lower shadow-centered pivot y produces a higher hero z-sort value and front order, and run the focused test to confirm it fails against the current reversed behavior.
- [x] 1.2 Add coverage proving artwork dimensions and visual centers do not affect sorting, equal pivot y values remain deterministic, and two moving heroes exchange order when their pivot y values cross; run the focused tests and confirm the new cases are exercised.

## 2. Pivot-Based Hero Sorting

- [x] 2.1 Update the shared hero depth mapping so decreasing pivot y increases the hero z-sort value while keeping the complete arena y range inside the existing hero layer band; verify the focused mapping and layer-separation tests pass.
- [x] 2.2 Ensure each hero calculates depth from its root pivot at the center of its shadow on creation and during movement, without deriving a point from artwork bounds or centers; verify the focused hero depth tests pass.

## 3. Integration Verification

- [x] 3.1 Run the full automated test suite and production build, confirming movement, physics, animation, shadows, projectiles, and existing depth-layer contracts remain green.
- [x] 3.2 In one real-browser session, create or capture a controlled overlapping-hero case at a large desktop viewport, a narrow portrait viewport, and a tall mobile viewport where width limits the frame; verify the lower shadow-center pivot renders in front, ordering updates when pivots cross, and the frame remains centered and exactly 9:16 without reflow or incidental overlap errors.
