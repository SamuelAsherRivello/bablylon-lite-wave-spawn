# hero-animation Specification

## Purpose

Define readable, configurable hero artwork animations for battle states while keeping hero bounds, collision, shadow, and future frame animation concerns separable.

## Requirements

### Requirement: Animation affects hero artwork within its bounds
The system SHALL apply hero animations to hero artwork within its bounds. Animations SHALL NOT move or scale hero bounds or colliders, and SHALL NOT require shadows to move or scale.

#### Scenario: Artwork animates without changing collision placement
- **WHEN** a hero plays any animation state
- **THEN** the hero artwork visibly animates within the hero bounds
- **AND** the bounds, collider, and shadow retain their gameplay transforms

### Requirement: Hero animation states
The system SHALL provide `SPAWN`, `IDLE`, `WALKING`, `TAKE_DAMAGE`, and `DEAD` artwork animation states. `SPAWN` SHALL precede the first repeating state, `TAKE_DAMAGE` SHALL temporarily override a repeating state, and `DEAD` SHALL be terminal.

#### Scenario: Spawn completes into idle
- **WHEN** a hero first appears on a hero line
- **THEN** the hero plays `SPAWN` and enters `IDLE` after the effect completes

#### Scenario: Damage returns to the active repeating state
- **WHEN** a living hero takes damage while idle or walking
- **THEN** the hero plays `TAKE_DAMAGE` and returns to the appropriate repeating state

#### Scenario: Dead is terminal
- **WHEN** a hero enters `DEAD`
- **THEN** the hero does not return to any earlier animation state

### Requirement: Hero-line spawn order and animation
The system SHALL call the six numbered formation rows hero lines 1 through 6. Formations SHALL spawn heroes left to right, with artwork easing from 0% to 100% scale over a configurable duration defaulting to 0.2 seconds.

#### Scenario: Formation spawns on a hero line
- **WHEN** a formation is placed on any hero line
- **THEN** its leftmost hero begins first and each artwork eases from 0% to 100% scale
- **AND** bounds, colliders, and shadows retain gameplay transforms

### Requirement: Randomized idle and walking animation
`IDLE` and `WALKING` artwork animations SHALL repeat with configurable duration ranges defaulting to 0.1 to 0.2 seconds, with bounded procedural variation between consecutive cycles.

#### Scenario: Repeating cycles vary within limits
- **WHEN** a living hero remains in an idle or walking state for multiple cycles
- **THEN** each cycle stays within its configured duration range and consecutive cycles vary visibly

### Requirement: Damage color blink
The `TAKE_DAMAGE` animation SHALL blink the artwork with a configured damage color for a configured duration without requiring position, rotation, or scale movement.

#### Scenario: Living hero takes damage
- **WHEN** collision damage leaves a hero with health above zero
- **THEN** the artwork blinks with the configured damage color and timing

### Requirement: Dead blink and shrink
The `DEAD` animation SHALL blink the artwork with a configured death color and then shrink it from 100% to 0% scale. Shrink duration SHALL default to 0.1 seconds and remain configurable.

#### Scenario: Hero dies
- **WHEN** collision damage reduces a hero's health to zero
- **THEN** the artwork blinks and then shrinks to 0%
- **AND** the defeated hero cannot participate in movement, targeting, damage, or collision
- **AND** resources are disposed only after the effect completes

### Requirement: Human-readable animation configuration
The system SHALL centralize spawn timing, easing, duration ranges, blink timings and colors, shrink timing, and procedural variation limits under descriptive configuration names.

#### Scenario: Animation timing is tuned
- **WHEN** a named animation timing setting changes
- **THEN** the corresponding artwork effect uses the new value

### Requirement: Browser and viewport consistency
Hero animations SHALL remain visible and functionally equivalent in supported desktop and portrait mobile browsers and remain contained within the centered 9:16 frame during resizing.

#### Scenario: Animation survives viewport resize
- **WHEN** the viewport is resized while heroes animate
- **THEN** active animations continue without changing collision placement
