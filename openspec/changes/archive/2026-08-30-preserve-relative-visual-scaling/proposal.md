## Why

The selection artwork currently mixes game-frame-relative measurements with fixed pixel sizes, so shrinking the browser makes character art, cards, text, spacing, and effects drift out of proportion. The game needs a durable presentation contract that preserves the authored composition on large desktop browsers and narrow portrait mobile viewports, and that every future feature must honor.

## What Changes

- Require browser-visible artwork and UI inside the centered 9:16 game frame to preserve their relative size and position when the frame resizes.
- Scale the selection composition, including cards, hero artwork, labels, spacing, borders, and shadows, from the game frame rather than mixing frame-relative and fixed viewport measurements.
- Preserve the existing three-card row and the large-browser composition instead of introducing narrow-screen reflow.
- Document the relative-scaling and positioning contract in the permanent portrait game-frame specification, the contributor-facing README, and project-wide OpenSpec apply guidance so future features must comply.
- Add automated checks for known mixed-unit regressions and real-browser verification at representative desktop and narrow portrait viewport sizes.
- Add no new dependencies.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `portrait-game-frame`: Extend the responsive presentation contract so all browser-visible game artwork and UI preserve their authored relative sizing and positioning across supported viewport sizes, including future features.

## Impact

- Responsive styling in `src/style.css`, especially selection-card and hero-art sizing.
- Tests that enforce the game-frame-relative scaling contract.
- Browser verification of desktop and portrait mobile layouts.
- Permanent documentation in `openspec/specs/portrait-game-frame/spec.md`, `openspec/config.yaml`, and `README.md`.
- No public API, save-data, gameplay-rule, or dependency changes.
