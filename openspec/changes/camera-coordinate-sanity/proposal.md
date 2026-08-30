## Why

The game relies on scene-space movement and line placement, so the camera's axis orientation should be explicit and protected from accidental inversion. The current orthographic setup appears to already use the conventional screen-space mapping: increasing X moves right and increasing Y moves up.

## What Changes

- Define and verify the camera coordinate contract for the 2D battle plane.
- Preserve the existing orientation in which positive X is screen-right and positive Y is screen-up.
- Add focused regression coverage and browser-visible verification for axis direction and portrait resizing.
- Do not invert coordinates, change camera handedness, or add a camera/UI dependency.

## Capabilities

### New Capabilities

- `camera-coordinate-contract`: Defines the observable mapping between Babylon scene axes and the portrait game frame.

### Modified Capabilities

## Impact

- Affects the Babylon camera configuration in `src/main.js` and coordinate-oriented tests.
- No runtime dependency, public API, physics, touch-input, or asset changes are expected.
