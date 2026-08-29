# portrait-game-frame Specification

## Purpose

Define the responsive presentation contract for the small Babylon.js game.

## Requirements

### Requirement: Centered portrait frame

The game SHALL render inside a centered frame with an exact 9:16 aspect ratio.

#### Scenario: Wide desktop viewport

- **WHEN** the browser is wider than the game frame
- **THEN** the frame is centered horizontally
- **AND** equal backdrop space is visible on both sides

#### Scenario: Portrait mobile viewport

- **WHEN** the browser viewport is portrait-oriented
- **THEN** the frame remains within the visible viewport
- **AND** the frame is not stretched out of proportion

### Requirement: Responsive rendering

The Babylon.js engine SHALL resize its render target when the browser viewport
changes.

#### Scenario: Browser resize or orientation change

- **WHEN** the viewport dimensions change
- **THEN** the game frame retains its 9:16 aspect ratio
- **AND** the Babylon.js render target matches the displayed canvas

### Requirement: Touch-compatible canvas

The game canvas SHALL accept touch gestures for camera interaction without
requiring hover.

#### Scenario: Touch camera interaction

- **WHEN** a player drags or pinches on a touch-enabled browser
- **THEN** Babylon.js receives the interaction through the game canvas
