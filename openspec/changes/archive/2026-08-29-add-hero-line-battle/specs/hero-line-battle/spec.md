## Purpose

Define the first playable hero battle loop, including its app and game states,
draft choices, line ownership, movement directions, and physical collisions.

## ADDED Requirements

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
- **AND** the selected formation appears one hero at a time at 250ms intervals
- **AND** the game waits 500ms before showing the next available cards
- **AND** the player must make exactly three distinct clicks

### Requirement: Player and enemy line formations

The player SHALL control heroes on lines 4, 5, and 6, and the enemy SHALL
control heroes on lines 1, 2, and 3. Player line counts SHALL be 1, 3, and 5
from lines 4 through 6; enemy line counts SHALL be 5, 3, and 1 from lines 1
through 3.

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

### Requirement: Opposing movement

Player heroes SHALL move upward from lines 4, 5, and 6. Enemy heroes SHALL
move downward from lines 1, 2, and 3. Movement SHALL begin one second after
the final 500ms formation pause, at 10% of the original planned vertical
speed. Each hero SHALL have an independent random left-right temporary walk
jiggle.

#### Scenario: Battle movement starts

- **WHEN** one second has elapsed after the final formation pause
- **THEN** the game enters Started
- **AND** player heroes move upward
- **AND** enemy heroes move downward
- **AND** each hero visibly jiggles left and right with its own random motion

### Requirement: Artwork-specific physics colliders

Each hero SHALL use a separate 10 by 10 physics collider positioned at the
bottom center of the hero artwork. The full artwork bounds SHALL NOT be used as
the hero collider.

#### Scenario: Heroes collide by their feet

- **WHEN** two hero colliders overlap during movement
- **THEN** physics resolves the collision using only the two 10 by 10
  bottom-center colliders
- **AND** transparent or non-collider artwork does not block movement
