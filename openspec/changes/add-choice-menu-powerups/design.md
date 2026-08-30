## Context

See `proposal.md` for motivation. The current wave flow has one selection phase, directly renders hero cards, and starts setup after three asynchronous formations. The revision crosses session state, card UI, row targeting, temporary unit stats, pause-aware effects, and cleanup while preserving the centered 9:16 frame.

## Goals / Non-Goals

**Goals:**

- Model one Choice Menu with hero and powerup substeps.
- Represent five base powers as ten independently selectable and XP-tracked polarity variants.
- Target one random occupied row on the player or enemy side and remove temporary modifiers after battle.
- Preserve the current hero draft, pause rules, input accessibility, and frame-relative composition.

**Non-Goals:**

- Inventory, rerolls, rarity, shops, side-wide auras, repeating effects, or powerups outside the current run.
- New breakpoints, UI libraries, or animation dependencies.
- Required activation animations for powers other than Shield.

## Decisions

### Use one phase with explicit substeps

Replace the broad selection value with `choice-menu` and store `hero`, `powerup`, or `activation` as the substep. The existing 3-2-1 hero flow is unchanged. After the final formation pause, the powerup substep stores and renders an offer. A guarded selection changes to activation; FormationReady follows only when activation finishes.

### Model ten variants from five base definitions

Store shared base metadata separately from polarity data. A variant ID combines base ID and `positive` or `negative`, which determines badge color, sign, target side, signed amount, accessible name, and its independent XP counter. Sample three distinct variant IDs without replacement using an injectable random source. Opposite variants remain independently eligible.

### Apply to one occupied row

At activation, derive occupied rows from living units on the variant's target side and select one with the same injected random source. Snapshot the affected unit IDs so the effect and visuals cannot retarget during activation. Apply once to those units only.

### Separate immediate health changes from reversible modifiers

Healing Heart changes current health immediately and is not reversed. Shield records a wave-scoped maximum-health modifier and matching current-health change; War Banner, Winged Boots, and Battle Cry record signed wave modifiers. Damage and speed clamp at zero, maximum health clamps at one, and current-health reductions can defeat units. At battle end or disposal, remove remaining temporary modifiers; removing positive Shield clamps current health to the restored maximum without undoing battle damage.

Canonical hero profiles remain immutable. Runtime combat reads effective values derived from canonical stats plus active wave modifiers.

### Reuse the card composition

Use native buttons and the existing card dimensions/art/title/stat/XP structure. Add a frame-relative blue `+` or red `−` badge and the exact `Choose Powerup` heading. Each variant has a descriptive accessible name. All game-frame-owned measurements use `cqw`, Grid/Flexbox, or local percentages.

### Own Shield overlays in Gameplay

Create one DOM overlay per snapshotted unit, green for positive and red for negative Shield. Project from the Babylon hero into game-frame coordinates, advance fade/rise/fade with pause-aware delta, and use `8cqw` size. Gameplay owns and disposes all elements and update state. No new Babylon resources are required; any introduced during implementation must be explicitly session-owned and disposed.

## Risks / Trade-offs

- [Temporary modifiers may leak into later waves] → Tag modifiers with the wave generation and clear them on every battle-end, restart, and disposal path.
- [A negative health card can defeat a row before movement] → Treat zero health through the normal death/removal path and wait for activation completion before starting or resolving the battle.
- [Projection can drift during resize] → Recalculate from current canvas and game-frame bounds during the short animation and verify three viewport shapes.
- [Rapid input can double-apply] → Remove/disable the offer and leave the interactive substep before mutating units.

## Migration Plan

1. Add tested catalog, offer, XP, row-targeting, and effective-stat helpers.
2. Rename the phase and connect the hero substeps to the powerup offer.
3. Add shared card UI, polarity badges, and Shield activation ownership.
4. Verify cleanup, the full suite, production build, and one live resizable browser session.

No persisted-data migration is required because all state is run-scoped in memory.
