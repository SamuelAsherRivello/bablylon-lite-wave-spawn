# Environmental Effects Specification

## Purpose

Define persistent, reusable arena-ground artwork that records important battle events while preserving the game's proportional portrait composition.

## Requirements

### Requirement: Reusable environmental effect creation
The game SHALL provide an environmental-effects capability that creates a named effect at a supplied arena world position and event damage amount without coupling the caller to the effect's rendering resources.

#### Scenario: A supported effect is requested
- **WHEN** a battle event requests the registered crack effect at a valid arena world position
- **THEN** exactly one crack instance is created at that position
- **AND** the instance uses the crack effect's shared artwork and visual definition

#### Scenario: Future effect types are added
- **WHEN** another environmental effect is introduced later
- **THEN** it can use the same position-based creation and lifecycle contract without changing existing battle-event semantics

### Requirement: Approved crack artwork presentation
The crack effect SHALL use the approved Option 2 transparent radial-crack PNG at its preserved 1254 by 1254 source resolution, with a 50% world-space scale as its 100% baseline size, damage-scaled growth up to 150% of baseline, 100% opacity, and an independently selected random rotation around its center point across the full 0 through 360 degree range.

#### Scenario: Crack is rendered in any arena
- **WHEN** a crack instance is created in any available arena
- **THEN** it uses the same approved transparent black line artwork
- **AND** its size is calculated from the event damage
- **AND** its material opacity is 100%
- **AND** it is rotated around its center point by an independently selected random angle from the full rotation range
- **AND** no arena-specific replacement or tint is applied

#### Scenario: Minimum current damage uses baseline size
- **WHEN** a crack is created for 10 damage or less
- **THEN** it is rendered at 100% of baseline size
- **AND** its world-space scale is 0.5

#### Scenario: Intermediate current damage is interpolated
- **WHEN** a crack is created for 20 damage
- **THEN** it is rendered at 125% of baseline size
- **AND** its world-space scale is 0.625

#### Scenario: Maximum current damage uses maximum size
- **WHEN** a crack is created for 30 damage or more
- **THEN** it is rendered at 150% of baseline size
- **AND** its world-space scale is 0.75

### Requirement: Hero death creates a crack
The game SHALL create exactly one crack at a hero's final ground position when that hero enters the death sequence.

#### Scenario: Hero death begins
- **WHEN** a living hero's health reaches zero and its death sequence begins
- **THEN** exactly one crack is created at that hero's final ground position
- **AND** its size is based on the killing blow's damage

#### Scenario: Hero removal is requested repeatedly
- **WHEN** removal logic is invoked again for a hero whose death sequence already began
- **THEN** no additional crack is created for that hero

### Requirement: Projectile disposal creates a crack
The game SHALL create exactly one crack at a projectile's last valid ground position whenever that projectile is disposed, regardless of its disposal reason.

#### Scenario: Projectile finishes an impact
- **WHEN** an impacted projectile completes its disappearance and is disposed
- **THEN** exactly one crack is created at the projectile's last ground position
- **AND** its size is based on the projectile attacker's damage

#### Scenario: Projectile target disappears
- **WHEN** a projectile is disposed because its target is missing or already removed
- **THEN** exactly one crack is created at the projectile's last ground position
- **AND** its size is based on the projectile attacker's damage

#### Scenario: Projectile disposal is requested repeatedly
- **WHEN** disposal is invoked again after the projectile has already been disposed
- **THEN** no additional crack is created for that projectile

### Requirement: Ground-layer composition
Environmental effects SHALL appear attached to the arena ground above the arena background and below combat shadows, heroes, and projectiles.

#### Scenario: Combat objects overlap a crack
- **WHEN** a shadow, hero, or projectile passes over a crack
- **THEN** the combat object is rendered in front of the crack
- **AND** the crack remains visible over the arena background where it is not occluded

### Requirement: Persistent scene-owned lifecycle
Created environmental effects SHALL persist for the remainder of the active scene and SHALL release their instance and shared rendering resources when their owner is disposed.

#### Scenario: Battle continues after an effect is created
- **WHEN** the battle continues after a hero or projectile crack is created
- **THEN** the crack remains at its original arena position without following or blocking combat objects

#### Scenario: Environmental-effects owner is disposed
- **WHEN** the active scene or environmental-effects owner is disposed
- **THEN** every effect instance and all shared effect rendering resources are disposed

### Requirement: Proportional viewport behavior
Environmental effects SHALL preserve their authored world-space size and position relative to the centered 9:16 game frame without pixel-, viewport-, breakpoint-, or touch-dependent reflow.

#### Scenario: Large desktop viewport
- **WHEN** the game is viewed in a large desktop viewport
- **THEN** each crack retains its intended proportion and arena position
- **AND** the game frame remains centered at exactly 9:16

#### Scenario: Narrow portrait viewport
- **WHEN** the same scene is resized to a narrow portrait viewport
- **THEN** each crack scales uniformly with the Babylon scene and remains at the same relative arena position
- **AND** no overlap or reflow is introduced by the effect system

#### Scenario: Tall mobile viewport where width limits the frame
- **WHEN** the same scene is viewed in a tall mobile viewport where frame width is the limiting dimension
- **THEN** each crack preserves the same normalized size, position, opacity, and layer ordering
- **AND** touch input behavior remains unchanged
