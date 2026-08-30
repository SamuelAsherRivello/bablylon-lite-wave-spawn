## 1. Persistent Settings and Audio Categories

- [x] 1.1 Add focused failing tests for a versioned namespaced settings document, arbitrary key reads/writes, 100 defaults, immediate subscriptions, reload persistence, invalid-value recovery, and unavailable or throwing browser storage; run the focused tests and confirm the new behavior fails before implementation.
- [x] 1.2 Implement the general in-memory and browser-local settings store without new dependencies; verify the focused storage tests pass and malformed storage cannot prevent game startup.
- [x] 1.3 Extend audio tests first for creation-time SFX multiplication at 100, fractional levels, and 0 while proving configured pitch, per-effect loudness, overlap, and already-created instances remain unchanged; run the focused audio tests and confirm the new assertions fail.
- [x] 1.4 Route newly created SFX playback through the stored category multiplier and expose the reserved Music category setting; verify all audio and settings-store tests pass.

## 2. Shared Pause Authority

- [x] 2.1 Add focused failing tests for active-time delta, pause-aware delays, nested or repeated pause/resume idempotence, and terminal-state behavior; run them and confirm the pause contract is not yet satisfied.
- [x] 2.2 Implement one pause authority and active-time scheduler, then migrate formation staggering and battle-start delays away from pause-insensitive browser timeouts; verify pausing during each selection/formation delay preserves its exact remaining duration.
- [x] 2.3 Add failing regression tests that inventory every mutable frame-time consumer: movement and targeting, contact and ranged cooldowns, projectiles, hero animations, damage clouds, death completion, and battle-result progression; verify each remains unchanged across simulated paused time.
- [x] 2.4 Route every inventoried time consumer through the shared active-game delta while leaving non-mutating rendering synchronization active; verify all focused gameplay, projectile, particle, and animation tests pass.
- [x] 2.5 Add failing tests for snapshotting live-body velocities, zero motion and collision effects while paused, deterministic restoration, and safe handling of removed or newly created bodies; run the focused physics tests and confirm the behavior fails before implementation.
- [x] 2.6 Suspend Havok progression and collision handling during resumable pauses, preserve and restore valid body velocities, and separate terminal simulation from presentation; verify a controlled battle test shows unchanged positions, health, cooldowns, projectiles, and effects throughout a long pause and correct continuation afterward.

## 3. Reusable Window and Settings Interface

- [x] 3.1 Add failing DOM tests for a reusable titled modal with caller-supplied content, dialog semantics, named X control, direct-backdrop dismissal, gear-toggle dismissal, inside-content event isolation, and reliable disposal; run the focused tests and confirm the reusable window behavior fails.
- [x] 3.2 Implement the reusable game window and modal host using existing DOM APIs; verify the window tests pass and X, gear, and direct backdrop activation close it without inside interactions leaking or dismissing it.
- [x] 3.3 Add failing UI tests for post-loader gear availability in selection, formation, battle, and winner states; Music and SFX range inputs from 0 to 100; static endpoint labels; defaults and persisted values; immediate `input` writes; and no live numeric readout.
- [x] 3.4 Implement the post-loader settings chrome and compose the Settings Menu through the reusable window, including pause/resume integration and winner-screen terminal behavior; verify all focused UI, startup, pause, storage, and audio tests pass.
- [x] 3.5 Add frame-contract tests for an `8cqw` gear with `8.75cqw` top/right offsets, full-frame 50% black backdrop, centered window, and frame-relative panel contents without `px`, `vw`, `vh`, breakpoints, or independent clamps; implement the styling and verify the scaling tests pass.
- [x] 3.6 Create or select a dependency-free gear icon asset with a transparent background and accessible button name, then verify it loads under the configured Vite base path and remains legible at its authored frame-relative size.

## 4. Integrated Verification

- [x] 4.1 Run the complete automated test suite and any configured lint checks, fixing only regressions caused by this change and confirming the active arena and hero-sorting behavior still passes.
- [x] 4.2 Run the production build and verify it completes without missing gear, audio, Babylon.js, Havok, or base-path asset errors.
- [x] 4.3 In one real-browser session at a large desktop viewport, verify the gear is absent under the loader and then available through card selection, formation, battle, and the winner screen; test X, gear, and backdrop dismissal, underlying-input blocking, slider drag persistence across reload, creation-time SFX volume changes, and exact pause/resume state preservation.
- [x] 4.4 Resize that same live session to a narrow portrait viewport and a tall mobile viewport where width limits the frame; verify mouse and touch operation, native slider dragging, exact 9:16 centering, full backdrop coverage, and unchanged relative sizes and positions without overlap or incidental reflow.

## 5. Reset Settings

- [x] 5.1 Add focused failing storage tests proving reset removes only the game's namespaced document, preserves unrelated keys, restores both audio defaults in memory, notifies subscribers, and remains usable when removal throws; run the focused tests and confirm the reset behavior fails before implementation.
- [x] 5.2 Implement the store-level reset operation and verify all focused settings-store tests pass.
- [x] 5.3 Add a failing Settings Menu test for a Reset button below the audio controls that immediately changes both sliders to 100 without closing the modal; run it and confirm the UI behavior fails before implementation.
- [ ] 5.4 Implement and frame-relative style the Reset button, then run the full automated suite, production build, strict OpenSpec validation, and real-browser checks for changed values, persistence removal, same-session defaults, reload defaults, modal continuity, and narrow portrait composition.

## 6. Collider Visibility

- [x] 6.1 Add focused failing tests for the persisted `debug.showColliders` boolean, its false default and validation, the labeled checkbox's immediate writes/reset synchronization, and a controller that shows all current and subsequently created physics bodies without changing simulation.
- [x] 6.2 Implement the Collider checkbox and settings-store contract, then implement a disposable Babylon physics-viewer controller that tracks the arena and gameplay body inventories while enabled.
- [ ] 6.3 Run focused and full automated tests, the production build, strict OpenSpec validation, and real-browser checks for default-off, visible colliders, reload persistence, Reset-to-off, and desktop/narrow-portrait composition.
