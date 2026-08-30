## 1. Catalog and Session State

- [x] 1.1 Add five immutable base-power definitions and ten polarity variants with exact signed values, sides, badges, art, and independent XP keys; verify focused tests assert all ten records.
- [x] 1.2 Add deterministic three-of-ten sampling without replacement and stable per-wave offers; verify tests allow opposite variants of the same base power together.
- [x] 1.3 Refactor session flow to `choice-menu` hero, powerup, and activation substeps with restart resets; verify game-session tests cover `3 → 2 → 1 → 3 → 1 → battle`.

## 2. Row Effects and Temporary Stats

- [x] 2.1 Add effective current/max health, damage, and speed plus wave-scoped modifier ownership without mutating canonical profiles; verify combat and movement tests read effective values.
- [x] 2.2 Implement deterministic random occupied-row selection for blue player and red enemy variants; verify exactly one eligible row and no opposite-side units are affected.
- [x] 2.3 Implement Shield, War Banner, Winged Boots, and Battle Cry signed modifiers with zero/one floors; verify exact values, one-time application, and current-health defeat handling.
- [x] 2.4 Implement positive and negative Healing Heart as one-time signed current-health changes; verify healing caps at maximum, damage can defeat, and neither is reversed.
- [x] 2.5 Clear temporary modifiers at battle end, restart, and disposal while preserving battle damage and Healing Heart outcomes; verify multi-wave survivor tests show no modifier carryover.

## 3. Choice Menu UI

- [x] 3.1 Reuse the existing card composition for powerups with native-button semantics and single-activation guards; verify hero-card regressions and keyboard, pointer, and touch accessibility tests.
- [x] 3.2 Route the final hero formation pause to an offer with exact heading `Choose Powerup`, then block FormationReady until one activation completes; verify integration tests cover the full click sequence and no premature movement.
- [x] 3.3 Render centered art, title, signed stat, independent padded XP, and blue `+` or red `−` badge; verify positive Shield and negative Winged Boots card contents and accessible names.
- [x] 3.4 Add five shared project-local transparent powerup artworks without dependencies and verify every variant asset resolves in the production app.

## 4. Shield Activation

- [x] 4.1 Implement one green positive-Shield or red negative-Shield overlay per affected unit with `8cqw` size and pause-aware fade/rise/fade; verify count, color, progression, and cleanup tests.
- [x] 4.2 Keep overlays projected to affected Babylon heroes during live resize and dispose them on completion, restart, or gameplay disposal; verify alignment and orphan checks.
- [x] 4.3 Wait for Shield activation and any resulting death cleanup before battle start; verify paused activation cannot advance gameplay.

## 5. Verification

- [x] 5.1 Add Choice Menu CSS using only `cqw`, percentages, Grid, and Flexbox for in-frame composition; verify the visual-scaling contract detects no fixed pixels, viewport units, breakpoints, or reflow.
- [x] 5.2 Update hero-line, three-wave, pause, audio, accessibility, and selection regressions while preserving 50ms left-to-right formation spawning and existing pauses; verify the complete automated suite passes.
- [x] 5.3 Run the production build and verify no new dependency, lint, compile, or missing-asset error.
- [x] 5.4 In one live browser session, verify three distinct variants, opposite variants can coexist, correct blue-player/red-enemy row targeting, one activation, cleanup, and delayed battle start.
- [x] 5.5 Resize the same session through large desktop, narrow portrait, and tall width-limited mobile viewports; verify the centered 9:16 frame, heading, cards, badges, art, text, and icons preserve relative composition without overlap.
- [x] 5.6 Verify touch activation without hover and inspect the final diff for only scoped implementation, asset, test, and planning changes.
