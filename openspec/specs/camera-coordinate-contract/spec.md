# camera-coordinate-contract Specification

## Purpose

Makes the 2D battle plane's axis orientation explicit so movement, formation placement, and future camera changes remain visually predictable.

## Requirements

### Requirement: Conventional 2D camera axes

The battle camera SHALL present increasing world X toward screen-right and increasing world Y toward screen-up. The camera SHALL keep the battle plane at a stable viewing depth.

#### Scenario: Positive axes are visually conventional

- **WHEN** two otherwise identical objects are placed with one object at a greater world X and another at a greater world Y
- **THEN** the greater-X object appears farther right and the greater-Y object appears higher in the game frame

#### Scenario: Existing battle lines retain their meaning

- **WHEN** the six battle lines are rendered
- **THEN** lines with larger Y coordinates appear higher in the frame and player upward movement uses positive Y

### Requirement: Coordinate orientation survives responsive layout

The axis mapping SHALL remain unchanged when the centered 9:16 frame is resized across desktop and portrait mobile-sized viewports, including touch-capable browsers.

#### Scenario: Resize does not invert axes

- **WHEN** the viewport is resized while the game is displayed
- **THEN** positive X remains screen-right and positive Y remains screen-up without a camera runtime error
