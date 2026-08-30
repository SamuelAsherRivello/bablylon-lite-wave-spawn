## Why

The current game starts directly in hero selection and ends after one battle,
so it does not yet provide a complete, replayable game session. A three-wave
loop with clear entry, progression, defeat, victory, and restart states creates
the smallest end-to-end gameplay experience while reusing the existing battle
and settings interfaces.

## What Changes

- Start each game at a `Never Spawn!` main-menu prompt with instructions and a
  `Play` action, unless the player has enabled `Skip Start Menu` in Settings.
- Introduce a noninteractive `Wave 1`, `Wave 2`, or `Wave 3` presentation that
  fades in for 250ms, holds for 500ms, and fades out for 250ms before selection.
- Run three complete card-selection and battle waves within one game session.
- Randomize the three existing arenas into a nonrepeating per-session order so
  every wave uses a different arena, and create a fresh order on restart.
- Carry surviving player and enemy heroes, including their remaining health,
  into the next wave; consolidate and re-space them on their respective back
  lines as new formations join them.
- Award one cumulative XP to a hero type whenever its card is selected and show
  that run-scoped XP on later selection cards.
- Replace the single winner label with mandatory `Wave Complete` and `Game Over`
  prompts supporting next-wave and full-restart actions.
- Extend the reusable game window so callers may omit its X control and prevent
  backdrop dismissal for mandatory prompts.
- Add a persistent `Skip Start Menu` Settings toggle that defaults to off and
  makes a restart behave like a fresh load under the current setting.
- Preserve the centered 9:16 composition and frame-relative scaling on desktop,
  narrow portrait, and tall width-limited mobile viewports.
- Add no dependencies and defer health power-ups to a future change.

## Capabilities

### New Capabilities

- `three-wave-gameplay-loop`: Defines the main menu, timed wave introductions,
  three-wave progression, survivor carryover, cumulative XP, result prompts,
  defeat, victory, and restart behavior.

### Modified Capabilities

- `hero-line-battle`: Extends formation and selection behavior across waves,
  including survivor consolidation and combined-line re-spacing.
- `game-ui-window`: Supports mandatory prompt windows without an X control or
  backdrop dismissal.
- `game-settings-menu`: Adds the `Skip Start Menu` control and its immediate
  effect on future game starts.
- `persistent-game-settings`: Persists the new boolean setting with a default of
  off and includes it in reset behavior.
- `gameplay-pause`: Freezes wave-intro timing and preserves the active mandatory
  prompt or between-wave state while Settings is open.

## Impact

The change affects gameplay/session orchestration, battle cleanup and formation
placement, arena selection and live background/friction switching, reusable
game-window behavior, Settings UI and storage, pause timing, selection-card XP
display, game-frame-relative styles, and related automated and real-browser
tests. Existing Babylon.js, Vite, DOM, audio, and persistence dependencies
remain sufficient.
