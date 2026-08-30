## Why

Heroes currently appear, move, and disappear without a dedicated visual animation contract. A small state-driven animation system will make spawning, idle, movement, damage, and death readable now while establishing an extension point for future sprite-sheet frames combined with procedural animation.

## What Changes

- Add artwork-only hero animation states for `SPAWN`, `IDLE`, `WALKING`, `TAKE_DAMAGE`, and `DEAD`.
- Call each numbered formation row a hero line, with hero lines numbered 1 through 6.
- Spawn each formation onto its hero line one hero at a time from left to right.
- Start each hero's artwork at 0% scale when it first appears on a hero line, ease it to 100% scale over a configurable default of 0.2 seconds using Babylon.js `BackEase` with `EASINGMODE_EASEOUT`, and then enter `IDLE`.
- Keep hero bounds, collider, and shadow independent from artwork transforms; procedural position, rotation, scale, and color effects apply to the hero artwork itself.
- Make idle and walking repeat in randomized 0.1-to-0.2-second cycles so consecutive loops do not look identical.
- Make damage blink the artwork with a configurable color.
- Make death blink the artwork with a configurable color, then shrink it from 100% to 0% scale over a configurable default of 0.1 seconds before disposal.
- Centralize timings, colors, and variation limits under plain-language configuration names so later requests can tune the effects directly.
- Preserve an animation interface that may later combine sprite-sheet frame animation with procedural animation; the exact combination remains undecided.
- Preserve the centered 9:16 presentation and equivalent behavior on desktop and portrait mobile browsers.
- Use existing Babylon.js capabilities with no additional dependency.

## Capabilities

### New Capabilities

- `hero-animation`: Defines hero artwork animation states, hero-line spawn sequencing, transitions, randomized loops, configurable effects, easing, death completion, and the future frame-plus-procedural extension point.

### Modified Capabilities

None.

## Impact

- Affects hero visual ownership and lifecycle in `src/hero.js` and animation triggers in `src/gameplay.js`.
- May add a focused animation module and pure timing/variation helpers with tests.
- Changes defeated-unit disposal timing so gameplay can disable a defeated unit immediately while its artwork completes the death effect.
- Adds no package, renderer, framework, or public network API.
