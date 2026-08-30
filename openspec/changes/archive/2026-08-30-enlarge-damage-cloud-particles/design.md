## Context

See `proposal.md` for motivation and
`specs/babylon-lite-particle-effects/spec.md` for required behavior. The current
damage-cloud controller samples plane size and X/Y position from centralized
configuration bounds, parents each plane to a hero-relative transform, and owns
the effect's animation and cleanup lifecycle. The requested visual adjustment
does not require a new particle system or resource-ownership model.

## Goals / Non-Goals

**Goals:**

- Express the final scale, spread, and owner-relative depth changes as exact
  configuration values.
- Preserve the existing randomized sampling and hero-relative scene-space model.
- Prove the effect remains bounded and visually consistent across required
  viewport shapes.

**Non-Goals:**

- Change particle count, texture, opacity curve, delay, or lifetime.
- Change the cloud controller, resource ownership, cleanup, or pause behavior.
- Add screen-space sizing, responsive branches, touch behavior, or dependencies.

## Decisions

### Use the final diagnostic-validated size bounds

Set the minimum size to `1.65` and the maximum size to `2.7`. These are half of
the temporary 10x diagnostic values that made the clouds unmistakable during
live validation, retaining the existing relative size variation while settling
on the user-approved final presentation.

### Keep the final spawn spread close to the owner

Set the horizontal range to `0.255` and vertical range to `0.315`, half of the
expanded diagnostic spread. Keep symmetric random sampling from negative to
positive range on each axis so placement remains unbiased and visibly tied to
the spawning hero.

### Offset cloud depth relative to its owner

Set the cloud's local Z offset to `-1`. With the existing camera, lower Z is
closer, so this places the cloud immediately in front of its owner. Because the
offset is applied relative to the hero's Y-sorted depth, the cloud does not
become a global foreground layer and a nearer hero can still overlap it.

### Retain hero-relative Babylon world units

Continue parenting cloud planes to the hero-relative effect root and expressing
size and offset in Babylon world units. This preserves the existing centered
9:16 composition and avoids a second screen-space scale path. CSS units,
viewport units, and responsive breakpoints were rejected because the effect is
owned by the scene and must track its moving hero.

### Keep the existing lifecycle unchanged

No mesh, material, texture, observer, or disposal ownership changes are needed.
The current bounded burst, single update observer, pause-aware timing, and
cleanup behavior remain intact. Only configuration and matching assertions need
to change.

## Risks / Trade-offs

- [Larger clouds may overlap adjacent heroes or obscure artwork] → Verify live
  damage exchanges at all required viewports and retain the existing bounded
  lifetime, count, and fade behavior.
- [Offsets may make some clouds appear detached from the damaged hero] → Keep
  the effect hero-parented and validate the exact `0.255`/`0.315` limits in a
  representative battle.
- [Clouds may incorrectly cover every character] → Keep depth owner-relative
  and test that a nearer Y-sorted hero can render in front of another hero's
  cloud.
- [Tests may verify only endpoints and miss randomized interior samples] →
  Cover minimum, midpoint, and maximum deterministic random inputs.

## Migration Plan

Update the four configuration bounds and their focused tests, then run the full
suite, production build, and live-browser viewport checks. Rollback restores the
previous four values; no persistent state or resource migration is required.
