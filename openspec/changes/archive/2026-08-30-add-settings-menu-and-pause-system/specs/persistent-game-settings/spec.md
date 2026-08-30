## Purpose

Provides validated, namespaced, browser-local persistence for current audio preferences and arbitrary future game settings.

## ADDED Requirements

### Requirement: General persistent settings
The game SHALL store settings as versioned, namespaced key-value data in browser-local storage and SHALL support settings beyond the initial audio values without changing the storage contract.

#### Scenario: Save arbitrary setting data
- **WHEN** a supported setting is written under its namespaced key
- **THEN** the value is available immediately to the running game
- **AND** the value remains available after a page reload in the same browser storage context

#### Scenario: Audio defaults
- **WHEN** no valid saved Music or SFX value exists
- **THEN** each missing value resolves to 100

#### Scenario: Collider visibility default
- **WHEN** no valid Collider visibility value exists
- **THEN** Collider visibility resolves to false

### Requirement: Validated storage recovery
The game SHALL validate stored settings and SHALL recover to the affected setting's default when browser storage is unavailable, malformed, out of range, or otherwise unreadable.

#### Scenario: Corrupt saved payload
- **WHEN** the stored settings payload cannot be parsed or contains an invalid audio volume
- **THEN** startup continues without an uncaught error
- **AND** the affected audio setting resolves to 100

#### Scenario: Storage write fails
- **WHEN** browser-local storage rejects a write
- **THEN** the current in-memory setting remains usable for the session
- **AND** gameplay and the Settings Menu continue functioning

### Requirement: Setting change notification
Consumers SHALL be able to observe setting changes without polling storage.

#### Scenario: Slider changes a setting
- **WHEN** a slider changes Music or SFX
- **THEN** subscribed audio behavior receives the new normalized setting during the same interaction

### Requirement: Reset persisted game settings
The settings system SHALL support resetting all settings owned by this game by removing its namespaced settings document from browser-local storage, restoring in-memory defaults, and notifying affected consumers. Reset SHALL NOT remove unrelated keys from the same browser storage origin.

#### Scenario: Reset stored settings
- **WHEN** the player activates Reset after changing settings
- **THEN** this game's namespaced settings document is removed from browser-local storage
- **AND** Music and SFX resolve to 100 in memory
- **AND** Collider visibility resolves to false in memory
- **AND** subscribers are notified of the restored values

#### Scenario: Preserve unrelated origin storage
- **WHEN** the game resets its settings while another local-storage key exists
- **THEN** the unrelated key remains unchanged

#### Scenario: Reset removal fails
- **WHEN** browser-local storage rejects removal of the settings document
- **THEN** in-memory settings still return to defaults
- **AND** the Settings Menu and gameplay continue without an uncaught error
