## Why

The battle currently treats hero movement as opposing directional travel, so heroes do not make an intentional combat choice and can ignore the enemy that is most relevant to them. This change makes each hero pursue a remembered opponent, creating readable target-driven behavior while preserving the existing lightweight Babylon.js battle loop.

## What Changes

- Add hero target selection shared by all hero types.
- Have each hero retain its selected enemy while that target remains active.
- Allow each hero to reconsider its target periodically, using a cooldown to prevent frame-by-frame target thrashing.
- Prefer an untargeted enemy, choosing by combat relevance: closest distance first, with lower current health preferred when candidates are otherwise comparable.
- Allow a hero to select an already-targeted enemy when no untargeted enemy remains.
- Replace fixed upward/downward movement with normalized movement toward the remembered target, while retaining the existing movement scale and collision system.
- Reacquire a target when the remembered enemy is removed or otherwise unavailable, or when the periodic retarget interval elapses; stop when no opposing enemy remains.
- Preserve the centered 9:16 game frame and support the same desktop and portrait mobile browser viewports.

## Capabilities

### New Capabilities

- `hero-behavior`: Target selection, target memory, and target-directed movement for battle heroes.

### Modified Capabilities

- `hero-line-battle`: Replace opposing fixed-direction movement with target-directed movement and define how movement responds to active, removed, and exhausted enemy sets.

## Impact

- Affects battle targeting and movement logic in `src/gameplay.js` and `src/battle-rules.js`, the runtime hero state in `src/hero.js` if target ownership belongs there, and focused battle tests.
- Existing collision damage, health, removal, formation timing, hero stats, and side indicators remain in scope unless the detailed design identifies a necessary integration adjustment.
- No new dependency is proposed; the existing JavaScript, Vite, and Babylon.js toolset is sufficient.
