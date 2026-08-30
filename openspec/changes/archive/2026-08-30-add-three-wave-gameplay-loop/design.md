## Context

See `proposal.md` for motivation. The active startup path constructs one
`Gameplay` instance, whose constructor immediately renders card choices. That
instance currently owns selection arrays, live Babylon hero resources, combat
timers, and the one-shot winner transition. `PauseController.setTerminal()` is
irreversible, while `GameWindow` always creates a close button and accepts
backdrop dismissal. Settings already uses the reusable window, pauses gameplay,
and persists typed values through the settings store.

The change crosses session orchestration, Babylon resource lifetime, DOM
windows, settings persistence, pause-aware timing, formation geometry, and
frame-relative presentation. No new dependency is needed.

## Goals / Non-Goals

**Goals:**

- Make state transitions explicit enough that one action cannot advance twice
  and obsolete callbacks cannot mutate a later wave.
- Preserve surviving Babylon hero instances and mutable health between waves
  while reliably disposing defeated, projectile, and completed-session resources.
- Keep Settings independently overlayable without losing or advancing the
  underlying menu, intro, selection, transition, or result state.
- Keep every new DOM element proportional to the centered 9:16 game frame and
  operable by mouse, keyboard, and touch without hover.
- Give each game session its own randomized, nonrepeating order of all three
  existing arenas and apply the matching background and friction before each
  wave introduction.

**Non-Goals:**

- Hero leveling, stat changes from XP, health restoration, power-ups, saving an
  unfinished run, new enemy AI, difficulty scaling, or a fourth wave.
- A new UI framework, state-machine package, animation library, or persistence
  mechanism.

## Decisions

### Use one game-session coordinator with explicit phases

Introduce a coordinator, either by expanding `Gameplay` or composing it around
smaller battle helpers, that owns `waveNumber`, run-scoped XP, current phase,
the active gameplay prompt, and the current unit collections. Valid phases are
main menu, wave intro, selection, formation, battle, wave complete, and game
over. Event handlers check the active phase and invalidate obsolete scheduled
callbacks with a session/wave generation token.

This is preferred over reloading the document between waves because reload
would lose survivor instances and current health. It is preferred over adding a
state-machine dependency because the transition graph is small and the existing
toolset is sufficient.

### Separate wave stopping from session termination

An intermediate victory stops combat and scheduled battle work without calling
the irreversible terminal operation used for a completed run. Advancing clears
transient battle collections, consolidates live survivors, and re-enables the
next wave. Defeat and wave-three victory enter a restartable game-over phase.

Restart disposes all remaining hero, projectile, effect, observer, and DOM
resources owned by the old session before creating fresh run state. It reads
the current Skip Start Menu setting at that moment rather than reusing the
setting value captured at initial page load.

### Preserve survivor identity and health

Survivors remain the same runtime units, keeping current health and hero type.
Before the next selection starts, player survivors are moved to line 6 and
enemy survivors to line 1. Their velocities, targets, attack cooldown state,
contact cooldowns, and knockback progress are cleared so prior-wave combat
cannot leak into the next wave.

The first new five-unit formation is appended to the relevant survivor group.
The complete combined back-line group is then assigned evenly centered X slots
in stable left-to-right order. Existing survivors keep their relative order,
followed by newly spawned units in creation order. Re-spacing uses Babylon world
units and the arena's playable width, not CSS coordinates. Lines 5/4 and 2/3
retain their existing three-unit and one-unit formation behavior.

Replacing survivors or imposing a five-unit cap was rejected because the user
explicitly chose visible army growth. Fixed overlapping slots were rejected
because they create unstable collision and illegible composition.

### Keep XP as run-scoped selection state

Store integer XP by hero id in session state, initialize each to zero, and
increment the selected id immediately when a valid card choice is accepted.
Cards format that value as three digits. XP changes no combat profile in this
change and is reset only with the complete session.

This is preferred over deriving XP from wave number because explicit per-type
state remains correct if selection rules change later and provides the natural
integration point for future power-ups.

### Shuffle arenas once per game session

Build a three-entry arena order when session state is created, using every
existing arena exactly once. Wave N reads entry N-1 and updates both the live
Arena background and Gameplay friction before its introduction. Restart Game
creates a new session and therefore a new randomized order. For reproducible
development, `?arena=N` fixes only the first entry; the other two entries remain
randomized without repetition.

This is preferred over selecting independently at each wave because a session
shuffle guarantees no repetition without retries and keeps the chosen order
inspectable in unit tests.

### Generalize window dismissal policy

Extend the reusable window with explicit close-control and backdrop-dismissal
options whose defaults preserve current Settings behavior. Mandatory gameplay
prompts disable both. Their sole action button owns progression, is usable by
keyboard and touch, and prevents repeated activation after the first accepted
event. When no X exists, the title uses the full available heading width rather
than retaining close-button spacing.

A close-button-only option was rejected because the existing backdrop handler
could dismiss a required prompt and strand the session.

### Make introductions pause-aware

Represent the 250ms/500ms/250ms sequence as pause-aware scheduled phases and
use CSS transitions/classes only for opacity rendering. Settings freezes the
remaining phase time and resumes it without restarting or skipping the label.
The intro layer owns pointer-event blocking and is removed after fade-out.

Using a standalone CSS animation with wall-clock completion was rejected because
it would continue behind Settings and violate the pause contract.

### Persist Skip Start Menu through the existing store

Add a boolean setting with default `false`, strict validation, immediate storage,
and reset integration. Startup and Restart Game consult it only when choosing
between the main-menu phase and Wave 1 intro. Toggling it does not mutate the
currently active phase.

### Preserve frame-relative visual composition

Prompt buttons, body copy, wave labels, new Settings rows, spacing, focus
effects, and touch targets use `cqw`, percentages, Grid, or Flexbox according to
their ownership. No new breakpoint, viewport unit, fixed-pixel measurement, or
independent clamp is introduced inside `.game-frame`. Live resize keeps the
same authored composition on desktop, narrow portrait, and tall width-limited
mobile viewports.

## Risks / Trade-offs

- [Growing survivor lines can become crowded] -> Compute spacing from the
  available world-width interval and verify the largest plausible wave-three
  group visually and physically.
- [Old scheduled callbacks can mutate a new wave] -> Cancel owned schedules and
  guard callbacks with the current session/wave generation.
- [A result can be detected more than once] -> Make battle-result transitions
  idempotent and disable accepted prompt actions immediately.
- [Preserved low health can make later waves difficult] -> Preserve health as
  specified; balance changes and power-ups remain a separate change.
- [Settings layered over a mandatory prompt can confuse modal ownership] -> Keep
  exactly one topmost interactive window and restore focus to the underlying
  prompt action when Settings closes.
- [Observers and physics resources can leak across restart] -> Give the session
  explicit ownership and disposal paths and cover repeated restart in tests.

## Migration Plan

1. Add the new setting with a backward-compatible default of off.
2. Generalize the reusable window while preserving existing Settings defaults.
3. Introduce session phases and move direct constructor selection behind the
   main-menu/wave-intro transition.
4. Add survivor rollover, cumulative XP, result prompts, and restart disposal.
5. Verify automated behavior and the complete three-wave flow in one live
   browser session at all required viewport shapes.

Rollback is additive: remove the session coordinator and new setting while
retaining the reusable window's default behavior. No saved game or database
migration is required; older stored settings data remains valid.
