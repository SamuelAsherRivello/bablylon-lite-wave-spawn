# hero-behavior Specification

## Purpose

Give every battle hero an understandable combat intention by selecting, remembering, and pursuing an opposing enemy according to shared targeting rules.

## Requirements

### Requirement: Remembered enemy target

Every active hero SHALL have at most one opposing enemy target. Once selected, the hero SHALL continue using that target for movement until the target is removed or otherwise unavailable, or until the periodic retarget interval elapses. The retarget interval SHALL be 3 seconds of battle time.

#### Scenario: Hero keeps its target
- **WHEN** a hero has selected an active opposing enemy
- **THEN** subsequent movement updates continue to point toward that same enemy
- **AND** the hero does not switch targets merely because another enemy becomes closer

#### Scenario: Target becomes unavailable
- **WHEN** a hero's remembered enemy is removed or unavailable
- **THEN** the hero releases that target
- **AND** selects a replacement if an opposing enemy remains

#### Scenario: Periodic retargeting
- **WHEN** a hero's current target has remained active for 3 seconds since its last target selection
- **THEN** the hero is allowed to select a new target using the shared selection priority
- **AND** the hero does not change target more often than once per 3-second interval

### Requirement: Shared target selection priority

All hero types SHALL use the same selection policy. A hero SHALL first consider opposing enemies that are not currently targeted by another active hero. Among eligible enemies, selection SHALL generally favor the closest enemy with the least current health; distance SHALL be the primary ordering and current health SHALL break otherwise comparable choices. Stable input order SHALL resolve any remaining tie.

#### Scenario: Untargeted enemy is preferred
- **WHEN** at least one opposing enemy is not targeted by another active hero
- **THEN** the hero selects an eligible untargeted enemy
- **AND** it does not select an already-targeted enemy solely because that enemy is closer

#### Scenario: Closest low-health enemy wins
- **WHEN** multiple untargeted enemies are available
- **THEN** the hero selects the closest enemy
- **AND** when candidates are otherwise comparably close, selects the enemy with lower current health

#### Scenario: All enemies are already targeted
- **WHEN** every active opposing enemy is already targeted by another hero
- **THEN** the hero selects the best available opposing enemy using the same distance, health, and stable-tie policy

#### Scenario: No opposing enemy remains
- **WHEN** no active opposing enemy exists
- **THEN** the hero has no target
- **AND** its target-directed movement velocity is zero

### Requirement: Browser-visible target-directed movement

Active heroes SHALL visibly move along the normalized two-dimensional direction from their current position toward their remembered enemy, using their existing profile speed and movement scale, except while a higher-priority directional knockback reaction is active. Movement SHALL preserve fixed depth, physics collision behavior, and the centered 9:16 frame on desktop and portrait mobile browsers. A surviving hero SHALL resume target-directed movement after knockback without discarding a remembered target that remains valid.

#### Scenario: Hero moves toward remembered enemy
- **WHEN** a started battle contains a hero and an active remembered enemy at a different position and no knockback is active
- **THEN** the hero moves toward that enemy rather than using a fixed side-specific vertical direction
- **AND** the hero's movement speed uses its canonical profile speed and existing movement scale

#### Scenario: Knockback temporarily overrides pursuit
- **WHEN** a surviving hero with a valid remembered target enters directional knockback
- **THEN** target-pursuit velocity yields for the knockback duration
- **AND** the remembered target remains assigned unless it independently becomes unavailable or reaches the existing retarget interval

#### Scenario: Pursuit resumes after knockback
- **WHEN** a surviving hero's knockback duration ends
- **THEN** the next movement update resumes movement toward its valid remembered target
- **AND** no stale knockback velocity remains

#### Scenario: Targeted movement survives viewport resize
- **WHEN** the browser viewport is resized during a battle on desktop or portrait mobile
- **THEN** the game frame and render target resize using existing behavior
- **AND** target selection, knockback priority, and movement continue without losing active target memory or producing a runtime error
