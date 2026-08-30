## Context

Battle heroes are transparent-textured Babylon.js planes, and the current temporary side cue is a separate enlarged sprite that creates an unwanted silhouette. See proposal.md for motivation and the delta specs for observable behavior.

## Goals / Non-Goals

**Goals:**

- Produce a narrow blue or red edge that follows the source texture's alpha silhouette.
- Keep the effect behind the original art, within the hero rendering hierarchy, and compatible with portrait resizing and touch play.
- Reuse the existing Babylon.js core dependency and dispose all created resources with the hero.

**Non-Goals:**

- No unique hero artwork, animation, gameplay state, physics, input, or card indicator changes.
- No new rendering library, UI framework, external asset, or post-processing dependency.

## Decisions

- Use a second plane with a small custom shader that samples the existing hero texture and nearby alpha values. The shader outputs the side color only where the current pixel is transparent but neighboring samples contain visible art, producing a true alpha-aware outer outline.
- Keep the original hero plane as the foreground layer and render the outline plane immediately behind it. This preserves the artwork's colors and avoids tinting the opaque center.
- Pass the side color from battle-unit construction; heroes created for selection cards omit the indicator.
- Prefer a shared shader material configuration or lightweight per-hero material instances as needed to provide each hero's color while keeping disposal explicit. The outline texture remains the hero's existing texture and must not be disposed twice.
- Avoid a Babylon glow/blur layer because it creates a soft bloom rather than a controllable silhouette edge and can add scene-wide rendering cost.

## Risks / Trade-offs

- [Texture edge quality] Very small heroes may show a one-pixel or slightly uneven edge -> use a configurable UV offset/thickness and verify at the existing portrait frame size.
- [Shader compatibility] Older mobile browsers may have varying shader precision -> use straightforward fragment operations supported by the existing Babylon.js WebGL path and verify in a real browser.
- [Resource ownership] Per-hero outline materials increase scene resources -> dispose the outline material with its hero and keep the shared source texture owned by the hero.

