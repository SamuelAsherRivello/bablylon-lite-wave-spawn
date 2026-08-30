# hero-line-battle Specification

## Purpose

Define the first playable hero battle loop, including its app and game states,
draft choices, line ownership, movement directions, and physical collisions.

## Requirements

### Requirement: App and game state flow

The application SHALL expose a `MainMenu` app state with only the field
background visible, and a `Gameplay` app state containing `Starting`,
`HeroSelection`, `FormationReady`, and `Started` game states.

#### Scenario: Main menu begins empty

- **WHEN** the application starts
- **THEN** the field background is drawn
- **AND** no gameplay UI or hero is visible

#### Scenario: Gameplay begins

- **WHEN** the player enters Gameplay
- **THEN** the game enters Starting before showing hero choices
- **AND** the game progresses to HeroSelection

### Requirement: Sequential hero selection

The player SHALL choose three distinct hero types from cards, first from three
available choices, then from the two remaining choices, and finally receive
the last unchosen type.

#### Scenario: Player drafts three hero types

- **WHEN** the player selects a hero card
- **THEN** that hero is assigned to the next player line
- **AND** the selected hero is removed from subsequent choices

#### Scenario: Player choice is revealed in stages

- **WHEN** the player selects a hero
- **THEN** the cards are removed immediately
- **AND** the selected formation appears one hero at a time at 50ms intervals,
  spawning from left to right
- **AND** the game waits 500ms before showing the next available cards
- **AND** the player must make exactly three distinct clicks

### Requirement: Player and enemy line formations

The player SHALL control heroes on lines 4, 5, and 6, and the enemy SHALL
control heroes on lines 1, 2, and 3. Player line counts SHALL be 1, 3, and 5
from lines 4 through 6; enemy line counts SHALL be 5, 3, and 1 from lines 1
through 3. Battle heroes SHALL visibly identify their side with a blue
alpha-aware outline for player heroes and a red alpha-aware outline for enemy
heroes.

#### Scenario: Formations become ready

- **WHEN** all three player hero choices are complete
- **THEN** player heroes occupy lines 4, 5, and 6 with counts 1, 3, and 5
- **AND** after player line 6 is placed, one unused enemy type is randomly
  assigned to line 1 with 5 heroes
- **AND** after player line 5 is placed, one unused enemy type is randomly
  assigned to line 2 with 3 heroes
- **AND** after player line 4 is placed, the final unused enemy type is
  randomly assigned to line 3 with 1 hero
- **AND** the game enters FormationReady
- **AND** player heroes show blue outlines while enemy heroes show red outlines

### Requirement: Opposing movement

Player heroes SHALL move upward from lines 4, 5, and 6. Enemy heroes SHALL
move downward from lines 1, 2, and 3. Each hero SHALL use the speed in its
canonical stats profile, scaled by the battle's existing movement scale, and
each hero SHALL have an independent random left-right temporary walk jiggle.
Movement SHALL begin one second after the final 500ms formation pause.

#### Scenario: Battle movement starts

- **WHEN** one second has elapsed after the final formation pause
- **THEN** the game enters Started
- **AND** player heroes move upward using their profile speed
- **AND** enemy heroes move downward using their profile speed
- **AND** each hero visibly jiggles left and right with its own random motion

#### Scenario: Hero speed creates a visible role difference

- **WHEN** a Pawn and either a Rook or Bishop move over the same unobstructed
  distance
- **THEN** the Pawn reaches that distance first because its profile speed is 30
  while Rook and Bishop profiles are 20

### Requirement: Stat values are visible during selection

Each available card SHALL show the selected hero's canonical role and health,
speed, and damage values.

#### Scenario: Player compares hero choices

- **WHEN** the player views the available hero cards
- **THEN** each card shows the same profile values used by assigned heroes

### Requirement: Artwork-specific physics colliders

Each hero SHALL use a physics collider whose width and depth preserve the
existing hero collision footprint and whose height is exactly 50% of the hero
artwork height. The collider SHALL be anchored to the bottom center of the hero
artwork so its bottom edge aligns with the artwork bottom and its top edge
aligns with the artwork vertical midpoint. The hero's head and upper half SHALL
remain outside the collider. The collider SHALL remain attached to the hero's
gameplay root without changing the artwork, shadow, shadow-centered sorting
pivot, or game-frame-relative composition.

#### Scenario: Heroes collide by their feet

- **WHEN** two hero colliders overlap during movement
- **THEN** physics resolves the collision using only the bottom-anchored lower
  half of each hero
- **AND** the heroes' heads and upper artwork do not trigger or block the
  collision

#### Scenario: Collider stays aligned during hero motion

- **WHEN** a hero moves, jiggles, collides, or receives knockback
- **THEN** its collider remains anchored between the artwork bottom and vertical
  midpoint
- **AND** the hero artwork, shadow, and shadow-centered sorting pivot retain
  their existing alignment to the gameplay root

#### Scenario: Collider remains correct across supported viewport shapes

- **WHEN** the collider bounds are inspected in a large desktop viewport, a
  narrow portrait viewport, and a tall mobile viewport where width limits the
  game frame
- **THEN** the collider covers exactly the bottom 50% of the hero artwork in
  each viewport
- **AND** the centered game frame remains exactly 9:16 without overlap,
  incidental reflow, or non-uniform scaling
