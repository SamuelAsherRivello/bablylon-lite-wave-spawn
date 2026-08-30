## MODIFIED Requirements

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
- **THEN** the Pawn reaches that distance first because its profile speed is
  30 while Rook and Bishop profiles are 20

### Requirement: Sequential hero selection

The player SHALL choose three distinct hero types from cards, first from three
available choices, then from the two remaining choices, and finally receive
the last unchosen type. Each available card SHALL show the selected hero's
canonical role and health, speed, and damage values.

#### Scenario: Player drafts three hero types

- **WHEN** the player selects a hero card
- **THEN** that hero is assigned to the next player line
- **AND** the card shows the same profile values used by the assigned heroes
- **AND** the selected hero is removed from subsequent choices

#### Scenario: Player choice is revealed in stages

- **WHEN** the player selects a hero
- **THEN** the cards are removed immediately
- **AND** the selected formation appears one hero at a time at 50ms intervals,
  spawning from left to right
- **AND** the game waits 500ms before showing the next available cards
- **AND** the player must make exactly three distinct clicks
