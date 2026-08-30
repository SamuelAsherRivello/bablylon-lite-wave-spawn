## Context

See `proposal.md` for motivation and `specs/environmental-effects/spec.md` for the behavior contract. The arena is a 9 by 16 Babylon world viewed by a fixed orthographic camera. Its background is at `GROUND_Z`, while shadows, heroes, and projectiles occupy progressively foreground depth bands. Hero death is centralized in `Gameplay.removeUnit()`. Projectile exit paths converge on idempotent `BishopProjectile.dispose()`, although `Gameplay` currently wraps that method to maintain its projectile set.

The approved Option 2 artwork is a 1254 by 1254 `Format32bppArgb` PNG in Codex generated-image storage. It must be copied into the project's public assets without resampling or destructive conversion before runtime use.

## Goals / Non-Goals

**Goals:**

- Establish one scene-owned environmental-effects API that accepts an effect type and Babylon world position.
- Keep event detection in gameplay/projectile code and visual resource ownership inside the effects system.
- Make hero and projectile triggers exact-once even when existing removal/disposal guards receive repeated calls.
- Share the crack texture and material across persistent effect meshes.
- Preserve the arena's world-space composition through live desktop and mobile viewport changes.

**Non-Goals:**

- Animated, timed, fading, interactive, collidable, or arena-specific environmental effects.
- Persistence across a page reload or a newly created Babylon scene.
- Random tint, random size variation, decals, particles, audio, or additional effect artwork.
- A general event bus or changes to combat damage rules.

## Decisions

### Scene-owned registry and instances

Add an `EnvironmentalEffects` module constructed once for the Babylon scene and injected into `Gameplay`. It owns a root transform, a small effect-definition registry, shared texture/material resources, and the set of created meshes. Its public creation operation receives a registered type and a cloned world position.

The initial registry contains only `ground-crack`, including its public asset path, unit plane dimensions, `0.5` baseline scale, damage range 10 through 30, baseline multiplier `1`, maximum multiplier `1.5`, full opacity, and ground-effect depth. Keeping these values in the definition makes future effect types additive without making battle events aware of artwork details.

Alternative considered: create crack meshes directly in `Gameplay` and `BishopProjectile`. Rejected because it duplicates resource setup, couples combat objects to presentation, and provides no coherent lifecycle for future effects.

### Plane meshes using a shared transparent material

Each instance is a non-pickable Babylon plane positioned in arena world units. All crack instances share one texture and one material configured to respect the PNG alpha channel, use black artwork without arena tint, and retain material alpha `1.0`. The approved 1254 by 1254 file is kept intact; normal texture sampling handles display scaling. A unit plane uses `0.5` as its 100% baseline world scale and multiplies it by a clamped linear damage factor: 10 damage maps to `1`, 20 maps to `1.25`, and 30 maps to `1.5`, producing final scales `0.5`, `0.625`, and `0.75`. This remains in Babylon world units without pixels, viewport units, breakpoints, or reflow.

`EnvironmentalEffects.create()` accepts an options object containing `damage`. An exported pure scale helper owns the interpolation and clamping so it can be tested independently. Missing or non-finite damage falls back to the minimum 10-damage baseline rather than producing invalid mesh scaling.

Each crack rotates around the plane's default center pivot by assigning `rotation.z` from the full `[0, 2 * Math.PI)` range. `EnvironmentalEffects` accepts an optional random-number source that defaults to `Math.random`, allowing tests to prove the endpoints and per-instance sampling without making production rotation deterministic. Rotation changes orientation only; it does not alter the effect's center position, damage-derived scale, opacity, depth, or resource sharing.

Alternative considered: a Babylon decal. Rejected because the arena is already a flat orthographic plane and a simple ground-layer plane provides clearer resource ownership and deterministic depth ordering without projection complexity.

### Dedicated environmental depth band

Add an environmental-effect depth constant between the arena background and `SHADOW_Z`. Crack instances use that fixed ground band and copy only the supplied X and Y coordinates. They do not use hero-style Y sorting because every crack belongs below all moving shadows and actors.

Alternative considered: parent effects to the arena background. Rejected because the gameplay system does not own the `Arena` instance today, and an explicit scene layer is easier to test while preserving identical behavior across arenas.

### Trigger at hero death entry

`Gameplay.removeUnit()` accepts the killing blow's damage, clones the hero root's X/Y ground position, and requests one crack immediately after its existing `unit.removed` guard transitions the unit into death. Collision damage passes the opposing hero's damage and projectile damage passes the attacker hero's damage. This records the final fall point while the death animation plays and naturally prevents duplicates on repeated removal calls.

Alternative considered: spawn after the death animation callback. Rejected because the visible trace should mark the key death moment, and delayed creation risks coupling effect creation to disposal timing.

### Projectile reports one final position from disposal

Give `BishopProjectile` an explicit disposal callback. Its guarded `dispose()` clones the root's last position before destroying meshes, invokes the callback once, and then releases resources. `Gameplay` uses that callback both to remove the projectile from its set and request a crack using the attacking hero's damage captured by the projectile-owning unit. Every current exit path already converges on `dispose()`, so post-impact disappearance and missing-target disposal receive identical semantics.

This replaces the runtime method wrapper in `Gameplay`, which is harder to extend and test. The projectile remains responsible only for reporting its final ground position; it does not know the effect type or effects system.

Alternative considered: spawn only in the projectile hit branch. Rejected because it would miss projectiles that disappear when their target is removed and future non-impact disposal paths.

### Explicit idempotent disposal

`EnvironmentalEffects.dispose()` removes its optional scene-disposal observer, disposes every instance mesh, then disposes the shared material, texture, and root exactly once. Registering with scene disposal guarantees cleanup even though `main.js` currently does not retain a manual application teardown object. Effects persist until that cleanup and have no physics or per-frame observer.

Babylon scene disposal may also cascade to owned resources; explicit guards make direct system disposal and scene disposal safe and testable.

### Viewport and touch behavior

Effects exist entirely in the same Babylon world coordinate system and orthographic camera as the arena. Engine resize therefore scales them uniformly with the centered 9:16 frame in the existing live browser session. The system adds no DOM elements, input observers, hover behavior, or touch targets, so existing mouse and touch behavior is unchanged.

## Risks / Trade-offs

- [Persistent effects can accumulate during unusually long battles] -> Keep each instance to one plane with no observer or physics body, share texture/material resources, and cover cleanup with lifecycle tests.
- [Thin black lines may be low contrast on some arena regions] -> Preserve the user-approved artwork, 100% opacity, and cross-arena visual verification; do not add unapproved tint, outline, or glow.
- [Transparent texture configuration can accidentally show an opaque square] -> Add source-alpha verification and a real-browser check over both arena backgrounds.
- [A projectile could emit twice if cleanup logic bypasses its guard] -> Keep one idempotent disposal entry point and test repeated disposal explicitly.
- [Depth values could place cracks above shadows or cause background z-fighting] -> Use a dedicated tested depth band strictly between the background and shadow constants.

## Migration Plan

1. Copy the approved generated PNG into a new public environmental-artwork directory without altering its dimensions or alpha channel.
2. Add the depth band and environmental-effects module with isolated lifecycle tests.
3. Construct and inject the system during scene setup.
4. Connect hero-death and projectile-disposal triggers, replacing the existing projectile disposal wrapper with the explicit callback.
5. Run automated tests, the production build, and same-session browser verification on all available arenas and all required viewport shapes.

Rollback is additive: remove the trigger injection and effects-system construction, then remove the unused module, depth constant, tests, and public artwork. No saved data or schema migration is involved.
