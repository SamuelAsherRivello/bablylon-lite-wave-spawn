## Purpose

Define readable, configurable hero artwork animations for battle states while keeping hero bounds, collision, shadow, and future frame animation concerns separable.

## ADDED Requirements

### Requirement: Animation affects hero artwork within its bounds
The system SHALL apply the hero animations in this capability to the hero artwork within its bounds. The animations SHALL NOT move or scale the hero bounds or collider, and SHALL NOT require the shadow to move or scale.

#### Scenario: Artwork animates without changing collision placement
- **WHEN** a hero plays any animation state
- **THEN** the hero artwork visibly animates within the hero bounds
- **AND** the bounds and collider retain their gameplay transform
- **AND** the shadow retains its existing transform

### Requirement: Hero animation states
The system SHALL provide `SPAWN`, `IDLE`, `WALKING`, `TAKE_DAMAGE`, and `DEAD` artwork animation states. `SPAWN` SHALL precede a hero's first repeating state, `TAKE_DAMAGE` SHALL temporarily override a repeating state, and `DEAD` SHALL be terminal.

#### Scenario: Spawn completes into idle
- **WHEN** a hero first appears on a hero line
- **THEN** the hero plays `SPAWN`
- **AND** enters `IDLE` after the spawn effect completes

#### Scenario: Damage returns to the active repeating state
- **WHEN** a living hero takes damage while idle or walking
- **THEN** the hero plays `TAKE_DAMAGE`
- **AND** returns to the appropriate `IDLE` or `WALKING` state after the damage effect completes

#### Scenario: Dead is terminal
- **WHEN** a hero enters `DEAD`
- **THEN** the hero does not return to `SPAWN`, `IDLE`, `WALKING`, or `TAKE_DAMAGE`

### Requirement: Hero-line spawn order and animation
The system SHALL call the six numbered formation rows hero lines 1, 2, 3, 4, 5, and 6. When a formation appears on any hero line, its heroes SHALL spawn one at a time from left to right. Each hero's artwork SHALL begin at 0% scale and ease to 100% scale over a configurable duration that defaults to 0.2 seconds. The default curve SHALL use Babylon.js `BackEase` with `EASINGMODE_EASEOUT`.

#### Scenario: Formation spawns on a hero line
- **WHEN** a formation is placed on hero line 1, 2, 3, 4, 5, or 6
- **THEN** its leftmost hero begins spawning first
- **AND** each remaining hero begins spawning in left-to-right order
- **AND** each hero artwork eases from 0% scale to 100% scale
- **AND** the hero bounds, collider, and shadow retain their gameplay transforms

### Requirement: Randomized idle animation
The `IDLE` artwork animation SHALL repeat in cycles whose configured duration is between 0.1 and 0.2 seconds by default. Each cycle SHALL select bounded procedural variation so consecutive cycles do not repeat exactly the same visible motion.

#### Scenario: Idle cycles vary within configured limits
- **WHEN** a living stationary hero remains in `IDLE` for multiple cycles
- **THEN** each cycle lasts within the configured idle duration range
- **AND** the artwork repeats a subtle procedural motion
- **AND** consecutive cycles vary in at least one configured motion value

### Requirement: Randomized walking animation
The `WALKING` artwork animation SHALL repeat in cycles whose configured duration is between 0.1 and 0.2 seconds by default. Each cycle SHALL select bounded procedural variation so consecutive cycles do not repeat exactly the same visible motion.

#### Scenario: Walking cycles vary within configured limits
- **WHEN** a living hero is moving and remains in `WALKING` for multiple cycles
- **THEN** each cycle lasts within the configured walking duration range
- **AND** the artwork repeats a procedural walking motion
- **AND** consecutive cycles vary in at least one configured motion value

### Requirement: Damage color blink
The `TAKE_DAMAGE` animation SHALL blink the hero artwork with a configured damage color for a configured duration without requiring position, rotation, or scale movement.

#### Scenario: Living hero takes damage
- **WHEN** collision damage leaves a hero with health above zero
- **THEN** the hero artwork visibly blinks with the configured damage color
- **AND** the blink uses the configured damage timing

### Requirement: Dead blink and shrink
The `DEAD` animation SHALL blink the hero artwork with a configured death color and then shrink the artwork from 100% scale to 0% scale. The shrink duration SHALL default to 0.1 seconds and SHALL be configurable.

#### Scenario: Hero dies
- **WHEN** collision damage reduces a hero's health to zero
- **THEN** the hero artwork visibly blinks with the configured death color
- **AND** then shrinks from 100% scale to 0% scale over the configured shrink duration
- **AND** the defeated hero cannot participate in further movement, targeting, damage, or collision resolution
- **AND** the hero resources are disposed only after the death animation completes

### Requirement: Human-readable animation configuration
The system SHALL centralize spawn timing, spawn easing type and mode, animation duration ranges, blink timings, blink colors, shrink timing, and procedural variation limits under descriptive configuration names and SHALL avoid embedding those tweakable values throughout gameplay logic.

#### Scenario: Animation timing is tuned
- **WHEN** a developer changes a named animation timing setting
- **THEN** the corresponding artwork effect uses the new value without requiring changes to animation state or combat logic

### Requirement: Future frame and procedural composition
The animation interface SHALL allow a state to use procedural artwork animation now and SHALL preserve an extension point for a future state to combine frame-based and procedural animation without changing gameplay animation requests.

#### Scenario: Gameplay requests an animation state
- **WHEN** gameplay requests `SPAWN`, `IDLE`, `WALKING`, `TAKE_DAMAGE`, or `DEAD`
- **THEN** it requests the state without depending on whether the artwork uses procedural animation, frame animation, or both

### Requirement: Browser and viewport consistency
Hero artwork animations SHALL remain visible and functionally equivalent in supported desktop and portrait mobile browsers and SHALL remain contained within the centered 9:16 game frame through viewport resizing.

#### Scenario: Animation survives viewport resize
- **WHEN** the viewport is resized while heroes are animating
- **THEN** the active animations continue without changing collision placement
- **AND** the artwork remains within the game presentation
