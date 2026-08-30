## Context

See `proposal.md` for motivation and the delta specs for observable behavior. The current game creates its DOM overlay inside one `.game-frame`, constructs `Gameplay` after asynchronous Babylon/Havok loading, and advances mutable behavior through several independent `onBeforeRenderObservable` callbacks plus ordinary browser timeouts. Havok bodies continue to simulate when rendering continues. Audio playback currently creates an independent HTML `Audio` object for every sound and does not retain it.

The settings work overlaps files already modified by the active arena and hero-sorting changes. Implementation must integrate with the current checkout rather than replace those edits.

## Goals / Non-Goals

**Goals:**

- Establish one pause authority used by gameplay time, physics, effects, projectiles, animations, delays, and input routing.
- Make the modal window a reusable DOM primitive rather than settings-specific markup.
- Keep storage and audio categories extensible without adding a framework or dependency.
- Preserve exact frame-relative composition and touch behavior during live resize.

**Non-Goals:**

- Adding a music track, audio mixer UI, live numeric slider readouts, key bindings, or an Escape-key dismissal path.
- Changing the volume of audio instances that are already playing.
- Restarting battles from the winner screen or making the loader pausable.
- Pausing browser/network asset loading or persisting full gameplay state.

## Decisions

### Mount post-loader application chrome outside phase-owned content

Create persistent UI chrome after the loader completes and keep it as a sibling of phase-owned selection and result content. The chrome owns the gear and modal host, so `Gameplay` can replace or remove phase content without destroying settings. On the winner screen, the render loop must continue at least enough to present the DOM modal over the frozen terminal scene; battle simulation remains terminal.

Mounting the gear before initialization was rejected because the loader intentionally covers all UI and asynchronous Havok startup is not a safely pausable game phase. Putting the gear inside each phase was rejected because phase replacement would duplicate lifecycle and event ownership.

### Use an 800-unit design-space conversion expressed with frame units

Treat the requested measurements as authored against an 800-unit-wide composition: gear width and height are `64 / 800 * 100 = 8cqw`, while top and right offsets are `70 / 800 * 100 = 8.75cqw`. Size all modal geometry, typography, controls, spacing, borders, and effects with `cqw` or child-relative layout. Use no game-frame `px`, `vw`, `vh`, breakpoints, or independent clamps.

Literal CSS pixels were rejected because they would visibly change proportions across supported viewports and violate the project-wide frame contract.

### Separate reusable window structure from Settings Menu content

Use a small DOM `GameWindow` boundary that accepts title and body content and owns dialog semantics, backdrop, X button, gear/backdrop dismissal wiring, and disposal. A settings composer owns the two labeled range inputs and binds them to storage. Backdrop activation closes only when the backdrop itself is the event target; bubbled interaction from panel content must not dismiss it.

A settings-only monolith was rejected because the user explicitly requires the same window to host future game UI.

### Coordinate pause through one game-time authority

Introduce one pause state/controller and make every mutable time consumer use its effective game delta, which is zero while paused. Replace pause-sensitive `window.setTimeout` behavior with a scheduler driven by active game time or explicit remaining-duration records. This covers staggered formation creation, the final battle delay, collision and ranged cooldowns, projectile motion, hero animation, damage clouds, and death completion.

Rendering continues while paused so the frozen Babylon scene remains visible under the 50% backdrop. Per-frame visual depth synchronization may continue because it does not advance game state.

Independent paused flags in each subsystem were rejected because they can drift and allow hidden progression. Stopping the render loop was rejected because the modal and terminal state still need a stable rendered scene and because it would not pause ordinary browser timeouts.

### Suspend Havok and preserve dynamic-body velocity

When entering pause during a resumable phase, snapshot each live dynamic body's linear and angular velocity, set velocities to zero, and prevent physics stepping or collision callbacks from advancing until resume. On resume, restore valid snapshots before normal movement control continues. Bodies created only after active-time delays resume do not need snapshots.

Only setting a gameplay boolean was rejected because Havok could continue integrating bodies and producing contacts behind the modal. Disposing/recreating physics aggregates was rejected because it risks identity, metadata, and observer loss.

### Isolate modal input at the DOM boundary

While open, the full-frame backdrop captures pointer input above the canvas and selection cards. Only gear, X, backdrop, sliders, and future modal content accept pointer/touch behavior. Keyboard and underlying canvas/card input are blocked; Escape is intentionally not a dismissal command. Use native range inputs so mouse and touch dragging share browser behavior.

Disabling the entire `.game-ui` tree was rejected because it would also disable the modal. Relying on pause checks only in current card handlers was rejected because future inputs could bypass the contract.

### Persist one validated versioned settings document

Store a single namespaced JSON document with a schema version and a `values` map, initially containing `audio.musicVolume`, `audio.sfxVolume`, and `debug.showColliders`. Expose `get`, `set`, and subscription behavior through one store. Validate audio values as finite numbers in the inclusive 0-100 range and collider visibility as a boolean; invalid or missing values use 100 and false respectively. Keep memory authoritative for the current session if `localStorage` read or write throws.

Individual storage keys were rejected because arbitrary future settings and migrations would become scattered. Writing a file through a server was rejected because this is a static browser game and browser-local storage supplies the required local persistence.

### Apply category volume only when an audio instance is created

Classify existing sounds as SFX. Compute new playback volume as `perSoundVolumeOrOne * sfxVolume / 100`, clamped to the HTML audio range. Preserve configured pitch behavior. Add a music category multiplier interface even though no music asset currently plays. Do not retain instances solely to update or pause them; an instance already playing keeps its creation-time volume, as selected in the interview.

Tracking and modifying active instances was rejected because the confirmed behavior explicitly limits settings changes to new playback and unnecessary retention complicates cleanup.

### Reset only the game's namespaced settings document

Expose a store-level `reset` operation that clears the in-memory values map, removes `light-never-pawns.settings` through `removeItem`, and notifies subscribers for every known defaulted setting. The Settings Menu Reset button calls that operation, then synchronizes both native range elements from the store so they immediately display 100 without closing the modal.

Calling `localStorage.clear()` was rejected because it could remove unrelated same-origin data. Rewriting an explicit all-default document was rejected because Reset is specified to clear the persisted game settings and a missing document already maps cleanly to defaults.

### Drive Babylon physics debug rendering from the persisted setting

Own one collider-debug controller beside the arena and gameplay lifetimes. Subscribe it to `debug.showColliders`, synchronize Babylon's physics viewer with the complete current body inventory, and hide or dispose debug resources when disabled. Synchronizing while enabled ensures heroes created after selection receive a debug shape without coupling the Settings Menu to entity construction. The viewer is presentation-only and does not mutate physics bodies or game time.

Hand-authored debug geometry per hero and wall was rejected because it could drift from the actual Havok shapes. Enabling Babylon's full inspector was rejected because the requirement is a single focused runtime visualization and the inspector adds unrelated UI.

## Risks / Trade-offs

- [A newly added time-based subsystem can ignore pause] -> Route all mutable time through the pause authority and add a regression inventory test covering each current observer and delay owner.
- [Havok resumes with an unwanted contact impulse] -> Zero bodies before suspending, suppress contact resolution while paused, restore velocities deterministically, and verify positions and health remain unchanged across a long pause.
- [The winner path currently stops the render loop] -> Separate terminal simulation from presentation so settings remains operable without allowing gameplay to restart.
- [Backdrop dismissal can fire after slider interaction] -> Require direct backdrop targeting and test pointer/touch drags through slider endpoints.
- [`localStorage` can be unavailable or corrupted] -> Catch reads/writes, validate per key, retain in-memory state, and use defaults only for invalid values.
- [`localStorage.removeItem` can fail] -> Restore and notify in-memory defaults regardless of persistence availability, and catch the removal error.
- [Frequent slider writes are synchronous] -> Persist the very small settings document immediately as required; reassess only if future settings make the payload materially larger.
- [Concurrent active changes touch the same files] -> Re-read current sources before implementation, preserve unrelated hunks, and run arena, sorting, audio, gameplay, and visual-scaling regressions together.

## Migration Plan

1. Add the validated store with defaults and tests; existing players automatically receive 100 for both categories when no document exists.
2. Add category-aware audio playback while preserving all current per-sound settings and independent overlapping instances.
3. Introduce the pause authority and migrate every current time consumer and pause-sensitive delay before exposing the modal control.
4. Add the reusable window and Settings Menu to the post-loader chrome, then retain terminal rendering for winner-screen access.
5. Verify automated behavior, production build, and one live-browser session across the required desktop and mobile viewport sequence.

Rollback is additive: remove the post-loader chrome and category multiplier wiring, and return consumers to ordinary active deltas. The unused local settings document can remain harmlessly in browser storage; no destructive migration is required.
