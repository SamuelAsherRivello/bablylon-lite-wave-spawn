## Context

See `proposal.md` for motivation. Battle movement currently recalculates and writes target-pursuit velocity every frame. Contact damage is resolved in the gameplay collision handler, while projectile damage is reported by a projectile hit callback. Both paths already share health, cooldown, damage animation, and arena-boundary behavior, but neither preserves an incoming direction as a first-class damage-event value. Because pursuit overwrites velocity continuously, a physics impulse alone would not produce a reliable hit reaction.

The change affects combat rules, movement arbitration, projectile hit context, hero physics, animation coordination, and tests. Babylon world units remain the coordinate system; no DOM content, input behavior, or new Babylon resource is required.

## Goals / Non-Goals

**Goals:**

- Produce deterministic, testable knockback direction and magnitude for contact and projectile hits.
- Give knockback temporary priority over pursuit without erasing valid target memory.
- Use one tuning contract for every hero class and arena.
- Preserve arena containment, planar physics, depth sorting, and terminal death semantics.

**Non-Goals:**

- Damage-scaled, class-specific, critical-hit, stun, launch, rotation, ragdoll, or chained knockback.
- Changing health, damage cooldowns, targeting priorities, projectile damage, arena friction, or animation artwork.
- Adding camera shake, particles, sound, controls, UI, dependencies, or a viewport-specific composition.

## Decisions

### Represent knockback as a timed movement override

Each active unit will own a small knockback state containing a normalized ground-plane direction and remaining seconds. The movement update will consume that timer using battle delta time and write knockback velocity before considering target pursuit. When the timer expires, the same update loop returns to pursuit.

The default 0.25-world-unit distance and 0.16-second duration lie near one existing walking cycle's travel distance while being long enough to read alongside the 0.1-second damage blink. Motion uses a normalized ease-out profile whose integral is normalized to the configured distance, so it starts strongly and settles to zero without snapping. Named constants will make later feel tuning straightforward.

Alternatives considered:

- A one-time physics impulse was rejected because the current per-frame pursuit write would erase it and arena friction would make identical hits inconsistent.
- Constant-speed motion was rejected because the requested reaction should read as an impact that settles rather than a mechanical conveyor push.
- Direct position teleporting was rejected because it would make the direction readable but not the motion, and it would bypass normal physics/boundary handling.
- Scaling displacement by hero speed or damage was rejected because the requested behavior is shared across all heroes and needs a predictable visual language.

### Pass normalized impact direction through both damage paths

Pure combat-rule helpers will normalize a source-to-target vector, provide a deterministic side-opposing fallback for coincident points, and derive velocity from the configured distance and duration.

For contact damage, the collision handler will snapshot both hero positions before changing either unit's movement state. Each survivor receives the opposite source-to-target direction. For projectile damage, the projectile will retain its previous ground position so impact can report the final travel segment; if that segment is degenerate, attacker-to-target direction is the fallback. This preserves the actual incoming direction even when a homing target moves.

Alternatives considered:

- Recomputing every direction from attacker to defender after damage was rejected for projectiles because it can disagree with the visible final approach.
- Passing attacker/projectile objects into a generic knockback function was rejected in favor of a small direction-value contract that is easier to test and does not couple combat rules to scene resources.

### Replace, do not accumulate, active knockback

If a later successful hit passes the existing damage cooldown while knockback remains active, its direction replaces the old direction and the duration restarts. This avoids unbounded velocity and makes the most recent visible impact authoritative. Fatal damage keeps the existing terminal precedence: unit removal clears knockback, disables physics, and begins `DEAD` without waiting for displacement.

Alternatives considered:

- Adding vectors was rejected because simultaneous or repeated contacts could create extreme or ambiguous movement.
- Queuing reactions was rejected because delayed movement would no longer correspond visually to the hit that caused it.

### Keep knockback separate from artwork animation state

Knockback moves the existing hero gameplay root through its physics body. `TAKE_DAMAGE` continues to blink artwork within that root, and the animation controller remains responsible only for local artwork transforms. The movement-to-animation synchronization must not replace `TAKE_DAMAGE` with `WALKING` during the blink; after the blink, the repeating state can reflect whether knockback or pursuit still produces velocity.

No new mesh, material, observer, or other Babylon resource is created. Knockback state belongs to the unit and is cleared when the unit is removed or the gameplay scene is disposed, so existing hero/projectile disposal ownership remains unchanged.

### Preserve normal collision interaction

Knockback does not disable hero collision or add an immunity window. The existing contact cooldown remains the sole gate for another contact-damage event, so a knockbacked hero can separate from or collide with another hero according to the existing physics simulation.

### Reuse arena and lifecycle timing contracts

The existing post-physics playable-bound constraint will clamp position and block outward velocity components, including knockback. Knockback remains planar, keeps angular velocity zero, and uses existing Y-based depth sorting. Timers advance from the same battle delta as target-pursuit movement so later pause integration can freeze both through one timing path rather than special-case knockback.

Touch behavior is unaffected because knockback has no input path. Live viewport resize is also unaffected because the displacement uses Babylon world units inside the fixed arena; browser verification will confirm the centered 9:16 frame and equivalent relative displacement at large desktop, narrow portrait, and width-limited tall mobile viewports.

## Risks / Trade-offs

- [Continuous contact can produce repeated back-and-forth reactions] → Preserve the existing damage cooldown and replace rather than stack knockback.
- [Per-frame pursuit can leak into the reaction] → Make knockback the first explicit branch in movement arbitration and test that pursuit is not written until expiry.
- [A wall can shorten the configured distance] → Treat arena containment as higher priority and verify clipping rather than forcing penetration or sliding outside bounds.
- [Projectile direction can be zero on the final frame] → Retain the previous projectile ground position and use attacker-to-target, then side-opposing, deterministic fallbacks.
- [Movement synchronization can hide the damage blink] → Preserve `TAKE_DAMAGE` as a temporary animation override and cover it with source-level or controller tests.
- [The chosen feel may need adjustment after playtesting] → Centralize distance and duration and include real-browser checks before accepting the implementation.

## Migration Plan

Add the new state and helpers behind the existing damage paths, then verify focused rules/tests, the full test suite, production build, and live combat. No saved data or API migration is required. Rollback is additive: remove the knockback state/helpers and restore direct pursuit writes while leaving the existing health, animation, projectile, and boundary systems intact.
