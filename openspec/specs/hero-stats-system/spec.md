# hero-stats-system Specification

## Purpose

Give every hero a single, readable, balance-tested set of combat statistics that is shown to players and consumed consistently during live hero gameplay.

## Requirements

### Requirement: Canonical hero stat profiles
The game SHALL define exactly one base stat profile for Light Rook, Light Pawn, and Light Bishop. Profiles SHALL expose non-negative health, speed, damage, and physics mass values. Health, speed, and damage SHALL retain their canonical multiples-of-10 values: Rook 120/20/20, Pawn 40/30/10, and Bishop 80/20/30. Physics mass SHALL increase linearly with canonical damage across the current roster: Pawn `1.00`, Rook `1.05`, and Bishop `1.10`, so the heaviest current hero is no more than 10% heavier than the lightest.

#### Scenario: Profiles are balanced and readable
- **WHEN** the stats system is inspected
- **THEN** all three profiles exist with the defined health, speed, damage, and mass values
- **AND** Rook has the highest health, Pawn the highest speed, and Bishop the highest damage and mass
- **AND** each 10-point increase in canonical damage corresponds to a `0.05` increase in mass
- **AND** the maximum current mass is no more than 110% of the minimum current mass

### Requirement: Stat cards describe the selected hero
Each hero-selection card SHALL show the hero name, role, and canonical health, speed, and damage values before selection. Labels SHALL remain legible in the centered 9:16 frame on desktop and portrait mobile screens.

#### Scenario: Player compares hero choices
- **WHEN** hero selection is displayed
- **THEN** each available card shows matching profile values and role
- **AND** selection remains available by mouse, keyboard, and touch

### Requirement: Runtime stat consumption
During battle, a hero SHALL move using profile speed, deal profile damage, start with profile health, and use profile mass for dynamic collision response. Current health SHALL remain mutable battle state without mutating the canonical profile. On every active hero-to-hero contact, including contact while damage is on cooldown, collision pushing SHALL compare each hero's incoming velocity projected toward the other hero along the contact axis and weighted by profile mass. The greater opposing incoming momentum SHALL bias the short separation response in its direction without changing either hero's canonical commanded movement speed. Scripted directional damage knockback SHALL retain priority while active, and ordinary pursuit SHALL resume after the bounded collision response without immediately erasing it.

#### Scenario: A hero enters battle
- **WHEN** a profile is spawned into a formation
- **THEN** current health, movement, damage, and dynamic-body mass equal the profile values

#### Scenario: Collision uses attacker and defender profiles
- **WHEN** two opposing heroes collide
- **THEN** each loses the other hero's profile damage, health cannot fall below zero, and a zero-health hero is removed
- **AND** the collision push uses each surviving hero's profile mass and incoming contact-axis velocity
- **AND** directional damage knockback retains priority for its configured duration

#### Scenario: Greater incoming momentum wins the push
- **WHEN** two active heroes move into one another with unequal opposing contact-axis momentum
- **THEN** the hero with greater mass-times-incoming-speed pushes the contact response in its direction
- **AND** either greater mass or greater incoming speed can determine which hero wins the push
- **AND** the mass contribution remains subtle because all current hero masses stay within the defined 10% range

#### Scenario: Opposing momentum is equal
- **WHEN** two active heroes meet with equal opposing contact-axis momentum
- **THEN** neither hero receives a class-biased pushing advantage
- **AND** collision separation completes without non-finite velocity, rotation, or depth drift

#### Scenario: Sustained contact occurs during damage cooldown
- **WHEN** two surviving heroes remain in contact while their next damage event is blocked by the existing cooldown
- **THEN** momentum-aware collision pushing continues to be evaluated independently of damage eligibility
- **AND** the next pursuit update does not immediately erase the bounded separation response

#### Scenario: Hero velocity points away from contact
- **WHEN** a hero's contact-axis velocity is stationary or points away from the other hero at contact
- **THEN** that velocity contributes no incoming momentum toward winning the push
- **AND** collision response completes without reversing an already separating hero back into contact

#### Scenario: Mass behavior remains viewport independent
- **WHEN** equivalent hero collisions are observed in the same live browser session at a large desktop viewport, a narrow portrait viewport, and a tall mobile viewport where width limits the frame
- **THEN** mass and velocity produce equivalent world-space collision behavior at each viewport
- **AND** the centered game frame remains exactly 9:16 with no overlap, reflow, or viewport-dependent physics scaling
