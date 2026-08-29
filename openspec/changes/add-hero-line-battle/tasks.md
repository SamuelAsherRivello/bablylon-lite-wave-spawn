## 1. State and draft model

- [x] 1.1 Add AppState and GameState transitions and verify MainMenu starts with only the background
- [x] 1.2 Add hero definitions and sequential three-choice drafting and verify no hero can be selected twice

## 2. Formations and rendering

- [x] 2.1 Render player lines 4, 5, and 6 with counts 1, 3, and 5 and verify the formation visually
- [x] 2.2 Randomly assign enemy heroes to lines 1, 2, and 3 with counts 5, 3, and 1 and verify all three types appear
- [x] 2.3 Add shared 9:16 line-position mapping and verify pointer/touch selection remains usable after resize

## 3. Movement and physics

- [x] 3.1 Add one-second delayed opposing movement at 10% of the original speed with independent random temporary walk jiggles and verify player units move up while enemy units move down
- [ ] 3.2 Add dedicated 10x10 bottom-center colliders and verify collisions use collider bounds rather than full artwork bounds

## 4. Verification

- [x] 4.1 Run `npm.cmd run build` and verify the production build succeeds
- [ ] 4.2 Run the local Vite server and verify the complete selection, formation, and movement flow in a real desktop browser
- [ ] 4.3 Verify the same flow in a portrait-sized browser viewport and run `git diff --check`
