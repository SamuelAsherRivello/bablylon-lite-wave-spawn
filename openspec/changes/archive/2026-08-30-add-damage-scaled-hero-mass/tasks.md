## 1. Specify Mass Balance With Tests

- [x] 1.1 Add focused failing tests for the bounded linear damage-to-mass rule, exact Pawn/Rook/Bishop masses (`1.00`, `1.05`, `1.10`), monotonic damage ordering, and the 10% maximum spread; run the focused test file and verify the new assertions fail for the current mass-less profiles.
- [x] 1.2 Add a focused failing physics-wiring test proving a spawned hero uses its profile mass for both aggregate construction and mass properties while retaining zero inertia and existing collider options; run it and verify it fails against the current hard-coded mass.
- [x] 1.3 Add focused failing tests for contact-axis momentum covering mass deciding equal-speed contact, speed overcoming a small mass disadvantage, equal opposing momentum, stationary or separating inputs, coincident-position fallback, tangential preservation, and finite outputs; run the focused test file and verify the new behavior is absent.

## 2. Implement Canonical Hero Mass

- [x] 2.1 Implement the centralized clamped linear mass derivation and expose the derived value on every frozen canonical hero profile; run the focused stat tests and verify all exact-value and range assertions pass.
- [x] 2.2 Retain the hero profile mass on each spawned hero and supply that single value to both physics aggregate creation and mass properties without changing collider geometry, friction, restitution, damping, or planar constraints; run the focused physics-wiring tests and verify they pass.

## 3. Implement Momentum-Aware Collision Pushing

- [x] 3.1 Implement the pure contact-axis momentum helper and centralized `0.10`-second collision-push duration, preserving tangential velocity and ignoring stationary or separating normal velocity; run the focused momentum tests and verify every head-on, angled, equal, fallback, and finite-output case passes.
- [x] 3.2 Add per-unit transient collision-push velocity and remaining time, update it on every active contact before damage-cooldown gating, and integrate the priority order removal/pause → damage knockback → collision push → pursuit; run focused gameplay tests and verify knockback wins, push refreshes during cooldown, pursuit cannot immediately erase push, and remembered targets survive until pursuit resumes.
- [x] 3.3 Add or extend controlled collision integration coverage with comparable and unequal incoming velocities; verify heavier equal-speed heroes win subtly, faster lighter heroes can win, equal momentum has no biased winner, and all bodies remain dynamic, planar, finite, depth-stable, and within the arena.

## 4. Verify Regressions And Build

- [x] 4.1 Run `npm.cmd test` and verify the full automated suite passes, including existing movement, collision damage, directional knockback, death/removal, pause, arena-boundary, and depth-ordering coverage.
- [x] 4.2 Run `npm.cmd run build` and verify the Vite production build completes without new errors.

## 5. Verify Live Browser Behavior

- [x] 5.1 Start the documented local Vite app and, in one real-browser session, observe sustained head-on and angled contacts involving Pawn, Rook, and Bishop; verify equal-speed mass differences and unequal-speed momentum affect which hero pushes the contact, the effect persists across frames without becoming dramatic, and damage knockback still takes priority without rotation, depth drift, lost targeting, or broken cooldown behavior.
- [x] 5.2 In that same live session, repeat or observe representative collisions at a large desktop viewport, a narrow portrait viewport, and a tall mobile viewport where width limits the frame; verify equivalent world-space behavior and confirm the game frame remains centered and exactly 9:16 with no overlap or incidental reflow.
