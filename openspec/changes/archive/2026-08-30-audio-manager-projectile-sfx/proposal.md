## Why

Projectile attacks currently create visual projectiles without an accompanying launch sound, and the audio helper has no way to make repeated effects quieter or less mechanically identical. This change adds lightweight per-sound volume and pitch variation so projectile launches have a subtle, varied sonic cue.

## What Changes

- Extend the audio manager with optional per-sound volume and randomized pitch-range settings.
- Register the existing `projectile-launch.mp3` asset as a sound.
- Play the projectile launch sound whenever a ranged projectile is spawned.
- Keep the feature compatible with desktop and portrait mobile browsers without adding dependencies.

## Capabilities

### New Capabilities

- `audio-feedback`: Configurable sound playback and projectile-launch feedback.

### Modified Capabilities

<!-- No existing capability requirements are being modified. -->

## Impact

- Affects `src/audio.js` and the projectile-spawn path in `src/gameplay.js`.
- Uses the existing asset at `public/audio/sfx/projectile-launch.mp3`.
- No package or build-tool changes.
- Browser audio remains subject to normal user-gesture/autoplay policies.
