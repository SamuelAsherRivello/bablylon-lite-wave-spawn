## 1. Animation Contract and Tests

- [x] 1.1 Add failing tests for the centralized human-readable animation configuration, including 0.1-to-0.2-second idle and walking defaults, configurable blink settings, and the 0.1-second dead shrink default; verify the focused test fails for the missing contract.
- [x] 1.2 Add failing deterministic tests for bounded, non-identical consecutive idle and walking cycle variations using an injected random source; verify the focused test fails before the variation helper exists.
- [x] 1.3 Add failing state-transition tests covering damage restoration, terminal dead priority, blink sequencing, and death completion; verify the focused test fails before the controller behavior exists.
- [x] 1.4 Add failing tests for initial `SPAWN`, configurable 0.2-second Babylon.js `BackEase`/`EASEOUT`, 0%-to-100% scale progression, transition to `IDLE`, and held repeating-state requests; verify the focused test fails before spawn exists.

## 2. Procedural Artwork Animation

- [x] 2.1 Implement the animation state names, centralized configuration, and pure randomized-cycle helpers; verify the configuration and variation tests pass.
- [x] 2.2 Implement the per-hero time-based animation controller for randomized `IDLE` and `WALKING` artwork transforms, resetting to a neutral local pose at state boundaries; verify controller tests pass and no bounds, collider, or shadow transform is written.
- [x] 2.3 Implement configurable `TAKE_DAMAGE` artwork color blinking with restoration to the correct repeating state and coalesced repeated triggers; verify damage state and material restoration tests pass.
- [x] 2.4 Implement terminal `DEAD` artwork color blinking followed by a configurable 100%-to-0% scale transition and completion notification; verify sequence, duration, scale endpoints, and terminal-state tests pass.
- [x] 2.5 Connect the controller to hero render updates and disposal, ensuring every observer and hero-owned Babylon resource is released exactly once; verify lifecycle tests pass.
- [x] 2.6 Implement Babylon.js easing resolution and the initial `SPAWN` state so artwork scales from 0% to 100% before entering the queued repeating state; verify focused spawn tests pass.

## 3. Gameplay Integration

- [x] 3.1 Trigger `IDLE` when heroes are stationary and `WALKING` from actual movement state without changing hero root physics velocity; verify focused gameplay tests cover both transitions.
- [x] 3.2 Trigger `TAKE_DAMAGE` for surviving collision participants and `DEAD` at zero health; verify focused collision tests cover state requests for both heroes.
- [x] 3.3 Mark defeated units inactive and disable their movement/collision participation immediately while delaying visual disposal until `DEAD` completes; verify tests prove defeated units cannot be targeted or damaged again and remain renderable through the terminal effect.
- [x] 3.4 Keep rendering active until pending death animations finish before presenting or freezing the final battle state; verify an integration test covers the last-unit death sequence.
- [x] 3.5 Preserve hero lines 1 through 6 and verify every formation starts each hero's `SPAWN` animation in left-to-right creation order.

## 4. Verification

- [x] 4.1 Run the complete automated test suite and verify all tests pass without timing-dependent flakes.
- [ ] 4.2 Run the production build and verify it completes without warnings or new dependencies.
- [x] 4.3 Run the game in a real desktop browser and verify idle variation, walking variation, damage blink, dead blink-then-shrink, stable shadows, and unchanged collider placement.
- [x] 4.4 Verify the same battle behavior in a real portrait mobile viewport, including a resize during active animation, and confirm the centered 9:16 frame and animation continuity remain intact.
- [x] 4.5 Run the game in real desktop and portrait mobile browser viewports and verify each hero line appears left to right with artwork easing from 0% to 100% scale before idle.
