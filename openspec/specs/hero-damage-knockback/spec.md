# hero-damage-knockback Specification

## Purpose

Make every successful hero hit spatially readable by moving a surviving damaged hero a short, bounded distance away from the incoming impact.

## Requirements

### Requirement: Shared directional knockback

Every Light Rook, Light Pawn, and Light Bishop that survives a successful melee or projectile damage event SHALL enter directional knockback. Knockback SHALL move the damaged hero in the arena plane without changing its fixed depth or rotating it.

#### Scenario: Contact damage separates opposing heroes
- **WHEN** two opposing heroes deal contact damage to each other and both survive
- **THEN** each hero is knocked directly away from the other hero's impact position
- **AND** the two knockback directions oppose one another

#### Scenario: Projectile damage follows incoming direction
- **WHEN** a projectile damages a hero and the hero survives
- **THEN** the damaged hero is knocked in the projectile's incoming ground-plane travel direction
- **AND** the direction is based on the projectile impact path rather than the damaged hero's current pursuit direction

#### Scenario: Impact positions coincide
- **WHEN** an impact direction cannot be normalized because its source and target positions coincide
- **THEN** the system uses a deterministic side-opposing fallback direction
- **AND** the damage event completes without a non-finite position or velocity

### Requirement: Walk-scale displacement

A knockback SHALL default to 0.25 Babylon world units over 0.16 seconds, which is comparable to the distance the current heroes cover during one walking-animation cycle. Its movement SHALL use a short smooth ease-out profile: strongest immediately after impact and settling to zero by the end of the reaction. Distance, duration, and easing SHALL be centralized, human-readable tuning values applied equally to all hero classes and both damage sources.

#### Scenario: Any hero class survives a hit
- **WHEN** a Rook, Pawn, or Bishop receives an unobstructed nonfatal hit
- **THEN** its knockback attempts the same configured displacement over the same configured duration
- **AND** damage amount and ordinary movement speed do not scale that displacement

#### Scenario: Hit reaction is visibly distinct from pursuit
- **WHEN** knockback begins while a hero is walking toward a remembered target
- **THEN** the hero immediately moves away from the impact for the configured reaction duration
- **AND** ordinary target-pursuit velocity does not shorten or reverse that reaction

#### Scenario: Knockback settles smoothly
- **WHEN** a surviving hero completes its knockback reaction
- **THEN** displacement is strongest at the beginning and eases toward zero without a position snap
- **AND** the hero's final reaction velocity is zero before pursuit resumes

### Requirement: Normal collision interaction

Knockback movement SHALL continue to use the existing hero collision and damage-cooldown rules. Knockback SHALL NOT disable hero collision or create a separate immunity window.

#### Scenario: Knockbacked hero contacts another hero
- **WHEN** a knockbacked hero collides with an opposing hero
- **THEN** normal physics collision resolution remains active
- **AND** a subsequent contact-damage event may occur only when the existing damage cooldown rules permit it

### Requirement: Repeated and fatal hit policy

A new successful nonfatal hit during knockback SHALL replace the active knockback direction and restart its configured duration rather than add an unbounded velocity. Fatal damage SHALL retain terminal death precedence: the defeated hero SHALL leave combat immediately and is not required to complete knockback.

#### Scenario: Another valid hit lands during knockback
- **WHEN** a surviving hero receives another damage event after its damage cooldown permits the hit
- **THEN** knockback restarts from the new impact direction
- **AND** the previous and new knockback velocities are not accumulated

#### Scenario: Damage is fatal
- **WHEN** damage reduces a hero's health to zero
- **THEN** the existing terminal death behavior takes precedence over ongoing or newly requested knockback
- **AND** the defeated hero cannot move, target, attack, damage, or collide

### Requirement: Arena-safe knockback

Knockback SHALL respect the existing playable arena bounds, hero collider extents, planar physics restrictions, and depth sorting. A boundary SHALL clip only the blocked component of knockback and SHALL NOT move a hero outside the playable area.

#### Scenario: Knockback points through an arena wall
- **WHEN** a damaged hero is at a playable boundary and its knockback points outward
- **THEN** the hero remains within the playable bounds
- **AND** any unblocked component may continue without producing rotation or depth drift

#### Scenario: Knockback changes vertical ordering
- **WHEN** knockback changes a hero's arena Y position
- **THEN** the hero, its artwork, its shadow, and its collider remain on one gameplay root
- **AND** the existing depth-sort behavior updates from the new Y position

### Requirement: Browser-visible consistency

Directional knockback SHALL remain functionally equivalent and visibly clear inside the centered 9:16 game frame on supported desktop and portrait mobile browsers. It SHALL use Babylon world units and SHALL NOT introduce viewport-dependent displacement, layout reflow, or touch-only behavior.

#### Scenario: Knockback is observed at supported viewport sizes
- **WHEN** equivalent hits are observed in the same live browser session at a large desktop viewport, a narrow portrait viewport, and a tall mobile viewport where width limits the frame
- **THEN** impact direction and displacement remain consistent relative to the arena
- **AND** the game frame remains centered and exactly 9:16 with no overlap or incidental reflow

#### Scenario: Viewport changes during knockback
- **WHEN** the viewport is resized or orientation changes while a hero is being knocked back
- **THEN** the hit reaction continues without a reload or runtime error
- **AND** its world-space direction, remaining duration, and relative arena displacement are preserved
