## Why

Hero and projectile removals currently leave no lasting trace in the arena, so important battle events disappear without changing the environment. A reusable environmental-effects capability will make those moments visible now and provide a focused extension point for additional ground effects later.

## What Changes

- Add a scene-owned environmental-effects system that can place persistent effect instances at Babylon world positions and dispose their shared and per-instance resources with the scene.
- Add the first environmental effect, an approved transparent radial-crack artwork used across every arena.
- Preserve the approved 1254 by 1254 PNG source, treat its 50% world-space scale as the 100% baseline size, grow it linearly to 150% of baseline as damage rises from 10 to 30, and use 100% opacity.
- Give every crack instance an independent random rotation around the artwork's center point.
- Spawn one crack at a hero's final ground position when hero death begins.
- Spawn one crack at a projectile's last valid ground position whenever that projectile is disposed, including after impact or because its target disappeared.
- Render effects above the arena background and below combat shadows, heroes, and projectiles while preserving the centered 9:16 frame's proportional composition on desktop and portrait mobile viewports.
- Reuse the existing Babylon.js and Vite toolset without adding dependencies.

## Capabilities

### New Capabilities

- `environmental-effects`: Defines reusable, persistent arena-ground effects, their lifecycle, rendering contract, and the initial hero/projectile crack triggers.

### Modified Capabilities

None.

## Impact

- Adds the approved crack PNG under the project's public artwork assets.
- Adds a focused environmental-effects module and depth-layer constant.
- Integrates effect creation with scene/gameplay setup, hero removal, projectile disposal, and scene cleanup.
- Adds automated lifecycle and trigger coverage plus real-browser visual verification at required desktop and portrait viewport sizes.
- No new runtime dependencies, public network access, or breaking API changes are required.
