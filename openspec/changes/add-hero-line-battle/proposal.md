## Why

The game needs a defined first gameplay loop instead of showing only a static
field. A small state-driven hero draft and line battle will establish the core
interaction, formation rules, and movement behavior for future gameplay.

## What Changes

- Add an app-level `MainMenu` state that draws the field background with no UI.
- Add an app-level `Gameplay` state with nested `Starting`, `HeroSelection`,
  `FormationReady`, and `Started` game states.
- Let the player choose three distinct hero types through sequential card
  choices.
- After each choice, remove the cards, place the selected formation one hero
  at a time every 250ms, then wait 500ms before revealing the next choices.
- Place the selected heroes in player lines 6, 5, and 4 with counts of 5, 3,
  and 1.
- After each player line is placed, randomly choose one unused enemy type and
  place it immediately on the paired enemy line 1, 2, or 3.
- After the third player/enemy pair, wait 500ms, then start movement after a
  one-second delay.
- Animate player heroes upward and enemy heroes downward at 10% of the
  original planned vertical speed, with an independent random temporary
  left-right walk jiggle for every hero.
- Preserve the locked 2D camera, portrait frame, field background, and touch
  interaction model.

## Capabilities

### New Capabilities

- `hero-line-battle`: App and game states, hero drafting, line formations, and
  opposing hero movement.

### Modified Capabilities

None.

## Impact

This affects the browser UI layer, hero sprite presentation, game state
management, and animation timing in the existing Babylon.js/Vite project. It
uses the current JavaScript, Babylon.js core, CSS, and local hero image assets;
no new dependencies are required. Desktop and portrait mobile browsers must
support card selection, touch interaction, responsive layout, and the same
2D animation behavior.
