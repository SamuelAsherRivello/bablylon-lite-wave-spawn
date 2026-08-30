## Why

The current per-wave card sequence ends after three hero formations, leaving no named strategic choice that modifies the upcoming battle. A Choice Menu with paired positive and negative row powerups adds a clear fourth decision while preserving the existing hero draft.

## What Changes

- Rename the hero-selection phase to the **Choice Menu** while preserving the current three-card, two-card, one-card hero sequence and formation timing.
- After the third hero formation, show the exact heading `Choose Powerup` above three distinct powerup cards randomly sampled from ten variants; the player chooses exactly one.
- Define five base powers, each with a blue `+` variant that affects one random occupied player row and a red `−` variant that affects one random occupied enemy row:
  - **Shield**: `+20` or `−20` current and maximum health for the wave.
  - **Healing Heart**: immediately restore or remove 20 current health once.
  - **War Banner**: `+5` or `−5` damage for the wave.
  - **Winged Boots**: `+5` or `−5` speed for the wave.
  - **Battle Cry**: `+2` or `−2` damage for the wave.
- Allow opposite variants of the same base power to appear together. Track three-digit run XP separately for all ten variants.
- Apply the chosen power once to one random eligible row. Temporary stat modifiers expire after the battle; Healing Heart's immediate health change is not reversed.
- Wait for activation to finish before starting the wave. Shield shows one approximately 32-by-32 frame-relative icon rising and fading over every affected unit: green for blue `+`, red for red `−`.
- Keep the shared hero-card composition, native keyboard/pointer/touch behavior, and proportional `cqw` scaling inside the centered 9:16 frame. No new dependency is proposed.

## Capabilities

### New Capabilities

- `choice-menu-powerups`: Defines the ten paired row-power variants, random offer, card UI, wave-scoped effects, XP, targeting, and activation feedback.

### Modified Capabilities

- `hero-line-battle`: Extends the existing 3-2-1 hero draft with one three-card powerup choice before FormationReady.
- `three-wave-gameplay-loop`: Makes the Choice Menu part of every wave and clears wave-scoped modifiers at battle end and all powerup state on restart.

## Impact

- `src/game-session.js` needs Choice Menu substeps, ten-variant offers and XP, and selected-effect state.
- `src/gameplay.js` needs reusable cards, row targeting on both sides, activation sequencing, and effect cleanup.
- Runtime units need reversible wave-scoped health, damage, and speed modifiers without changing canonical profiles.
- `src/style.css`, local powerup art, automated tests, and live desktop/mobile verification are affected.
