## Why

Players currently cannot pause the game or change audio levels, including during hero selection. A reusable modal window, complete pause contract, and persistent settings store establish the first general-purpose in-game settings surface without coupling future UI to one screen.

## What Changes

- Add an always-available gear control after the loading screen completes, positioned and scaled relative to the centered 9:16 game frame on desktop and portrait mobile browsers.
- Add a reusable modal game window with a 50% black backdrop, title region, close control, content region, and pointer/touch interaction isolation.
- Add a Settings Menu window with Music and SFX sliders from 0 to 100, defaulting to 100, with static endpoint labels and no live numeric readout, plus a persisted `Collider?` checkbox that defaults off and reveals every active physics collider when enabled.
- Add a Reset button below the audio controls that removes this game's persisted settings and immediately returns both sliders and active audio settings to their defaults.
- Add a complete pause/resume contract for selection, formation, and battle phases so gameplay time, physics, animation, projectiles, delays, and non-modal input freeze and resume from the same point.
- Add a namespaced, versioned browser-local settings store that can persist arbitrary future settings as well as the two audio values.
- Apply the stored SFX multiplier to each sound's existing configured volume while preserving per-effect volume and pitch behavior; reserve the Music multiplier for current or future music playback.
- Keep already-playing audio unchanged when a slider changes; new playback uses the latest persisted multiplier.
- Allow dismissal through the X button, the gear button, or the dark backdrop. After the winner screen, the window remains available without restarting or resuming the completed battle.

## Capabilities

### New Capabilities

- `game-settings-menu`: Ever-present post-loader gear control and the two-control Settings Menu behavior.
- `game-ui-window`: Reusable modal game window presentation, dismissal, accessibility, and input isolation.
- `gameplay-pause`: Complete freeze-and-resume behavior across selection, formation, battle, and terminal states.
- `persistent-game-settings`: General namespaced local storage with defaults, validation, immediate writes, and change notification.

### Modified Capabilities

- `audio-feedback`: Apply category volume multipliers to newly created playback while preserving each sound's configured loudness and pitch.

## Impact

- Affects startup composition, gameplay phase/timer ownership, Havok stepping and body velocities, hero and particle animation updates, projectile updates, DOM input routing, audio playback, and game-frame CSS.
- Adds small ES-module UI, pause, and settings-store boundaries using the existing JavaScript, DOM, Babylon.js, and browser `localStorage` toolset.
- Adds no runtime dependency and introduces no breakpoint or alternate composition; all visible measurements scale from the game frame and must be verified in one live browser session at large desktop, narrow portrait, and tall width-limited mobile viewports.
- Must preserve unrelated work in the active arena and hero-sorting changes, especially where they overlap `src/main.js`, `src/gameplay.js`, and `src/style.css`.
