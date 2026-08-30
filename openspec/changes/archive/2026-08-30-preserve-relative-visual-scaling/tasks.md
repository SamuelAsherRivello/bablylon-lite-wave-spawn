## 1. Lock the Scaling Regression with Tests

- [x] 1.1 Add or update focused tests that fail while selection artwork, card height adjustments, borders, spacing, shadows, or typography use independent fixed-pixel sizing, and verify the new tests fail against the current mixed-unit styles.
- [x] 1.2 Add test coverage for the cross-feature documentation contract in `README.md` and `openspec/config.yaml`, and verify the tests identify missing proportional-scaling guidance before those documents are updated.

## 2. Apply Uniform Game-Frame Scaling

- [x] 2.1 Replace mixed fixed-pixel measurements in the selection composition with game-frame-relative measurements while preserving the existing large-browser ratios and three-card row, then verify the focused scaling tests pass.
- [x] 2.2 Audit other browser-visible content inside the game frame for independent viewport or fixed-pixel sizing that changes relative appearance or position, correct in-scope violations, and verify the complete automated test suite passes with `npm.cmd test`.

## 3. Make the Contract Durable

- [x] 3.1 Add concise contributor guidance to `README.md` requiring every future game-frame feature to preserve relative sizing and positioning unless its specification explicitly defines another composition, and verify the documentation test passes.
- [x] 3.2 Extend `openspec/config.yaml` project context and apply guidance so future proposals, designs, specifications, tasks, and implementation checks address frame-relative sizing and positioning on desktop and narrow portrait viewports, then verify OpenSpec can read the updated configuration.
- [x] 3.3 Confirm the `portrait-game-frame` delta contains browser-visible scenarios for existing and future features, then run `openspec validate preserve-relative-visual-scaling --strict` successfully so it is ready to sync into the permanent specification during change completion.

## 4. Production and Browser Verification

- [x] 4.1 Run `npm.cmd run build` and verify the production bundle completes without errors.
- [x] 4.2 Run the game in a real browser at a representative large desktop viewport and verify the selection screen retains its intended composition, artwork containment, positions, and interactions.
- [x] 4.3 Resize the same real-browser session to approximately 295 by 518 pixels and at least one additional portrait mobile viewport, then verify the cards, hero artwork, labels, spacing, borders, and shadows scale proportionally without overlap or reflow and without requiring a reload.
- [x] 4.4 Compare desktop and narrow-portrait evidence, verify relative measurements remain consistent within normal browser rounding, and record the tested viewport sizes with the implementation handoff.
