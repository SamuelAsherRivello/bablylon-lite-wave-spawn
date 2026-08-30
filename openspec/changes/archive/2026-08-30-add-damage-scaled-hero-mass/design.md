## Context

See `proposal.md` for motivation. Hero profiles in `src/battle-rules.js` currently own health, speed, damage, and attack behavior. `Hero` copies the mutable combat values it needs, then creates one dynamic Babylon/Havok body with mass `1` specified both during aggregate construction and again while applying rotation-locking mass properties. Gameplay commands planar linear velocity directly on every movement update, and Havok resolves contacts between those moving bodies. Because pursuit rewrites velocity on the next frame, relying on the solver alone cannot guarantee that a subtle mass difference remains observable during sustained pushing.

The change crosses canonical balance data, physics-body construction, and collision verification, so recording the mass derivation and its interaction boundaries avoids two independent mass values drifting apart.

## Goals / Non-Goals

**Goals:**

- Derive a small, deterministic mass spread from canonical damage.
- Give one hero body one consistent mass value everywhere Havok receives mass properties.
- Compute a deterministic, bounded contact response from both heroes' incoming speed and mass without converting the broader locomotion system to force-driven movement.
- Keep the behavior in Babylon world units and independent of viewport size or input method.

**Non-Goals:**

- Rebalance health, speed, damage, attack range, or attack timing.
- Change collider geometry, friction, restitution, gravity, damping, arena boundaries, damage cooldowns, or target selection.
- Scale the separate configured directional-knockback displacement by mass; knockback remains the higher-priority authored hit reaction defined by `hero-damage-knockback`.
- Add a visible mass label to selection cards or introduce new UI.

## Decisions

### Use a bounded linear damage-to-mass mapping

Canonical mass will be derived with a centralized pure rule across the current canonical damage range:

`mass = 1.00 + ((damage - 10) / (30 - 10)) * 0.10`

For the current damage values this produces Pawn `1.00`, Rook `1.05`, and Bishop `1.10`. Inputs used outside the current `10` through `30` balance range will be clamped to that range, preserving the promised 10% maximum spread and preventing an unrelated future damage experiment from creating dramatic physics behavior.

This is preferred over directly proportional ratios such as `damage / 10`, which would produce masses `1`, `2`, and `3`, and over three unrelated literals, which would not preserve an inspectable proportional rule.

### Store the derived result on the canonical profile

Each frozen hero profile will expose its derived `mass` alongside health, speed, and damage. The spawned `Hero` will retain that profile value for inspection and use it as the single source supplied to physics creation.

This keeps class balance discoverable in one profile and allows focused tests to verify both exact current values and the derivation invariant. Recomputing mass independently inside `Hero` was rejected because it would split stat ownership across modules.

### Apply one mass consistently to the Havok body

The profile mass will replace both hard-coded `mass: 1` values used when creating the physics aggregate and setting mass properties. The zero inertia override, angular damping, zero-Z velocity enforcement, and collider options remain unchanged.

Commanded movement velocity will not be converted into continuous forces or impulses. A force-driven locomotion rewrite was rejected because it would substantially change existing speed, arena-friction, pause, knockback, and targeting tuning.

### Resolve sustained pushing from contact-axis momentum

Every active hero-to-hero collision callback will capture both bodies' current planar velocities before ordinary pursuit can overwrite them. A pure helper will derive a normalized contact axis from the first hero toward the second, with the existing deterministic side-opposing fallback when their positions coincide.

For axis `n` pointing from hero A to hero B:

- `incomingA = max(0, dot(velocityA, n))`
- `incomingB = max(0, dot(velocityB, -n))`
- `sharedNormalVelocity = (massA * incomingA - massB * incomingB) / (massA + massB)`

This is the normal component of a perfectly inelastic collision using only velocity directed into contact. A positive result moves both heroes along `n`; a negative result moves both along `-n`; equal opposing momentum produces zero class-biased normal drift. Velocity already pointing away from contact contributes nothing and is never reversed into the collision. Each hero keeps its existing tangential component so angled contacts can slide rather than becoming one-dimensional.

The shared normal response is preferred over trusting one Havok solver step because the existing movement loop overwrites solver velocity on the next frame. It is also preferred over inventing a winner from mass alone because both speed and mass must decide who pushes whom.

### Preserve collision response with a bounded priority state

Each active unit will own a collision-push velocity and remaining duration. `COLLISION_PUSH_DURATION_SECONDS` will default to `0.10` seconds after the latest contact and refresh during sustained contact. This short state is long enough to cross multiple render/physics frames while remaining much shorter than ordinary movement. Its movement priority will be:

1. terminal removal or pause,
2. configured directional damage knockback,
3. momentum-aware collision push,
4. ordinary target pursuit.

The collision callback will update push state before the existing contact-damage cooldown gate, so mass and speed continue to govern sustained physical contact even when another damage event is not yet eligible. When the push window expires, the next movement update resumes pursuit of the remembered target. The response will use the existing body, planar constraint, arena containment, and depth-sort lifecycle; it adds no observer or Babylon resource.

### Keep authored hit knockback separate from momentum pushing

Mass affects the ordinary contact-push state. The explicit damage-knockback controller continues to set its configured velocity and displacement equally for all classes, as required by the existing knockback specification, and takes priority when a damaging contact occurs. This prevents a small collision-weight feature from silently redesigning combat readability.

### No new resource or responsive lifecycle

No Babylon mesh, body, observer, texture, or material is added. Existing `Hero.disablePhysics()` and `Hero.dispose()` continue to own and dispose the one physics aggregate. There is no touch-specific behavior. Viewport resizing continues to resize the existing centered 9:16 render surface, while mass and collision calculations remain in world units.

## Risks / Trade-offs

- [Frequent collision callbacks may refresh push state indefinitely while bodies remain pressed together] → Treat refresh as intended sustained pushing, bound the response velocity by the momentum formula, and verify heroes still separate or resume pursuit when contact ends.
- [A 10% spread may be difficult to notice amid unequal hero speeds] → Include controlled automated invariants plus live comparisons with comparable approach conditions; retain the subtle range requested rather than inflating it for visibility.
- [Duplicated mass assignment could drift] → Derive mass once in the profile and assert that aggregate creation and mass properties consume the same value.
- [Collision push and damage knockback can be requested by the same callback] → Apply push calculation before damage gating but enforce the explicit priority order so knockback wins without deleting the stored target.
- [Clamping future damage values means mass stops increasing outside the current balance range] → Treat a wider mass range as a future explicit balance change, preserving the present non-dramatic contract.

## Migration Plan

No saved-state or data migration is required. Add the derived profile field, wire it into new hero bodies, add the pure momentum helper and per-unit push state, then run automated and browser verification before shipping through the existing build. Rollback is the additive reversal of the profile mass field, physics wiring, helper, and transient unit state; no persistent data or resources require cleanup.
