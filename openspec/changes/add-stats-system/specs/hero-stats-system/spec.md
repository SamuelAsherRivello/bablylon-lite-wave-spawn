## Purpose

Give every hero a single, readable, balance-tested set of combat statistics that is shown to players and consumed consistently during live hero gameplay.

## ADDED Requirements

### Requirement: Canonical hero stat profiles

The game SHALL define exactly one base stat profile for each hero type: Light
Rook, Light Pawn, and Light Bishop. Each profile SHALL expose health, speed,
and damage as non-negative multiples of 10, using these initial values:

| Hero | Role | Health | Speed | Damage |
| --- | --- | ---: | ---: | ---: |
| Light Rook | tank | 120 | 20 | 20 |
| Light Pawn | swarm | 40 | 30 | 10 |
| Light Bishop | striker | 80 | 20 | 30 |

The profiles SHALL be the only source used to initialize a hero's current
health, movement speed, and collision damage.

#### Scenario: Profiles are balanced and readable

- **WHEN** the stats system is inspected
- **THEN** all three hero profiles exist with the values in the table
- **AND** every displayed value is a multiple of 10
- **AND** Rook has the highest health, Pawn has the highest speed, and Bishop
  has the highest damage

### Requirement: Stat cards describe the selected hero

Each hero-selection card SHALL show the hero name, role, and the canonical
health, speed, and damage values before the player chooses it. The labels
SHALL remain legible within the centered 9:16 frame on desktop and portrait
mobile screens.

#### Scenario: Player compares hero choices

- **WHEN** hero selection is displayed
- **THEN** each available card shows its profile values and role
- **AND** the values match the values used by the corresponding gameplay hero
- **AND** card selection remains available by mouse, keyboard, and touch

### Requirement: Runtime stat consumption

During a battle, a hero SHALL move using its profile speed, deal its profile
damage on collision, start with its profile health, and be removed when its
current health reaches zero. The system SHALL preserve current health as
mutable battle state without mutating the canonical profile.

#### Scenario: A hero enters battle

- **WHEN** a profile is spawned into a player or enemy formation
- **THEN** its current health equals the profile health
- **AND** its movement and damage values equal the profile speed and damage

#### Scenario: Collision uses attacker and defender profiles

- **WHEN** two opposing heroes collide
- **THEN** each hero loses the other hero's profile damage
- **AND** health cannot fall below zero
- **AND** a hero at zero health is removed from the active battle

