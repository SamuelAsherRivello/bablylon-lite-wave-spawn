## ADDED Requirements

### Requirement: Persist Skip Start Menu
The settings store SHALL persist Skip Start Menu as a boolean value. Missing,
invalid, or reset data SHALL resolve to off.

#### Scenario: Restore enabled setting
- **WHEN** Skip Start Menu was enabled and the application reloads
- **THEN** the setting resolves to on
- **AND** startup bypasses creation of the main-menu window

#### Scenario: Default missing or invalid setting
- **WHEN** no valid persisted Skip Start Menu boolean exists
- **THEN** the setting resolves to off
- **AND** normal startup displays the main-menu window

#### Scenario: Reset settings
- **WHEN** the player activates Reset in Settings
- **THEN** Skip Start Menu immediately returns to off
- **AND** the Settings window remains open
