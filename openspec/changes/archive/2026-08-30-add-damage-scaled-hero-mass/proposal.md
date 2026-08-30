## Why

All hero physics bodies currently use the same mass, so class stats influence movement and damage but not which hero yields when moving bodies collide. A small damage-proportional mass spread will give Pawn, Rook, and Bishop subtly different physical presence without letting mass dominate battle outcomes.

## What Changes

- Add canonical physics mass to each hero profile, ordered by damage: Pawn `1.00`, Rook `1.05`, and Bishop `1.10`.
- Apply the profile mass consistently to the hero's Babylon/Havok physics aggregate and mass properties.
- Keep commanded movement speed class-based and add momentum-aware collision pushing that explicitly combines each hero's incoming velocity and canonical mass, so a heavier or faster hero reliably pushes the other.
- Preserve collision-produced push long enough to affect separation instead of allowing the next pursuit update to erase it immediately; resume ordinary pursuit afterward.
- Preserve the existing collider size, friction, restitution, planar constraints, angular lock, damage cooldown, directional knockback, and arena-boundary behavior.
- Preserve the centered 9:16 composition and equivalent world-space behavior on desktop and portrait mobile browsers; no UI, touch, or viewport-dependent behavior changes are introduced.
- Add no dependencies.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `hero-stats-system`: Extend canonical hero profiles with a small damage-proportional mass stat and require live physics collisions to consume it.

## Impact

- Affects canonical hero profile data and momentum calculation in `src/battle-rules.js`, hero physics-body creation in `src/hero.js`, and collision/movement coordination in `src/gameplay.js`.
- Makes collision pushing between active dynamic heroes deterministic from their relative incoming velocities and masses, including differently weighted heroes moving at different speeds.
- Requires focused stat/physics tests, a production build, and real-browser collision checks at the project-required desktop and portrait viewport sizes.
- Does not change public APIs, asset ownership, visual layout, touch behavior, or dependencies.
