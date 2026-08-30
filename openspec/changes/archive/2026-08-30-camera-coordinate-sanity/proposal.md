## Why

The game relies on scene-space movement and line placement, so the camera's axis orientation should be explicit and protected from accidental inversion. A real-browser two-square test showed that the current camera mirrors X: increasing X moves screen-left, even though increasing Y moves up.

## What Changes

- Define and verify the camera coordinate contract for the 2D battle plane.
- Reorient the camera so positive X is screen-right and positive Y is screen-up.
- Preserve the field artwork, portrait framing, line layout, and gameplay result.
- Add focused regression coverage and browser-visible verification for axis direction and portrait resizing.
- Do not rewrite gameplay coordinates, change camera handedness globally, or add a camera/UI dependency.

## Capabilities

### New Capabilities

- `camera-coordinate-contract`: Defines the observable mapping between Babylon scene axes and the portrait game frame.

### Modified Capabilities

## Impact

- Affects the Babylon camera configuration in `src/main.js` and coordinate-oriented tests.
- No runtime dependency, public API, physics, touch-input, or asset changes are expected.
