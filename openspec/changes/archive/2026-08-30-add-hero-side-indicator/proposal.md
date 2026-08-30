## Why

Temporary hero artwork needs a clear, unobtrusive indication of ownership during battle. The indicator should remain within each hero's artwork footprint, follow the transparent silhouette, and avoid the distracting oval halo and oversized duplicate-sprite treatment.

## What Changes

- Add a blue player-side and red enemy-side outline around battle hero artwork.
- Generate the outline from the hero texture alpha so transparent pixels remain transparent and the outline follows each piece's silhouette.
- Keep hero selection cards and the underlying hero artwork unchanged.
- Make the outline work at the existing portrait frame scale on desktop and touch browsers.

## Capabilities

### New Capabilities

- `hero-side-indicator`: Side-colored, alpha-aware visual indicators for battle heroes.

### Modified Capabilities

- `hero-line-battle`: Battle hero rendering gains a visible player/enemy ownership indicator.

## Impact

- Affected code: Babylon hero rendering and battle-unit construction, plus focused source-level and browser-visible verification.
- No new dependency is required; the implementation uses Babylon.js core already declared in `package.json`.
- The effect is visual-only and does not change movement, physics, collisions, or hero stats.
