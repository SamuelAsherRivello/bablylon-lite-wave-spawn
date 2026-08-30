## Why

Hero damage currently communicates only through the existing artwork animation. A small, reusable Babylon.js particle effect will make impacts readable while establishing a lightweight visual-effects boundary that can support later combat feedback without adding a framework or renderer.

## What Changes

- Add a Babylon Lite-compliant, hero-owned particle effect service for short-lived 2D cloud particles.
- Add a cloud PNG asset and spawn a small randomized burst over the hero artwork when the hero takes damage.
- Give each particle a randomized small size and position within the hero artwork, then animate opacity from 0 to 100% and back to 0 before disposal.
- Keep particle counts, sizes, lifetime, placement, and texture path in readable configuration.
- Ensure effects are cleaned up when their particles finish or the hero is disposed, including during the existing death/disposal lifecycle.
- Verify the effect in desktop and portrait mobile browsers inside the existing 9:16 frame; no touch interaction or resize-specific behavior changes are expected.

## Capabilities

### New Capabilities

- `babylon-lite-particle-effects`: Defines the reusable particle effect contract and the hero damage cloud burst.

### Modified Capabilities

- None.

## Impact

- Affected areas include hero visual ownership, collision damage handling, Babylon scene observers/resources, and static art assets.
- The implementation will use Babylon.js APIs and dependencies already declared in `package.json`; no new dependency is proposed.
- The effect must remain compatible with Babylon Lite constraints by using lightweight core scene primitives and explicit disposal rather than a heavier particle framework.
