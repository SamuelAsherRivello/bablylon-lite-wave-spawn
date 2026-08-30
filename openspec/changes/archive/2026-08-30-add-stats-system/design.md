## Context

The current battle uses `HERO_CLASSES` for card text and copies individual
fields onto `Hero` instances. Movement and collision already consume those
instance fields, so the design can centralize data without changing the
physics model or adding a dependency. See proposal.md and the delta specs for
the intended player-visible behavior.

## Goals / Non-Goals

**Goals:**

- Establish one immutable profile table for the three hero types.
- Give each spawned hero a profile reference plus mutable current health.
- Keep card rendering and battle initialization on the same profile lookup.
- Preserve the existing portrait layout, touch selection, movement scale,
  collision model, and disposal behavior.
- Make the initial balance legible: Rook survives, Pawn closes distance, and
  Bishop wins short engagements through damage.

**Non-Goals:**

- No level progression, equipment, buffs, ranged attacks, abilities, or
  persistence.
- No changes to line counts, targeting, collider dimensions, or the 9:16
  frame.
- No new UI library, renderer, or runtime dependency.

## Decisions

### Canonical profiles in the existing battle rules module

Keep the named profile data in the existing rules module and expose a stable
lookup keyed by `rook`, `pawn`, and `bishop`. Freeze or otherwise treat the
profiles as read-only. This keeps balance values close to battle formulas and
avoids a new module for three small records. A separate JSON file was rejected
because it adds loading/validation concerns without a content-pipeline need.

Use the initial profiles Rook `(120 health, 20 speed, 20 damage)`, Pawn `(40,
30, 10)`, and Bishop `(80, 20, 30)`. With the current formations, the one
Rook and one Bishop are durable anchors while the five-Pawn line supplies
pressure; no single stat is best in all three categories.

### Separate profile values from battle state

When a `Hero` is constructed, copy the profile's health into `currentHealth`
or the existing mutable health field, and copy speed/damage for the current
runtime consumers. The canonical profile must not be reduced when a unit takes
damage. This preserves the current collision API while making future effects
able to distinguish base stats from temporary state.

### Shared card formatter

Build card labels from the same profile lookup used by the hero constructor.
Show a short role label plus explicit `HP`, `SPD`, and `DMG` values; keep the
existing compact card structure and use CSS wrapping or sizing appropriate to
the portrait frame. Avoid emoji-only semantics so the cards remain readable
with different fonts and on touch devices.

### Balance verification as invariants, not simulation claims

Unit tests SHALL assert exact values and ordering relationships, plus symmetric
collision arithmetic. Browser verification SHALL confirm that all three cards
show the values and that a started battle spawns heroes without runtime errors.
The proposal does not claim a final win-rate balance because the current game
has no rounds, AI strategy, or match result telemetry.

## Risks / Trade-offs

- [Risk] Existing tests or callers rely on `HERO_CLASSES` or legacy constants.
  -> Preserve compatibility exports where practical and update tests at the
  same time as the canonical lookup.
- [Risk] Three cards become cramped in the 9:16 frame. -> Use short labels,
  round values, and responsive typography; verify at desktop and portrait
  mobile viewport sizes.
- [Risk] Speed changes alter battle duration. -> Retain the existing movement
  scale and verify relative speed plus collision behavior before tuning further.
- [Risk] A future feature mutates shared profile objects. -> Keep profiles
  immutable and store mutable health only on runtime hero instances.

## Migration Plan

Implement the profile table and tests first, migrate `Hero` construction and
card rendering, then run the existing unit suite, production build, and a
real-browser smoke test. Rollback is a code-only revert of the change files;
no saved data or external schema is involved.
