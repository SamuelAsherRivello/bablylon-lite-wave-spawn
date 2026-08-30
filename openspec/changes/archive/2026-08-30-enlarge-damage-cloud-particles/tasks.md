## 1. Specify Enlarged Cloud Bounds With Tests

- [x] 1.1 Extend focused particle tests with deterministic minimum, midpoint,
  and maximum random inputs that require sizes from `1.65` through `2.7`,
  horizontal offsets from `-0.255` through `0.255`, and vertical offsets from
  `-0.315` through `0.315`; run the focused test file and verify the new assertions
  fail against the current configuration.
- [x] 1.2 Preserve focused assertions for particle count, timing, fade,
  hero-relative parenting, layering, and cleanup; run the focused test file and
  verify these existing behaviors remain covered.

## 2. Update Damage-Cloud Configuration

- [x] 2.1 Change the damage-cloud minimum and maximum size bounds to `1.65` and
  `2.7`, then run the focused particle tests and verify every sampled size stays
  within the final range.
- [x] 2.2 Change the horizontal and vertical spawn ranges to `0.255` and
  `0.315`, retaining symmetric random sampling around the hero-relative spawn
  point; run the focused particle tests and verify minimum, midpoint, and maximum
  offsets match the specified bounds.
- [x] 2.3 Set cloud local depth to `-1` and verify each cloud renders in front of
  its owner while a nearer Y-sorted hero can still render in front of the cloud.

## 3. Verify Regressions And Build

- [x] 3.1 Run `npm.cmd test` and verify the full automated suite passes,
  including particle lifecycle, pause, hero animation, collision, and disposal
  coverage.
- [x] 3.2 Run `npm.cmd run build` and verify the Vite production build completes
  without new errors or dependencies.

## 4. Verify Live Browser Presentation

- [x] 4.1 Start the documented local Vite app and, in one real-browser session,
  observe repeated non-lethal damage bursts; verify clouds use the final visible
  size and close spread, render in front of their owner without bypassing global
  Y sorting, remain associated with the damaged hero, fade correctly, and
  produce no console errors.
- [x] 4.2 In that same session, inspect the effect at a large desktop viewport,
  a narrow portrait viewport, and a tall mobile viewport where width limits the
  frame; verify equivalent hero-relative size and placement and confirm the
  centered game frame remains exactly 9:16 with no overlap, incidental reflow,
  or non-uniform effect scaling.
