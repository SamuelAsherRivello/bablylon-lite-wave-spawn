## Context

See `proposal.md` for motivation. A hero currently owns a root transform, physics aggregate, shadow plane and material, and artwork plane and material. The artwork is parented directly to the root, collision damage is resolved by gameplay, and defeated heroes are disposed immediately. The new behavior crosses hero visual ownership and gameplay lifecycle, so it benefits from an explicit animation boundary.

## Goals / Non-Goals

**Goals:**

- Give every hero a state-driven artwork animation controller with time-based updates, beginning with spawn.
- Keep procedural animation local to the artwork so bounds, collider, and shadow retain stable gameplay transforms.
- Keep all tweakable timings, colors, and variation limits in one plainly named configuration object.
- Make randomized loops testable without relying on nondeterministic assertions.
- Delay resource disposal only for the duration needed to complete the terminal death effect.
- Keep gameplay unaware of whether a future animation uses procedural transforms, sprite-sheet frames, or both.

**Non-Goals:**

- Add sprite sheets, frame atlases, or frame playback in this change.
- Decide how future frame timing and procedural timing will be synchronized or blended.
- Animate bounds, colliders, or shadows in this change.
- Add attack animations, directional facing, animation authoring tools, or a new dependency.

## Decisions

### Introduce an artwork animation boundary

The hero root remains the bounds and physics transform. The existing artwork plane remains a child inside those bounds and is the only node transformed by the procedural animator. The shadow remains a sibling with its existing transform.

This avoids collider drift and makes the contract explicit: gameplay moves the hero root, while animation changes the artwork's local transform and material presentation. An extra visual root is unnecessary for the current single artwork plane and would make the ownership hierarchy less literal.

Alternative considered: animate the hero root. Rejected because visual bounce, tilt, and shrink would alter physics placement or require compensating transforms.

### Use a per-hero state controller updated from render time

Each hero owns one controller with `SPAWN`, `IDLE`, `WALKING`, `TAKE_DAMAGE`, and `DEAD` states. The controller tracks elapsed state time, the next or interrupted repeating state, current randomized cycle values, and terminal completion. Delta time drives progression so timings remain stable across frame rates.

State priority is:

```text
DEAD > TAKE_DAMAGE > SPAWN > WALKING > IDLE
```

`SPAWN` is the initial state and holds later `IDLE` or `WALKING` requests until its scale-up completes. `TAKE_DAMAGE` restores the appropriate repeating state after its blink. `DEAD` rejects later state requests and reports completion so gameplay can dispose the hero.

Alternative considered: independent Babylon animations started by gameplay. Rejected because overlapping one-shot and looping animations would scatter transition rules and restoration behavior across gameplay callbacks.

### Centralize human-readable tuning values

One exported configuration object uses seconds and descriptive names, such as:

```js
spawn.durationSeconds
spawn.easingType
spawn.easingMode
idle.minimumCycleSeconds
idle.maximumCycleSeconds
idle.maximumVerticalOffset
idle.maximumRotationRadians
walking.minimumCycleSeconds
walking.maximumCycleSeconds
walking.maximumVerticalOffset
walking.maximumHorizontalOffset
walking.maximumRotationRadians
damage.blinkColor
damage.blinkDurationSeconds
dead.blinkColor
dead.blinkDurationSeconds
dead.shrinkDurationSeconds
```

Defaults use a 0.2-second `BackEase`/`EASEOUT` spawn, keep idle and walking cycles between 0.1 and 0.2 seconds, and keep death shrinking at 0.1 seconds. Blink durations and colors are also defaults rather than literals in state logic. This vocabulary allows later natural-language requests to map directly to one setting.

Alternative considered: constants distributed beside each animation function. Rejected because tuning would require searching implementation details and could produce inconsistent units.

### Use Babylon.js easing for spawn

The animation controller resolves the configured spawn easing from Babylon.js core. The installed easing library provides `CircleEase`, `BackEase`, `BounceEase`, `CubicEase`, `ElasticEase`, `ExponentialEase`, `PowerEase`, `QuadraticEase`, `QuarticEase`, `QuinticEase`, `SineEase`, and `BezierCurveEase`. Each supports `EASINGMODE_EASEIN`, `EASINGMODE_EASEOUT`, and `EASINGMODE_EASEINOUT`; custom curves can implement `IEasingFunction`.

`BackEase` with `EASINGMODE_EASEOUT` is the default because it gives a readable arrival with a small overshoot. The type and mode remain plain-language configuration values so they can be changed without editing state transitions.

Alternative considered: a hard-coded cubic formula. Rejected because Babylon.js already supplies the requested easing library and the configurable catalog is useful for later tuning.

### Spawn formations on numbered hero lines

All numbered formation rows are called hero lines 1 through 6. Existing formation timers already create indexes from left to right; that order remains the source of truth. Constructing each hero starts its own `SPAWN` state immediately, so the existing stagger produces visible left-to-right spawn animations without moving bounds, colliders, shadows, or side indicators.

### Randomize once per repeating cycle

Idle and walking sample bounded duration and motion values at the beginning of each cycle. The next cycle is prevented from duplicating every prior sampled value; if the random source produces an identical set, one bounded value is varied deterministically. The controller interpolates from the neutral pose through the sampled pose and back to neutral during the cycle.

Pure helper functions accept an injectable random source. Production uses the browser random source; tests use a deterministic sequence. Random values never alter root movement or physics.

Alternative considered: sample randomness every render frame. Rejected because it creates jitter, makes motion dependent on frame rate, and is difficult to verify.

### Implement blink as artwork material color state

Damage and death temporarily apply a configured color to the artwork material and then restore its prior color state. Blink logic owns restoration so a damage blink cannot permanently tint a hero. The death sequence completes its blink before beginning scale interpolation from the artwork's normal 100% scale to 0%.

The animator resets local artwork transform and color when entering one-shot states, preventing a partially completed walk cycle from changing the starting scale or tint of a damage or death effect.

Alternative considered: swap textures or materials for blinking. Rejected because it would create extra per-hero Babylon resources and complicate disposal.

### Separate defeat from disposal

When health reaches zero, gameplay marks the unit removed from active collections, stops or disables its physics participation, and starts `DEAD`. The hero object, artwork, material, and texture remain owned by the hero until the animation completion callback triggers the existing disposal path. Disposal removes the render observer and disposes all hero-owned Babylon resources exactly once.

This keeps dead heroes from moving, being targeted, or resolving more contacts while preserving the short visible death sequence. Battle completion may be announced immediately, but the render loop must remain available until pending death animations complete; stopping rendering cannot preempt their final frames.

Alternative considered: dispose immediately after setting the death state. Rejected because the artwork would disappear before blinking or shrinking.

### Preserve a composable animation request API

Gameplay requests semantic state names through the hero rather than calling procedural functions. Internally, the controller has separate conceptual channels for frame playback and procedural presentation, but this change implements only the procedural channel. Future frame playback can be added behind the same request API and combined per state.

The exact shared clock, frame cadence, and blend rules remain deferred because no sprite-sheet assets or frame metadata exist yet.

### Keep touch and resize behavior passive

Animations require no pointer or touch input and use local Babylon scene units, so desktop and touch behavior are identical. Viewport resize continues through the existing camera and 9:16 frame path; the controller does not cache screen-space coordinates or recreate resources during resize.

## Risks / Trade-offs

- [Very short 0.1-to-0.2-second loops can appear nervous] -> Keep motion limits subtle and expose them next to timing values for rapid tuning.
- [Color changes on an emissive textured material may not read consistently] -> Verify the selected material color property in the real browser and keep the blink implementation isolated for adjustment.
- [Multiple collision callbacks may retrigger damage rapidly] -> Coalesce or restart the active damage blink without stacking observers or concurrent animations.
- [Battle render-loop shutdown may hide death completion] -> Track pending deaths and stop or replace the scene only after all required terminal animations finish.
- [Per-hero per-frame work scales with unit count] -> Reuse existing scene update flow, avoid allocations in steady-state updates, and remove observers on disposal.

## Migration Plan

1. Add animation configuration, easing resolution, and variation helpers with focused tests.
2. Add the hero-owned artwork animation controller, begin each hero in `SPAWN`, and connect it to hero update and disposal.
3. Preserve left-to-right creation on hero lines 1 through 6 and trigger walking, damage, and death states from existing gameplay events while preserving collider and bounds transforms.
4. Verify build, desktop browser behavior, portrait mobile behavior, resize behavior, collision placement, and delayed death disposal.
5. Roll back additively by removing the animation triggers and controller while retaining the existing root, artwork, shadow, and immediate disposal path.

## Open Questions

- When sprite sheets arrive, should frame playback share each procedural cycle's clock or run on an independent cadence?
- Which future states should combine both layers rather than use frame-only or procedural-only animation?
