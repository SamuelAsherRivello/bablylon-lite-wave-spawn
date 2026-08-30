## 1. Approved Artwork

- [x] 1.1 Copy the approved Option 2 PNG to `public/art/environmental/ground-crack.png` without resampling or overwriting another asset, and verify the delivered file remains a 1254 by 1254 PNG with an alpha channel.

## 2. Environmental Effects Core

- [x] 2.1 Add failing automated coverage for named effect creation, shared crack resources, 0.5 size scale, 1.0 opacity, fixed ground placement, persistence, and idempotent owner disposal; verify the targeted test fails for the missing system before production code is added.
- [x] 2.2 Add the environmental ground depth band and implement the scene-owned effect registry and `ground-crack` plane instances using the approved asset; verify the targeted environmental-effects tests pass and the depth test proves the band is strictly above the background and below shadows.
- [x] 2.3 Add a failing deterministic test for independent full-circle crack rotation around the plane center, then implement injectable random rotation and verify the targeted environmental-effects test passes without changing position, scale, opacity, depth, or resource sharing.
- [x] 2.4 Add failing tests for clamped linear damage scaling at 10, 20, and 30 damage plus invalid inputs, then implement the pure scale mapping and verify crack meshes use world scales 0.5, 0.625, and 0.75 without changing opacity, rotation, position, depth, or resource sharing.

## 3. Battle Event Integration

- [x] 3.1 Add failing projectile lifecycle tests proving every disposal reason reports one cloned final ground position and repeated disposal reports nothing extra; verify the targeted tests fail before changing `BishopProjectile`.
- [x] 3.2 Replace the projectile disposal wrapper with an explicit disposal callback and connect it to `ground-crack` creation plus projectile-set cleanup; verify the targeted projectile tests cover impact, missing-target, and repeated-disposal paths and pass.
- [x] 3.3 Add failing gameplay coverage proving hero death entry creates one crack at the final hero position and repeated removal creates no duplicate; verify the targeted test fails before changing hero-removal integration.
- [x] 3.4 Inject the environmental-effects owner into gameplay, connect hero death entry to `ground-crack` creation, and construct the owner during scene setup; verify the targeted gameplay and startup tests pass without changing combat outcomes.
- [x] 3.5 Add failing integration coverage for killing-blow damage and projectile-attacker damage propagation, then pass damage through hero and projectile crack creation and verify repeated removal/disposal remains exact-once.

## 4. Lifecycle and Regression Verification

- [x] 4.1 Run `npm.cmd test` and verify the complete automated suite passes, including damage scaling, effect resource disposal, exact-once triggers, depth ordering, and existing battle behavior.
- [x] 4.2 Run `npm.cmd run build` and verify the production build succeeds with the approved crack asset emitted and no new dependency.
- [x] 4.3 In one live browser session, verify hero and projectile cracks visibly range from the 100% baseline through 150% of baseline according to 10 through 30 damage on all available arenas, remain persistent and non-interactive, retain 100% opacity with varied centered rotations, and render above arena art but below combat objects.
- [x] 4.4 In that same live session, verify the centered frame remains exactly 9:16 and damage-derived crack size, position, opacity, and layering remain proportional at a large desktop viewport, a narrow portrait viewport, and a tall mobile viewport where width limits the frame, with no touch/input regression, overlap, or incidental reflow.
