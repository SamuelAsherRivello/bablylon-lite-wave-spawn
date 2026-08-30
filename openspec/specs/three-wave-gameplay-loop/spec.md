# three-wave-gameplay-loop Specification

## Purpose

Defines one complete three-wave game session from entry through progression,
defeat, final victory, cumulative experience, and a clean restart.

## Requirements

### Requirement: Main menu starts the game
The application SHALL begin with a mandatory window titled `Wave Spawn!`, body
text `Survive three waves of enemies to win`, and one `Play` button when Skip
Start Menu is off. No selection card or battle hero SHALL be visible before Play
is activated.

#### Scenario: Default application start
- **WHEN** the application finishes loading with Skip Start Menu off
- **THEN** the main-menu window is displayed over the field background
- **AND** the window has no X control and cannot be dismissed through its backdrop
- **AND** activating Play closes it and begins the Wave 1 introduction

### Requirement: Timed wave introduction
Each wave SHALL begin with centered text `Wave N`, where N is the current wave
number. The text SHALL fade from opacity 0 to 1 over 250ms, remain fully visible
for 500ms, fade to 0 over 250ms, and then reveal card selection without accepting
interaction during the presentation.

#### Scenario: Wave introduction completes
- **WHEN** a wave begins
- **THEN** only its noninteractive wave label is presented for 1000ms
- **AND** card selection begins after the fade-out completes

#### Scenario: Wave introduction scales with the game frame
- **WHEN** an introduction is viewed or resized in a large desktop, narrow
  portrait, or tall width-limited mobile viewport
- **THEN** its text remains centered and proportionally sized within the 9:16
  game frame without reflow, overlap, or viewport-dependent drift

### Requirement: Three-wave session progression
A game session SHALL contain exactly three waves. Winning wave 1 or wave 2 SHALL
show a mandatory `Wave Complete` window with body text `You killed all enemies.
Congratulations!` and one `Next Wave` button. Activating Next Wave SHALL begin
the next wave introduction.

#### Scenario: Complete an intermediate wave
- **WHEN** the final enemy in wave 1 or wave 2 is defeated
- **THEN** the stopped battle remains visible beneath the Wave Complete window
- **AND** no battle state advances until Next Wave is activated
- **AND** Next Wave begins the following numbered introduction

### Requirement: Every wave uses a distinct randomized arena
At creation of each game session, the application SHALL randomize all three
existing arenas into a session-owned order. Wave 1, Wave 2, and Wave 3 SHALL use
the first, second, and third arena in that order respectively, so no arena
repeats within the same game session. The wave's arena background and friction
SHALL be active before its `Wave N` introduction begins.

#### Scenario: Advance through one session
- **WHEN** the player reaches all three waves in one game session
- **THEN** each wave uses a different existing arena
- **AND** all three existing arenas have been used exactly once

#### Scenario: Use an arena query override
- **WHEN** the application starts with a valid `arena` query parameter
- **THEN** that arena is the Wave 1 arena
- **AND** Wave 2 and Wave 3 use the other two arenas in randomized order

### Requirement: Defeat ends the run
Losing any wave SHALL end the complete game session and show a mandatory
`Game Over` window with body text `Your army was defeated. Try again!` and one
`Restart Game` button.

#### Scenario: Player army is defeated
- **WHEN** the final player hero in any wave is defeated
- **THEN** no later wave is entered
- **AND** the Game Over window cannot be dismissed except by Restart Game

### Requirement: Third-wave victory completes the game
Winning wave 3 SHALL end the complete game session and show a mandatory
`Game Over` window with body text `Congratulations, you beat all three waves.`
and one `Restart Game` button.

#### Scenario: Player wins wave three
- **WHEN** the final enemy in wave 3 is defeated
- **THEN** the completed battle remains stopped beneath the Game Over window
- **AND** no fourth wave is created

### Requirement: Restart creates a fresh game session
Activating Restart Game SHALL dispose of the completed session, reset wave
progress and all hero XP to zero, create a new randomized nonrepeating arena
order, and start the application flow exactly as a fresh load would under the
current Skip Start Menu setting.

#### Scenario: Restart with start menu enabled
- **WHEN** Restart Game is activated while Skip Start Menu is off
- **THEN** all prior units and run state are removed
- **AND** the Wave Spawn! main-menu window is displayed

#### Scenario: Restart with start menu skipped
- **WHEN** Restart Game is activated while Skip Start Menu is on
- **THEN** all prior units and run state are removed
- **AND** the Wave 1 introduction begins without creating the main-menu window

#### Scenario: Restart randomizes arenas for a new session
- **WHEN** Restart Game creates the replacement game session
- **THEN** the prior session's used-arena tracking is discarded
- **AND** the replacement session owns a freshly randomized three-arena order

### Requirement: Hero experience accumulates within a run
Selecting a hero card SHALL immediately add one XP to that hero type for the
current game session. Selection cards SHALL display cumulative XP with three
digits, beginning at `XP:000` and reaching `XP:003` for every type after all
three waves are drafted.

#### Scenario: Complete one wave draft
- **WHEN** the player has selected all three distinct hero types during wave 1
- **THEN** each hero type has one XP

#### Scenario: View XP in a later wave
- **WHEN** a hero card appears after that hero type was selected in earlier waves
- **THEN** the card displays the type's current cumulative XP
- **AND** selecting it increments that XP before battle begins

#### Scenario: XP is run-scoped
- **WHEN** the player advances between waves
- **THEN** accumulated XP is preserved
- **AND** when Restart Game creates a new session every hero type returns to zero XP
