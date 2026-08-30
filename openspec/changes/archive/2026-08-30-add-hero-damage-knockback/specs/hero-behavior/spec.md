## MODIFIED Requirements

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
