## ADDED Requirements

### Requirement: Skip Start Menu control
The Settings Menu SHALL show a checkbox labeled `Skip Start Menu`. The checkbox
SHALL default to off, reflect its persisted value, and update that value
immediately when changed without altering the currently visible gameplay state.

#### Scenario: Enable start-menu skipping
- **WHEN** the player enables Skip Start Menu
- **THEN** the setting is persisted immediately
- **AND** the current menu, wave, battle, or result state does not advance
- **AND** the next fresh load or Restart Game begins at the Wave 1 introduction

#### Scenario: Disable start-menu skipping
- **WHEN** the player disables Skip Start Menu
- **THEN** the setting is persisted immediately
- **AND** the next fresh load or Restart Game displays the Never Spawn main menu

#### Scenario: Control scales with the game frame
- **WHEN** Settings is viewed in a large desktop, narrow portrait, or tall
  width-limited mobile viewport
- **THEN** the label and touch-compatible checkbox retain their authored size,
  spacing, and position relative to the centered 9:16 game frame
