## Context

See `proposal.md` for motivation. The current `Arena` owns one textured 9 by
16 plane, while `main.js` constructs it independently from `Gameplay`. Heroes
are dynamic Havok box bodies, and gameplay assigns their linear velocity every
frame. There is no floor physics body or perimeter geometry today.

The approved artwork contract is exact: every source is 800 by 1472 pixels,
the outer 70 pixels on every edge are walls, and the inset is floor. The source
ratio is intentionally preserved even though it is slightly narrower than the
rendered 9:16 plane.

## Goals / Non-Goals

**Goals:**

- Make one selected arena definition the source of truth for artwork,
  friction, and collision boundaries.
- Derive physics geometry mathematically from the approved pixel inset.
- Make friction differences visible, deterministic, and testable.
- Keep Babylon.js resources owned and disposed by the arena instance.

**Non-Goals:**

- A player-facing arena picker, unlock progression, persistence, or balancing UI.
- Curved or artwork-contour-aware corner colliders.
- Changes to canonical hero stat values.
- New runtime or UI dependencies.

## Decisions

### Store arena behavior in a small immutable catalog

Define three arena records containing `id`, `backgroundPath`, and `friction`.
Use Arena 1 friction `0.10`, Arena 2 friction `0.25`, and Arena 3 friction
`0.40`. Select one record with equal probability once during startup and pass
that same record to both `Arena` and `Gameplay`. For reproducible development
and QA, a valid `arena` query value of `1`, `2`, or `3` takes precedence over
random selection.

This prevents artwork, friction, and collision geometry from being selected
independently. The values create effective movement multipliers of 90%, 75%,
and 60%, which are distinct enough for refresh-based testing while retaining
the canonical speed relationships. Alternative values such as 0.1, 0.5, and
0.7 were considered but would make Arena 3 only 30% of base speed and risk
making battles feel stalled.

### Apply friction in the movement calculation

Compute effective commanded speed as:

`canonical speed * existing movement scale * (1 - arena friction)`

A physics-material-only approach was rejected because the controller replaces
linear velocity every frame and the current scene has no physical floor body;
Havok surface friction would therefore not reliably produce the specified
speed ordering. The arena value remains a global friction coefficient, but its
gameplay effect is applied where movement is commanded.

### Derive four static box colliders from the pixel contract

Convert the 70-pixel inset into the 9 by 16 world plane:

- Horizontal inset: `70 / 800 * 9 = 0.7875` world units.
- Vertical inset: `70 / 1472 * 16 = approximately 0.76087` world units.
- Playable inside faces: `x = +/-3.7125`, `y = +/-7.23913`.

Create four mass-zero physics boxes covering the outer bands. Slight corner
overlap is acceptable and avoids escape gaps. Straight boxes were chosen over
rounded corner shapes because all approved playable areas are rectangular.
Use zero restitution so heroes do not bounce. Physics contact removes velocity
into the wall while preserving tangential velocity, allowing heroes to slide
along an edge.

### Keep visual debug geometry separate from physics

Use a startup query parameter, `debugColliders=1`, to create four translucent,
high-contrast planes or boxes matching the collider transforms. Debug meshes
must not participate in physics and must be parented to the arena root. This
keeps the production view clean and makes alignment accessible on desktop or
mobile without adding UI controls.

### Generate and approve three geometry-correct artwork assets

Use the existing background as the visual composition reference, but revise
Arena 1 so its grass-floor boundary is exactly 70 pixels from every edge.
Generate Arena 2 and Arena 3 as 800 by 1472 raster assets, then validate all
three dimensions and visually verify them with exact 70-pixel review guides.
Trees in Arena 2 belong on the outskirts and must not intrude into the floor.
The metal walls in Arena 3 use the same inset and top-down perspective as its
metal floor. Present all three guided candidates to the user and pause. Only
approved unguided images may be copied into runtime asset paths and registered.

### Arena owns all arena-specific Babylon.js resources

The `Arena` instance owns its background texture/material/plane, four physics
aggregates and their meshes, and optional debug materials/meshes. Its disposal
path releases each resource. The selected plain-data arena record has no
disposal needs. Resizing remains camera/frame scaling only, so no collider
recalculation is needed and touch behavior is unchanged.

## Risks / Trade-offs

- [Generated art may imply a boundary outside the exact inset] -> Validate
  dimensions and review each asset with a 70-pixel guide before acceptance.
- [Direct speed scaling is not emergent surface physics] -> Document the
  controller constraint and cover the effective-speed formula with tests.
- [Straight walls do not reproduce decorative rounded corners] -> Keep the
  full approved inset rectangular so visuals and gameplay communicate the same
  playable area.
- [Random selection can make a specific arena inconvenient to reproduce] ->
  Keep selection injectable in tests while retaining equal random selection in
  normal runtime startup.

## Migration Plan

1. Produce and validate the revised Arena 1 and two new guided artwork
   candidates, then obtain explicit user approval before integration.
2. Introduce the catalog, query override, and deterministic selection seam, retaining Arena 1
   as a safe record if construction fails during development.
3. Add zero-restitution boundaries and debug visuals, then align them against
   all three assets and verify tangential sliding.
4. Route the selected friction into gameplay and verify relative travel speeds.
5. Verify repeated loads, desktop resizing, and portrait mobile presentation.

Rollback is additive: restore startup to the Arena 1 record and omit the new
catalog selection, wall resources, and friction multiplier while retaining the
existing asset.
