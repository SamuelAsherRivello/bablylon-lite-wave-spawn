## MODIFIED Requirements

### Requirement: Timed wave introduction
Each wave SHALL begin with centered text `Wave N`, where N is the current wave number. The text SHALL fade from opacity 0 to 1 over 250ms, remain fully visible for 500ms, fade to 0 over 250ms, and then reveal the Choice Menu without accepting interaction during the presentation.

#### Scenario: Wave introduction completes
- **WHEN** a wave begins
- **THEN** only its noninteractive wave label is presented for 1000ms
- **AND** the Choice Menu begins with its first hero choice after the fade-out completes

#### Scenario: Wave introduction scales with the game frame
- **WHEN** an introduction is viewed or resized in a large desktop, narrow portrait, or tall width-limited mobile viewport
- **THEN** its text remains centered and proportionally sized within the 9:16 game frame without reflow, overlap, or viewport-dependent drift

### Requirement: Restart creates a fresh game session
Activating Restart Game SHALL dispose of the completed session, reset wave progress, all hero XP, all powerup XP, active powerup effects, and prior powerup offers, create a new randomized nonrepeating arena order, and start the application flow exactly as a fresh load would under the current Skip Start Menu setting.

#### Scenario: Restart with start menu enabled
- **WHEN** Restart Game is activated while Skip Start Menu is off
- **THEN** all prior units, powerup activation visuals, and run state are removed
- **AND** the Wave Spawn! main-menu window is displayed

#### Scenario: Restart with start menu skipped
- **WHEN** Restart Game is activated while Skip Start Menu is on
- **THEN** all prior units, powerup activation visuals, and run state are removed
- **AND** the Wave 1 introduction begins without creating the main-menu window

#### Scenario: Restart randomizes arenas for a new session
- **WHEN** Restart Game creates the replacement game session
- **THEN** the prior session's used-arena tracking is discarded
- **AND** the replacement session owns a freshly randomized three-arena order

#### Scenario: Restart resets powerups
- **WHEN** the replacement session reaches its first powerup offer
- **THEN** every powerup displays `XP:000`
- **AND** no selected powerup or offer from the prior session remains active

### Requirement: Wave completion clears temporary powerup modifiers
When a battle ends, every temporary Shield, War Banner, Winged Boots, and Battle Cry modifier applied for that wave SHALL be removed before survivors are prepared for another wave. One-time Healing Heart health changes SHALL remain part of the resulting health state.

#### Scenario: Survivors advance after a modified battle
- **WHEN** a wave ends with surviving units that received temporary stat modifiers
- **THEN** those modifiers are removed before the next Choice Menu
- **AND** surviving units retain battle damage and one-time healing or damage outcomes
