# gameplay-pause Specification

## Purpose

Defines one complete pause contract that freezes all mutable game-time behavior and resumes the interrupted phase without hidden progress.

## Requirements

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

### Requirement: Pause wave and result transitions
Opening Settings during a wave introduction, mandatory gameplay prompt,
between-wave transition, or restartable terminal result SHALL preserve that
exact state and prevent scheduled game-time work from advancing until Settings
closes.

#### Scenario: Pause a wave introduction
- **WHEN** Settings opens during a wave-label fade or hold
- **THEN** its remaining phase time stops advancing
- **AND** closing Settings resumes the same animation phase with its remaining time

#### Scenario: Settings overlays a mandatory prompt
- **WHEN** Settings opens while the main-menu, Wave Complete, or Game Over prompt
  is active
- **THEN** the gameplay prompt and its underlying state remain unchanged
- **AND** closing Settings reveals the same prompt without triggering its action

#### Scenario: Pause between-wave setup
- **WHEN** Settings opens while survivors are being consolidated or a formation
  is being added and re-spaced
- **THEN** hero movement, spawning, positioning, and delays stop advancing
- **AND** closing Settings resumes the interrupted transition exactly once
