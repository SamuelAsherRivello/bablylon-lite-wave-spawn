# hero-line-battle Specification

## Purpose

Define the first playable hero battle loop, including its app and game states,
draft choices, line ownership, movement directions, and physical collisions.

## Requirements

### Requirement: App and game state flow
The application SHALL expose a `MainMenu` app state and a `Gameplay` app state.
Gameplay SHALL distinguish wave introduction, hero selection, formation-ready,
started battle, wave-complete, and game-over states without allowing an inactive
state to advance mutable gameplay.

#### Scenario: Main menu begins empty
- **WHEN** the application starts with Skip Start Menu off
- **THEN** the field background and mandatory main-menu prompt are visible
- **AND** no gameplay hero or selection card is visible

#### Scenario: Gameplay begins
- **WHEN** the player activates Play or startup skips the main menu
- **THEN** Gameplay enters the Wave 1 introduction before showing hero choices
- **AND** it progresses to hero selection only after the introduction completes

### Requirement: Sequential hero selection
During every wave, the player SHALL choose three distinct hero types from cards:
first from three available choices for line 6, then from the two remaining
choices for line 5, and finally the last unchosen type for line 4. Each wave
SHALL require exactly three clicks even when survivors have carried forward.

#### Scenario: Player drafts three hero types
- **WHEN** the player selects a hero card
- **THEN** that hero is assigned to the next line for the current wave
- **AND** the selected hero is removed from subsequent choices in that wave
- **AND** the corresponding enemy type is selected from unused enemy types for
  the mirrored enemy line

#### Scenario: Player choice is revealed in stages
- **WHEN** the player selects a hero
- **THEN** the cards are removed immediately
- **AND** the selected formation appears one hero at a time at 50ms intervals,
  spawning from left to right
- **AND** the game waits 500ms before showing the next available cards
- **AND** the player must make exactly three distinct clicks per wave

### Requirement: Player and enemy line formations
The player SHALL add new formations to lines 6, 5, and 4 with counts 5, 3, and 1.
The enemy SHALL add mirrored formations to lines 1, 2, and 3 with counts 5, 3,
and 1. Before wave 2 and wave 3 selection begins, every surviving player hero
SHALL be moved to line 6 and every surviving enemy hero SHALL be moved to line 1
without restoring lost health. Battle heroes SHALL retain their blue player or
red enemy alpha-aware outline.

#### Scenario: Next-wave survivors are visible
- **WHEN** the Wave 2 or Wave 3 introduction finishes
- **THEN** surviving player heroes are visible on line 6
- **AND** surviving enemy heroes are visible on line 1
- **AND** their health values equal their values at the end of the prior wave

#### Scenario: First new formations join survivors
- **WHEN** the first player choice of wave 2 or wave 3 is selected
- **THEN** the new five-hero player formation is added to line 6
- **AND** all old and new player heroes on line 6 are re-spaced together from
  left to right without overlapping fixed slots
- **AND** the mirrored enemy formation joins and re-spaces with enemy survivors
  on line 1

#### Scenario: Formations become ready
- **WHEN** all three choices for the current wave are complete
- **THEN** newly added player formations occupy lines 6, 5, and 4 with counts
  5, 3, and 1
- **AND** newly added enemy formations occupy lines 1, 2, and 3 with counts
  5, 3, and 1
- **AND** survivors carried into the back lines remain part of the battle
- **AND** the game enters FormationReady

### Requirement: Opposing movement

Player heroes SHALL move toward opposing heroes from lines 4, 5, and 6. Enemy
heroes SHALL move toward opposing heroes from lines 1, 2, and 3. Each hero
SHALL use the speed in its canonical stats profile, scaled by the battle's
existing movement scale and the selected arena's global friction. Higher
arena friction SHALL slow every hero proportionally without changing the
relative ordering of canonical hero speeds. Movement SHALL begin one second
after the final 500ms formation pause and SHALL remain within the arena's
playable floor.

#### Scenario: Battle movement starts

- **WHEN** one second has elapsed after the final formation pause
- **THEN** the game enters Started
- **AND** each player and enemy hero moves toward a selected opposing hero
- **AND** each hero's effective speed reflects the selected arena's friction
- **AND** arena walls prevent heroes from leaving the playable floor

#### Scenario: Hero speed creates a visible role difference

- **WHEN** a Pawn and either a Rook or Bishop move over the same unobstructed
  surface in the same arena
- **THEN** the Pawn reaches that distance first because its profile speed is 30
  while Rook and Bishop profiles are 20

#### Scenario: Arena friction changes effective movement

- **WHEN** equivalent heroes move unobstructed in two arenas with different
  global friction values
- **THEN** the hero in the higher-friction arena moves more slowly
- **AND** neither hero's canonical stats profile is modified

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
