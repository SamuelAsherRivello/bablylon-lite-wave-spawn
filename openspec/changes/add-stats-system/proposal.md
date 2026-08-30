## Why

Hero stats currently exist as loosely connected constants and per-instance fields. This makes the numbers difficult to balance consistently between the hero cards and live battles, while the current values do not communicate clear roles to the player. A dedicated stats system will give the three heroes one readable source of truth and make their trade-offs deliberate.

## What Changes

- Introduce a named stats system that defines each hero's base health, movement speed, and damage in one canonical data set.
- Use the same stat definitions to populate hero cards and initialize every gameplay hero, preventing display/runtime drift.
- Rebalance Rook, Pawn, and Bishop with round, player-facing values and clear tank, swarm, and striker identities.
- Define how health, damage, and speed are consumed during movement, collision, defeat, and future stat-driven gameplay.
- Add balance-oriented tests for the data contract, card presentation, runtime initialization, and expected match-up relationships.

## Capabilities

### New Capabilities

- `hero-stats-system`: Canonical hero stat definitions, presentation, runtime consumption, and balance invariants.

### Modified Capabilities

- `hero-line-battle`: Hero selection and line-battle behavior must use the stats-system values for displayed cards, movement, collision damage, and defeat.

## Impact

- Affects `src/battle-rules.js`, `src/hero.js`, `src/gameplay.js`, and related tests and card styling.
- No new dependencies or framework changes are required.
- The browser-facing selection cards gain clearer stat labels while remaining usable in the existing centered portrait frame on desktop and touch mobile browsers.
- Existing battle APIs remain local JavaScript module APIs; the change standardizes their source data rather than introducing a network or persistence layer.
