## 1. Reusable Prompt And Settings Foundations

- [x] 1.1 Add failing reusable-window tests for optional X rendering, full-width
  no-X titles, disabled backdrop dismissal, explicit action-button dismissal,
  and unchanged Settings defaults; run the focused tests and confirm the new
  assertions fail for the intended missing behavior.
- [x] 1.2 Extend the reusable game window with close-control and backdrop-policy
  options, accessible action content, and focus behavior; rerun the focused
  window and Settings tests and confirm they pass.
- [x] 1.3 Add failing settings-store and Settings UI tests for the boolean
  `Skip Start Menu` value, invalid/missing default off, immediate persistence,
  reset to off, and its labeled checkbox; run them and confirm the intended
  failures.
- [x] 1.4 Implement the Skip Start Menu setting and frame-relative Settings row,
  then rerun settings-store, Settings UI, pause-controller, and visual-scaling
  tests and confirm existing settings behavior remains intact.

## 2. Session State And Wave Introduction

- [x] 2.1 Add failing tests for the explicit session phases, default Never Spawn
  prompt copy and Play action, skip-menu startup, and duplicate-action guards;
  run the focused tests and confirm they fail for the missing flow.
- [x] 2.2 Introduce session-owned wave number, phase, generation/cancellation
  guards, prompt ownership, and startup routing without creating cards in the
  gameplay constructor; rerun the focused startup/session tests and confirm the
  main-menu and skipped-menu branches pass.
- [x] 2.3 Add failing pause-aware timing tests for the Wave N label's 250ms fade
  in, 500ms hold, 250ms fade out, input isolation, and exact resume after
  Settings closes; run them and confirm the intended failures.
- [x] 2.4 Implement the wave-intro layer and pause-aware phase schedule using
  frame-relative styling; rerun its focused tests and the pause regression suite
  and confirm selection appears only after the complete 1000ms sequence.

## 3. Per-Wave Selection And Experience

- [x] 3.1 Add failing tests that every wave resets its distinct-choice pools,
  requires the exact back/next/front three-click sequence, mirrors enemy choices,
  and increments only the accepted hero type's XP; run them and confirm the
  intended failures.
- [x] 3.2 Implement per-wave selection reset and run-scoped XP keyed by hero id,
  including `XP:000` through `XP:003` card formatting; rerun selection, battle
  rules, and XP tests and confirm every type reaches three after three drafts.

## 4. Survivor Carryover And Growing Formations

- [x] 4.1 Add failing unit tests for next-wave survivor consolidation: player
  line 6, enemy line 1, preserved health and stable order, cleared movement and
  combat transients, and no revival of defeated units; run them and confirm the
  intended failures.
- [x] 4.2 Implement survivor rollover while retaining live hero identity and
  health, canceling prior-wave work, and clearing targets, velocities, cooldowns,
  knockback, and transient projectiles; rerun rollover, physics, projectile,
  collision, animation, and environmental-effect tests.
- [x] 4.3 Add failing formation tests for appending the new five-unit back-line
  formation and evenly re-spacing all old and new units left to right within the
  playable arena width on both sides; run them and confirm fixed overlap or
  missing survivors fails.
- [x] 4.4 Implement combined back-line re-spacing in Babylon world units while
  preserving the existing 5/3/1 new-formation counts and 50ms left-to-right
  spawn cadence; rerun formation, arena-bound, depth, and collider tests.

## 5. Results, Advancement, And Restart

- [x] 5.1 Add failing state-transition tests for intermediate Wave Complete copy
  and Next Wave, defeat Game Over, wave-three Game Over, prohibited fourth wave,
  mandatory prompt dismissal, and idempotent result detection; run them and
  confirm the new assertions fail.
- [x] 5.2 Implement nonterminal intermediate-wave stopping and the specified
  Wave Complete/Game Over prompts, ensuring Settings can overlay and return to
  each prompt without advancing it; rerun result and pause tests.
- [x] 5.3 Add failing repeated-restart tests for complete hero, physics,
  projectile, observer, schedule, effect, DOM, wave, selection, and XP cleanup,
  including both values of Skip Start Menu; run them and confirm stale-session
  callbacks or resources are detected.
- [x] 5.4 Implement session disposal and fresh restart routing, then rerun the
  restart tests and verify successive complete sessions do not duplicate scene
  observers, prompts, collision callbacks, or units.

## 6. Integrated Verification

- [x] 6.1 Run the complete automated test suite with `npm.cmd test` and fix any
  regressions while preserving the approved three-wave behavior.
- [x] 6.2 Run `npm.cmd run build` and verify the production build completes with
  no new dependency, compilation, or bundling error.
- [x] 6.3 In one live browser session, play the full default three-wave path and
  verify main-menu copy, every wave intro, three selections per wave, cumulative
  XP, survivor health and re-spacing, intermediate progression, final victory,
  and restart; also verify a defeat ends the run.
- [x] 6.4 In that same browser session, verify Settings pauses the wave intro and
  overlays mandatory prompts correctly, Reset turns Skip Start Menu off, and an
  enabled Skip Start Menu bypasses the menu on reload and restart.
- [x] 6.5 Verify the complete affected composition at a large desktop viewport,
  a narrow portrait viewport, and a tall mobile viewport where width limits the
  frame; confirm the frame stays centered and exactly 9:16 and that prompts,
  wave text, cards, growing back lines, Settings, spacing, focus effects, and
  touch targets retain proportional placement without overlap or reflow.
- [x] 6.6 Inspect the final diff with `git diff --check` and `git diff`, confirm
  only scoped implementation, tests, and approved OpenSpec artifacts changed,
  and record the commands and browser evidence used for verification.

### Verification record

- `npm.cmd test`: 125 tests passed.
- `npm.cmd run build`: Vite production build completed successfully.
- `openspec validate add-three-wave-gameplay-loop --strict`: valid.
- Live browser at `http://127.0.0.1:5174/`: completed the default three-wave
  victory path, verified `XP:000` through `XP:002`, restart, an alternate
  Wave 1 defeat, Settings overlay/pause/reset, and Skip Start Menu reload.
- One Playwright session verified 1440x1000, 390x844, and 430x932 viewports:
  the frame remained centered at 9:16, and prompts, Settings, and all cards
  stayed within the frame without horizontal overflow.
- `git diff --check` passed. Scoped diffs were reviewed separately from the
  unrelated arena, hero-mass, and collision-push work already in the worktree.

## 7. Per-Session Arena Rotation

- [x] 7.1 Add failing focused tests for a three-entry randomized arena order,
  no repetition, a Wave 1-only query override, wave-to-order mapping, and fresh
  order creation on Restart Game; run them and confirm the intended failures.
- [x] 7.2 Implement session-owned arena ordering and live Arena background plus
  Gameplay friction switching before every wave introduction; rerun the focused
  arena and gameplay-session tests and confirm all three arenas are used once.
- [x] 7.3 Add and pass restart regression coverage proving used-arena state does
  not leak into a replacement game session while the query override remains
  limited to Wave 1.
- [x] 7.4 Run the complete tests, production build, strict OpenSpec validation,
  and a live browser flow confirming the canvas arena id changes without repeat
  across Wave 1 through Wave 3 and resets with Restart Game.

### Arena rotation verification record

- `npm.cmd test`: 131 tests passed, including randomized order, query override,
  wave mapping, live-switch wiring, and replacement-session independence.
- `npm.cmd run build`: Vite production build completed successfully.
- `openspec validate add-three-wave-gameplay-loop --strict`: valid.
- Dedicated live browser session at `http://127.0.0.1:5175/?arena=1` completed
  all three waves with canvas arena ids `1`, `2`, and `3`, reached final victory,
  and Restart Game created a replacement session at the forced Wave 1 arena.
