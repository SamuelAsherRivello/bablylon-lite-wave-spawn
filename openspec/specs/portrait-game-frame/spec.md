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

### Requirement: Proportional game composition

All browser-visible artwork and interface elements rendered inside the game frame SHALL preserve their authored relative size and position as the game frame resizes. Elements that belong to one composition SHALL scale from the game frame rather than independently from fixed screen-pixel or browser-viewport dimensions.

#### Scenario: Selection screen shrinks with a narrow portrait viewport

- **WHEN** the browser is resized from a large viewport to a narrow portrait viewport
- **THEN** the selection cards, hero artwork, labels, spacing, borders, and shadows retain the same relative proportions
- **AND** the hero artwork remains contained by its intended card region without overlap caused by unequal scaling
- **AND** the three selection cards remain in their authored row and relative positions

#### Scenario: Selection screen expands with a large desktop viewport

- **WHEN** the game frame grows within a large desktop browser
- **THEN** the selection composition grows uniformly with the frame
- **AND** no component becomes disproportionately small because it is sized independently of the frame

#### Scenario: Viewport changes while the game is visible

- **WHEN** the browser is resized or a mobile device changes orientation
- **THEN** the visible game composition updates to the new frame size without requiring a reload
- **AND** the relative size and position of existing artwork and interface elements remain consistent

### Requirement: Cross-feature visual scaling contract

Every feature that adds or changes browser-visible content inside the game frame SHALL preserve the proportional sizing and positioning contract unless a later specification explicitly changes the authored composition.

#### Scenario: A future feature adds visible game-frame content

- **WHEN** a future change introduces artwork, controls, text, effects, or layout inside the game frame
- **THEN** its specification, implementation, and browser verification preserve frame-relative sizing and positioning
- **AND** verification covers both a large desktop viewport and a narrow portrait viewport

#### Scenario: A feature intentionally changes composition

- **WHEN** a future feature requires an intentional breakpoint, reflow, or non-uniform size change
- **THEN** that behavior is defined explicitly in the feature specification
- **AND** it is not introduced as an incidental consequence of viewport resizing
