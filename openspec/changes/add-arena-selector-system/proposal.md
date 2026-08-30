## Why

Battles currently always use one visual field and have no arena boundaries or
surface-specific movement. Multiple arenas will add immediate visual variety
while establishing reusable arena data for later selection and progression.

## What Changes

- Define three numbered arenas, each pairing one background artwork asset with
  a global friction value and shared playable-boundary geometry.
- Revise the existing grass field into an exact 70-pixel-band Arena 1 and create
  two new 800 by 1472 portrait backgrounds: a dirt-and-trees arena and a
  futuristic metal arena.
- Require every artwork to use a uniform 70-pixel non-playable wall band on all
  four edges, with the entire inset region depicted as playable floor.
- Randomly choose one of the three arenas whenever the game loads so repeated
  refreshes expose every arena during temporary testing.
- Allow development and QA to force a reproducible arena with `?arena=1`,
  `?arena=2`, or `?arena=3` while keeping normal loads random.
- Apply progressively stronger arena friction to hero movement so Arena 2 is
  visibly slower than Arena 1 and Arena 3 is slower than Arena 2 without
  changing canonical hero stats.
- Add static perimeter collision walls that prevent heroes from entering the
  70-pixel artwork wall band, stop inward motion without bounce, and allow
  tangential sliding.
- Add an opt-in development debug display for visually checking collider
  alignment against the arena artwork.
- Preserve the existing responsive 9:16 presentation on desktop and portrait
  mobile browsers.
- Present the three guided artwork candidates for explicit user approval before
  integrating them into runtime arena selection.

## Capabilities

### New Capabilities

- `arena-system`: Defines arena data, artwork geometry, randomized load-time
  selection, per-arena friction, perimeter collisions, and collider debugging.

### Modified Capabilities

- `hero-line-battle`: Hero movement is modified by the selected arena's global
  friction and constrained to its playable floor.

## Impact

- Affects arena creation, scene startup, hero movement/physics integration,
  and automated browser/gameplay verification.
- Replaces the existing grass background with a geometry-corrected Arena 1 and
  adds two local background artwork assets after visual approval.
- Uses the existing Babylon.js and Havok dependencies; no new package or
  browser permission is required.
