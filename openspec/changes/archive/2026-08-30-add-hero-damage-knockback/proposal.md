## Why

Damage currently changes health and plays hit feedback, but the damaged hero's gameplay position does not visibly respond to the direction of the hit. Directional knockback will make melee collisions and projectile impacts easier to read and give every successful hit a clear physical consequence.

## What Changes

- Add shared directional knockback for every hero type whenever that hero survives melee or projectile damage, while preserving terminal death priority for fatal hits.
- Push a contact-damaged hero directly away from the opposing hero and push a projectile-damaged hero along the projectile's incoming travel direction.
- Make the displacement comparable to the distance a hero normally covers during one walking-animation cycle, with centralized tuning values shared across hero classes and damage sources.
- Temporarily give knockback priority over target-pursuit movement, then resume the hero's remembered-target behavior after the hit reaction completes.
- Use a short smooth ease-out push so the impact is immediate and the reaction settles naturally.
- Preserve damage cooldowns, health calculation, targeting, arena boundaries, fixed depth, damage/death animation behavior, and resource disposal.
- Keep the effect functionally and visually consistent inside the centered 9:16 game frame on desktop and portrait mobile browsers, including live viewport resize.
- Use the existing Babylon.js and project dependencies; no new dependency is proposed.

## Capabilities

### New Capabilities

- `hero-damage-knockback`: Defines directional, distance-bounded knockback for melee and projectile damage, its interaction with repeated and fatal hits, and arena-boundary behavior.

### Modified Capabilities

- `hero-behavior`: Defines that target-pursuit movement yields to a timed hit reaction and resumes afterward without losing valid target memory.

## Impact

- Combat rules and gameplay orchestration in `src/battle-rules.js` and `src/gameplay.js`.
- Projectile impact context in `src/projectile.js`.
- Hero movement/physics state and arena-boundary enforcement in `src/hero.js` and `src/arena-config.js`.
- Existing `TAKE_DAMAGE` and `DEAD` animation coordination, without changing artwork bounds or adding visual resources.
- Unit tests for direction, magnitude, timing, repeated-hit policy, zero-distance fallback, and bounds; real-browser combat verification at desktop and portrait mobile viewports.
