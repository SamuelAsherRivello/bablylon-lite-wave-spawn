# arena-system Specification

## Purpose

Define visually distinct battle arenas with consistent playable geometry,
surface friction, random test selection, solid boundaries, and debug alignment.

## Requirements

### Requirement: Three numbered arenas

The game SHALL define Arena 1, Arena 2, and Arena 3, and each arena SHALL pair
one background artwork asset with one global friction value.

#### Scenario: Arena catalog is complete

- **WHEN** the arena catalog is loaded
- **THEN** it contains exactly three arenas numbered 1, 2, and 3
- **AND** each arena has one artwork asset and one friction value

### Requirement: Arena artwork geometry

Every arena artwork SHALL be exactly 800 by 1472 pixels. The outermost 70
pixels on the left, top, right, and bottom SHALL visually represent a wall and
SHALL be non-playable. The entire rectangular region inside that inset SHALL
visually represent playable floor.

#### Scenario: Artwork follows the shared template

- **WHEN** any of the three arena artwork files is inspected
- **THEN** its dimensions are exactly 800 by 1472 pixels
- **AND** its four outer 70-pixel bands depict non-playable walls
- **AND** the inset region depicts playable floor

#### Scenario: Arenas have distinct themes

- **WHEN** all arena artwork is compared
- **THEN** Arena 1 uses the existing grass field theme revised to the exact
  70-pixel wall contract
- **AND** Arena 2 uses a dirt floor with trees on the outer wall area
- **AND** Arena 3 uses a futuristic metal floor and metal walls

#### Scenario: Artwork is approved before integration

- **WHEN** the three artwork candidates have exact 70-pixel review guides
- **THEN** they are presented for explicit user approval
- **AND** none of the candidates is integrated into runtime arena selection
  before that approval

### Requirement: Random temporary arena selection

The game SHALL randomly select one arena once during each page load and SHALL
use that same arena for the complete battle session.

#### Scenario: Refresh can select another arena

- **WHEN** the player refreshes or newly loads the game
- **THEN** one of the three arenas is selected with equal probability
- **AND** its artwork, friction, and boundaries are used together

#### Scenario: Selection remains stable during play

- **WHEN** a battle progresses through selection, formation, and combat
- **THEN** the selected arena does not change until another page load

#### Scenario: Developer forces an arena

- **WHEN** the page loads with `?arena=1`, `?arena=2`, or `?arena=3`
- **THEN** the corresponding arena is selected instead of a random arena
- **AND** its artwork, friction, and boundaries remain paired for the session

### Requirement: Arena friction progression

Arena friction SHALL produce progressively slower hero movement: Arena 2
SHALL move every hero more slowly than Arena 1, and Arena 3 SHALL move every
hero more slowly than Arena 2. Arena friction SHALL preserve relative
differences among canonical hero speeds.

#### Scenario: Arena affects travel speed

- **WHEN** the same hero travels unobstructed for the same duration in each arena
- **THEN** it travels farthest in Arena 1
- **AND** it travels a shorter distance in Arena 2
- **AND** it travels the shortest distance in Arena 3

### Requirement: Arena perimeter collisions

Each arena SHALL have solid boundaries aligned to the inner edge of its
70-pixel wall bands. Hero physics bodies SHALL remain inside the playable
floor during movement and collision resolution.

#### Scenario: Hero reaches a wall

- **WHEN** a moving hero reaches any left, top, right, or bottom wall boundary
- **THEN** the wall prevents the hero collider from entering the non-playable area
- **AND** the hero does not bounce away from the wall
- **AND** movement parallel to the wall remains possible
- **AND** the hero remains visible on the playable floor

### Requirement: Collider debug display

Development builds SHALL provide an opt-in debug display that visibly overlays
the four arena wall colliders without changing collision behavior.

#### Scenario: Developer enables collider debugging

- **WHEN** collider debugging is enabled for a page load
- **THEN** all four perimeter colliders are visibly distinguishable over the artwork
- **AND** their playable-side faces align with the 70-pixel inset

#### Scenario: Collider debugging is disabled

- **WHEN** the game loads without the debug option
- **THEN** no collider visualization is visible
- **AND** perimeter collision behavior remains active

### Requirement: Responsive arena presentation

The selected arena SHALL retain the existing 9:16 game presentation and
collider alignment as the browser viewport changes on desktop and portrait
mobile browsers.

#### Scenario: Viewport resizes

- **WHEN** the browser viewport changes size or orientation
- **THEN** the artwork and game world scale together
- **AND** the visible wall boundary remains aligned with the physics boundary
