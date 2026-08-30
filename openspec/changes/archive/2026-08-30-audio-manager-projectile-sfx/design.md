## Context

See `proposal.md` for motivation. The current audio helper stores one `Audio` object per sound, while projectile creation is centralized in `Gameplay.tryRangedAttack()`.

## Goals / Non-Goals

**Goals:**

- Keep sound configuration data-driven and small.
- Allow overlapping effects by creating a playable instance per event.
- Use the existing browser audio API and asset; add no dependencies.
- Preserve touch, portrait, and viewport-resize behavior.

**Non-Goals:**

- No global mixer, mute UI, music changes, spatial audio, or audio sprites.
- No changes to projectile timing, collision, damage, or Babylon resource ownership.

## Decisions

- Store optional `volume` and `pitchRange` values alongside sound paths. This keeps call sites expressive and leaves existing sounds at defaults.
- Create a new `Audio` instance for each play request. Reusing one instance would cause rapid projectile launches to reset one another; a source cache or pooling system is unnecessary at this scale.
- Set `playbackRate` to a uniformly random value between the configured bounds. A narrow range around `1` gives subtle variation without changing the recognizable effect.
- Trigger playback immediately after successful projectile construction in `tryRangedAttack`, the single authoritative spawn path.
- Audio instances are browser-owned and are not Babylon scene resources. Each instance is naturally released after playback; failed autoplay is ignored as in the existing helper.

## Risks / Trade-offs

- [Risk] Many simultaneous projectiles can create many short-lived audio objects -> Keep the configured effect short and the pitch range narrow; avoid introducing a persistent pool until profiling shows a need.
- [Risk] Browser autoplay restrictions can reject playback -> Preserve the existing promise rejection handling; gameplay remains functional without audio.
- [Risk] Mobile device volume differs from desktop -> Use a deliberately quiet configured volume and verify the effect in both desktop and portrait mobile viewports.
