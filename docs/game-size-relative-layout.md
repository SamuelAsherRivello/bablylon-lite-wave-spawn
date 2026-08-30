# Game-size-relative layout

The centered 9:16 `.game-frame` is the visual coordinate system for this game.
Every feature rendered inside it must preserve its relative size and position as
the browser changes size, unless an OpenSpec requirement explicitly defines a
different composition.

## Coordinate ownership

Choose units according to the element that owns the relationship:

| Relationship | Preferred unit | Example |
| --- | --- | --- |
| Component to the whole game frame | `cqw` | Card width, hero size, global gap, font size |
| Child to its already-scaled component | `%` | Sprite fill, shadow width, local inset |
| Element to its containing layout | Flexbox, Grid, `%` | Centering or distributing children |
| Babylon scene object to the arena | Babylon world units | Mesh position, camera bounds, collider size |
| Page shell outside the game frame | Viewport units when appropriate | Centering and fitting the 9:16 frame |

The game frame has a fixed aspect ratio, so `cqw` supplies one uniform scale
factor for both horizontal and vertical measurements. A value of `10cqw` is
always 10 percent of the game-frame width, regardless of the browser viewport.

## Recommended pattern

Use frame-relative units to establish a component's outer size and placement,
then use percentages to compose children inside it.

```css
.game-panel {
  width: 30cqw;
  height: 20cqw;
  padding: 2cqw;
  gap: 1.5cqw;
  font-size: 3cqw;
}

.game-panel-art {
  width: 80%;
  height: 65%;
}
```

This keeps the panel tied to the game frame while allowing its artwork to stay
proportional to the panel.

## Positioning

- Prefer Grid and Flexbox for groups whose internal spacing is structural.
- Use `cqw` for offsets measured in the global game composition.
- Use `%` for offsets that are intentionally relative to a local component.
- Keep one clear reference system within a relationship. Do not size one sibling
  from the game frame and another sibling from fixed screen pixels.
- Preserve the authored composition during live browser resize and orientation
  changes; do not require a reload.

## Avoid mixed scaling

Do not use fixed `px`, `vw`, or `vh` values for visible content inside the game
frame when those values affect its relative size or position. Typical regressions
include:

- A `cqw` card containing fixed-pixel artwork.
- A frame-relative height with a fixed-pixel subtraction.
- Fixed-pixel gaps, borders, shadows, or text inside an otherwise scalable group.
- Browser viewport units for elements whose true owner is the narrower game frame.
- Independent `clamp()` rules that cause related elements to stop scaling at
  different viewport sizes.

Fixed pixels remain acceptable outside the game composition or when a later
specification deliberately requires a screen-pixel behavior.

## Babylon and DOM layers

Babylon scene objects use the orthographic camera and world coordinates; do not
convert those positions to CSS units. HTML overlays use the game frame as their
container and should follow the `cqw` and local-percentage rules above. When a DOM
element must align with a Babylon object, define and test an explicit projection
or shared coordinate contract rather than matching it with an arbitrary pixel
offset.

## Intentional exceptions

A feature may introduce reflow, breakpoints, minimum touch-target sizing, or
non-uniform scaling only when its OpenSpec requirements describe the changed
composition and its acceptance scenarios cover the affected viewports. An
incidental layout difference is a regression, not a responsive design decision.

## Verification checklist

For every feature that changes visible game-frame content:

1. Confirm the frame remains centered and exactly 9:16.
2. Verify the composition in a large desktop viewport.
3. Resize the same browser session to a narrow portrait viewport.
4. Verify artwork, controls, text, spacing, borders, shadows, and effects retain
   their intended proportions and positions without overlap or unintended reflow.
5. Verify an additional tall mobile viewport where width limits the frame.
6. Compare normalized measurements against the game-frame width when visual
   inspection alone is inconclusive.
7. Add or update automated checks for the scaling contract and run the production
   build.
