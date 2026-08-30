## Purpose

Define the visible, bounded, hero-relative damage-cloud effect and its behavior
across the centered portrait game frame.

## ADDED Requirements

### Requirement: Hero damage cloud burst
When a live hero takes non-lethal damage, the game SHALL spawn a short burst of
multiple cloud particles relative to that hero. Each particle SHALL use a
randomized size between `1.65` and `2.7` Babylon world units, inclusive.
Particle placement SHALL be randomized from the hero-relative spawn point up to
`0.255` world units horizontally and `0.315` world units vertically in either
direction.

#### Scenario: Damage creates enlarged distributed clouds
- **WHEN** a live hero takes non-lethal damage
- **THEN** more than one visible cloud particle spawns relative to that hero
- **AND** every particle size is within `1.65` through `2.7` world units
- **AND** every horizontal offset is within `-0.255` through `0.255` world units
- **AND** every vertical offset is within `-0.315` through `0.315` world units
- **AND** randomized particles can occupy different sizes and positions within
  those bounds

### Requirement: Existing cloud behavior remains stable
The enlarged cloud burst SHALL retain its existing particle count, texture,
random distribution, delay and lifetime bounds, opacity animation, visual
layering, and cleanup behavior. Active clouds SHALL remain parented to their
hero and SHALL not change hero physics, input, or gameplay timing.

#### Scenario: Enlarged cloud completes
- **WHEN** an enlarged cloud particle reaches the end of its configured lifetime
- **THEN** it is no longer visible or active in the scene
- **AND** the owning hero retains its existing movement and collision behavior

#### Scenario: Hero is disposed during a burst
- **WHEN** a hero is disposed while enlarged cloud particles are active
- **THEN** its active cloud particles and effect resources are released
- **AND** no cloud update continues to reference the disposed hero

### Requirement: Cloud depth remains owner relative
Each cloud particle SHALL render one depth unit in front of its owning hero.
The cloud SHALL retain the owner's Y-sorted depth context rather than rendering
in front of every hero globally.

#### Scenario: Cloud appears in front of its owner
- **WHEN** a hero spawns a cloud particle
- **THEN** the cloud renders one depth unit in front of that hero
- **AND** another hero that is nearer according to Y sorting can still render
  in front of the cloud

### Requirement: Cloud presentation remains viewport independent
Damage clouds SHALL remain sized and positioned in Babylon world units relative
to their owning hero, preserving equivalent game-frame-relative presentation
without touch-specific or viewport-specific variants.

#### Scenario: Viewport changes during a cloud burst
- **WHEN** a cloud burst is observed in the same live browser session at a large
  desktop viewport, a narrow portrait viewport, and a tall mobile viewport where
  width limits the frame
- **THEN** the clouds retain equivalent size and hero-relative placement at each
  viewport
- **AND** the centered game frame remains exactly 9:16 with no overlap,
  incidental reflow, or non-uniform effect scaling
