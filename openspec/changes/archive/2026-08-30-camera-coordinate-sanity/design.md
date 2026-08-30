## Context

See proposal.md - Why. The current scene uses a FreeCamera looking at the origin in orthographic mode, with symmetric X and Y bounds. Browser verification showed that the positive-Z placement mirrors world X while preserving world Y-up.

## Goals / Non-Goals

**Goals:**

- Preserve the established visual presentation while making scene coordinates conventional.
- Verify the camera projection rather than relying only on visual convention.
- Keep resize, pointer, touch, physics, and depth behavior unchanged.

**Non-Goals:**

- No camera controls, zoom redesign, coordinate-system conversion, or gameplay movement redesign.
- No new dependencies or rendering systems.

## Decisions

- Place the camera at `(0, 0, negative Z)` targeting the origin with the default +Y up vector. In Babylon's current projection this makes +X project screen-right while retaining +Y screen-up. This changes the viewing side, not gameplay coordinates or the global scene handedness.
- Add a focused source-level or unit-level assertion for the camera contract, plus real-browser confirmation using distinct positive-axis markers or existing line positions. This provides both configuration protection and user-visible evidence.
- Preserve the existing orthographic bounds and resize flow. Recomputing or swapping bounds is unnecessary because resizing the canvas does not change the sign of either projected axis.

## Risks / Trade-offs

- [Risk] A future camera rotation or explicit up-vector change could silently mirror the field. → Keep the axis contract test close to the camera setup and include it in the normal test command.
- [Risk] A browser-only visual check could miss a configuration regression. → Pair browser verification with deterministic assertions over camera position, target, up vector, and orthographic bounds.

## Migration Plan

No migration is required. If implementation discovers the current projection differs in the browser, change only the camera orientation needed to satisfy the contract, then rerun the focused tests, production build, and browser smoke check.
