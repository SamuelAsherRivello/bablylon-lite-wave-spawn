## Context

See proposal.md for motivation and scope. The current project is a Vite-hosted
Babylon.js 2D scene with a locked orthographic camera, a portrait field image,
and local transparent hero PNGs.

## Goals / Non-Goals

**Goals:**

- Model app state separately from the nested gameplay state.
- Keep hero selection and formations deterministic for the player and random
  for the enemy assignment.
- Use a lightweight 2D physics body independent of the visible hero artwork.
- Support pointer and touch card selection and responsive viewport resizing.

**Non-Goals:**

- Combat resolution, health, damage, scoring, or win/lose states.
- Unique hero behavior beyond the shared initial movement.
- Replacing the existing Babylon.js renderer or adding a physics dependency.

## Decisions

- **State ownership:** Keep `AppState` responsible for MainMenu versus
  Gameplay, and keep `GameState` responsible for Starting, HeroSelection,
  FormationReady, and Started. This avoids mixing page-level navigation with
  battle progression.
- **Hero draft:** Store hero definitions separately from hero instances. A
  draft list removes selected ids, so the three choices cannot repeat.
- **Rendering layer:** Keep the field in the locked Babylon scene and render
  cards and hero artwork as 2D overlay elements positioned in the same 9:16
  frame. This preserves crisp transparent PNG rendering and simple input.
- **Physics representation:** Give each visible hero a dedicated 10x10 body
  anchored to the artwork's bottom center. The body is the only collider used
  by the movement simulation; the image remains visual-only.
- **Movement:** Pair each player selection with the enemy assignment for the
  corresponding opposing line. Place units at 250ms intervals, wait 500ms,
  and after the third pair wait one additional second before movement. Use
  10% of the original vertical speed. Give each unit a randomized jiggle
  amplitude and phase for its temporary walk animation.
- **Touch and resize:** Use native button pointer events for cards and derive
  unit positions from the game frame dimensions so touch input and viewport
  resizing do not require hover or a new dependency.

## Risks / Trade-offs

- [Risk] HTML overlay positions and physics coordinates can drift apart → Keep
  one normalized line-position mapping and update both from the same unit state.
- [Risk] Transparent PNG dimensions differ from visible artwork → Keep the
  collider anchor explicit at bottom center instead of inferring it from alpha.
- [Risk] Many simultaneous DOM animations may vary by browser → Use a single
  animation model and verify in desktop and portrait browser viewports.
