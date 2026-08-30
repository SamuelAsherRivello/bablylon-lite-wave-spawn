# Repository instructions for AI agents

## Game-frame visual scaling

Treat the centered 9:16 `.game-frame` as the visual coordinate system for every
feature rendered inside it.

- Preserve game-size-relative positioning and scale at every supported browser size.
- Use `cqw` for sizes, spacing, typography, effects, and offsets owned by the whole game frame.
- Use `%`, Grid, or Flexbox for relationships owned by an already-scaled component.
- Use Babylon world units for scene meshes, physics, and camera-space placement.
- Do not mix fixed `px`, `vw`, or `vh` measurements into game-frame content when they can change its relative size or position.
- Do not introduce breakpoints, reflow, independent clamps, or non-uniform scaling unless an approved OpenSpec requirement explicitly defines that composition.
- Verify browser-visible changes in the same live browser session at a large desktop viewport, a narrow portrait viewport, and a tall mobile viewport where width limits the frame.
- Confirm the frame remains centered and exactly 9:16, with no overlap or incidental reflow.

Read `docs/game-size-relative-layout.md` before designing or implementing any
feature that adds or changes visible content inside the game frame. Follow the
project-wide OpenSpec rules in `openspec/config.yaml` and the responsive contract
in `openspec/specs/portrait-game-frame/spec.md`.
