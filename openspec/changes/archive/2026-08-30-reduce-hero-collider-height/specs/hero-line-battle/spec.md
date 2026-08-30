## MODIFIED Requirements

### Requirement: Artwork-specific physics colliders

Each hero SHALL use a physics collider whose width and depth preserve the
existing hero collision footprint and whose height is exactly 50% of the hero
artwork height. The collider SHALL be anchored to the bottom center of the hero
artwork so its bottom edge aligns with the artwork bottom and its top edge
aligns with the artwork vertical midpoint. The hero's head and upper half SHALL
remain outside the collider. The collider SHALL remain attached to the hero's
gameplay root without changing the artwork, shadow, shadow-centered sorting
pivot, or game-frame-relative composition.

#### Scenario: Heroes collide by their feet

- **WHEN** two hero colliders overlap during movement
- **THEN** physics resolves the collision using only the bottom-anchored lower
  half of each hero
- **AND** the heroes' heads and upper artwork do not trigger or block the
  collision

#### Scenario: Collider stays aligned during hero motion

- **WHEN** a hero moves, jiggles, collides, or receives knockback
- **THEN** its collider remains anchored between the artwork bottom and vertical
  midpoint
- **AND** the hero artwork, shadow, and shadow-centered sorting pivot retain
  their existing alignment to the gameplay root

#### Scenario: Collider remains correct across supported viewport shapes

- **WHEN** the collider bounds are inspected in a large desktop viewport, a
  narrow portrait viewport, and a tall mobile viewport where width limits the
  game frame
- **THEN** the collider covers exactly the bottom 50% of the hero artwork in
  each viewport
- **AND** the centered game frame remains exactly 9:16 without overlap,
  incidental reflow, or non-uniform scaling
