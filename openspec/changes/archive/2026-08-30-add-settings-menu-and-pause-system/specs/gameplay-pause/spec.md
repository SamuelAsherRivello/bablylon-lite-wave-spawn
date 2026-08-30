## Purpose

Defines one complete pause contract that freezes all mutable game-time behavior and resumes the interrupted phase without hidden progress.

## ADDED Requirements

### Requirement: Pause resumable gameplay phases
Opening the Settings Menu during hero selection, formation, or active battle SHALL freeze the complete game state until the menu closes.

#### Scenario: Pause during hero selection
- **WHEN** settings opens while cards are displayed
- **THEN** card input, formation spawning, phase delays, and scene animations stop progressing
- **AND** closing settings resumes from the same selection state and remaining delays

#### Scenario: Pause during active battle
- **WHEN** settings opens during battle
- **THEN** heroes, physics, collisions, target and attack cooldowns, projectiles, damage effects, death effects, and battle-result progression stop
- **AND** no hidden game-time progress occurs while the modal is open

#### Scenario: Resume active battle
- **WHEN** settings closes after pausing a battle
- **THEN** the interrupted state resumes from the same positions, velocities, cooldowns, projectile progress, effect progress, and remaining delays

### Requirement: Preserve rendering while paused
The game SHALL continue rendering the frozen scene beneath the modal while preventing game-time systems from advancing.

#### Scenario: Modal remains visible over frozen scene
- **WHEN** gameplay is paused by settings
- **THEN** the current scene and settings interface remain rendered
- **AND** the game does not replace the scene with a blank or stopped display

### Requirement: Do not pause terminal state
Opening settings after battle completion SHALL not attempt to pause or resume the stopped battle.

#### Scenario: Settings over completed battle
- **WHEN** the winner screen is already visible
- **THEN** settings can open and close normally
- **AND** the completed battle remains terminal
