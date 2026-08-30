# hero-stats-system Specification

## Purpose

Give every hero a single, readable, balance-tested set of combat statistics that is shown to players and consumed consistently during live hero gameplay.

## Requirements

### Requirement: Canonical hero stat profiles
The game SHALL define exactly one base stat profile for Light Rook, Light Pawn, and Light Bishop. Profiles SHALL expose non-negative health, speed, and damage values that are multiples of 10: Rook 120/20/20, Pawn 40/30/10, and Bishop 80/20/30.

#### Scenario: Profiles are balanced and readable
- **WHEN** the stats system is inspected
- **THEN** all three profiles exist with the defined values
- **AND** Rook has the highest health, Pawn the highest speed, and Bishop the highest damage

### Requirement: Stat cards describe the selected hero
Each hero-selection card SHALL show the hero name, role, and canonical health, speed, and damage values before selection. Labels SHALL remain legible in the centered 9:16 frame on desktop and portrait mobile screens.

#### Scenario: Player compares hero choices
- **WHEN** hero selection is displayed
- **THEN** each available card shows matching profile values and role
- **AND** selection remains available by mouse, keyboard, and touch

### Requirement: Runtime stat consumption
During battle, a hero SHALL move using profile speed, deal profile damage, start with profile health, and be removed when current health reaches zero. Current health SHALL remain mutable battle state without mutating the canonical profile.

#### Scenario: A hero enters battle
- **WHEN** a profile is spawned into a formation
- **THEN** current health, movement, and damage equal the profile values

#### Scenario: Collision uses attacker and defender profiles
- **WHEN** two opposing heroes collide
- **THEN** each loses the other hero's profile damage, health cannot fall below zero, and a zero-health hero is removed
