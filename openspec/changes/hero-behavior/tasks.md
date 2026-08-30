## 1. Targeting rules and regression coverage

- [x] 1.1 Add pure target-ranking and eligibility behavior for active, untargeted, and already-targeted enemies, including squared-distance, current-health, stable-order, and empty-set cases; verify with focused unit tests.
- [x] 1.2 Add tests proving a valid remembered target is retained when another enemy becomes closer, and that a removed target is reacquired or cleared; verify target references never point at removed enemies.

## 2. Runtime hero behavior

- [x] 2.1 Add per-unit target state with initialization, validation, and cleanup aligned with the existing hero removal lifecycle; verify active heroes can hold at most one target.
- [x] 2.2 Update battle movement to select targets in stable unit order, prefer untargeted enemies, fall back to targeted enemies when necessary, and use normalized target-directed velocity with existing profile speed and movement scale; verify movement-source and behavior tests pass.
- [x] 2.3 Preserve fixed depth, collision handling, animation/jiggle, formation timing, and zero velocity when no opposing enemy remains; verify focused battle tests pass.

## 3. Integration verification

- [x] 3.1 Run the complete test suite and production build with `npm.cmd test` and `npm.cmd run build`; verify both complete successfully.
- [ ] 3.2 Start the Vite app and perform real-browser smoke tests on desktop and portrait mobile-sized viewports: complete hero selection, observe formations entering Started, confirm heroes move toward opponents, and resize during movement without console/runtime errors.
