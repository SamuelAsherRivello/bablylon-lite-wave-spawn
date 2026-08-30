# game-settings-menu Specification

## Purpose

Provides an always-available post-loading settings surface for controlling music and sound-effect volume throughout the game session.

## Requirements

### Requirement: Settings gear availability and placement
After the loader is complete, the game SHALL show a settings gear in the upper-right of the game frame during every state, including hero selection, formation, active battle, and the winner screen. The gear SHALL preserve the proportions of a 64 by 64 control positioned 70 design units from the top and right edges of an 800-unit-wide composition.

#### Scenario: Loader owns the screen
- **WHEN** startup loading is still visible
- **THEN** the loader covers the game interface
- **AND** the settings gear is not available for interaction

#### Scenario: Settings are available after loading
- **WHEN** loading completes in any game state
- **THEN** the settings gear is visible and operable by mouse or touch

#### Scenario: Gear scales with the frame
- **WHEN** the same game is viewed in a large desktop, narrow portrait, or tall width-limited mobile viewport
- **THEN** the gear retains its authored size and offsets relative to the centered 9:16 game frame
- **AND** it does not reflow, overlap, or drift because of viewport-relative or fixed-pixel sizing

### Requirement: Settings Menu controls
Activating the gear SHALL open a window titled `Settings Menu` containing a Music slider and an SFX slider. Each slider SHALL accept values from 0 through 100, SHALL show a static `0` label at its left endpoint and `100` at its right endpoint, and SHALL not require a changing numeric-value readout.

#### Scenario: Settings open with persisted values
- **WHEN** the player opens the Settings Menu
- **THEN** both sliders reflect their current persisted settings
- **AND** each setting defaults to 100 when no valid saved value exists

#### Scenario: Slider changes immediately
- **WHEN** the player drags either slider
- **THEN** the corresponding in-memory setting changes during the drag
- **AND** the new value is persisted immediately

#### Scenario: Mute a category
- **WHEN** the player moves Music or SFX to 0
- **THEN** new audio in that category uses zero output volume

### Requirement: Reset settings control
The Settings Menu SHALL show a `Reset` button below the Music, SFX, and Collider controls. Activating Reset SHALL immediately return both sliders and their active settings to the default value of 100, return Collider to off, and keep the Settings Menu open.

#### Scenario: Reset changed audio settings
- **WHEN** one or both audio sliders are below 100 and the player activates Reset
- **THEN** both sliders immediately show 100
- **AND** both active audio settings immediately resolve to 100
- **AND** the Settings Menu remains open

#### Scenario: Reset already-default settings
- **WHEN** both audio settings are already 100 and the player activates Reset
- **THEN** both sliders remain at 100
- **AND** the Settings Menu remains usable

### Requirement: Collider visibility control
The Settings Menu SHALL show a checkbox labeled `Collider?`. The checkbox SHALL default to off, SHALL persist its current value immediately, and SHALL show every active physics collider while on, including colliders created after it is enabled.

#### Scenario: Enable collider visibility
- **WHEN** the player enables Collider
- **THEN** every current physics collider is visibly outlined
- **AND** physics colliders created later are also shown
- **AND** the enabled value is restored after a page reload

#### Scenario: Disable collider visibility
- **WHEN** the player disables Collider
- **THEN** all physics-collider debug visuals are hidden
- **AND** gameplay physics behavior is unchanged

#### Scenario: Collider visibility default and reset
- **WHEN** no valid Collider setting exists or the player activates Reset
- **THEN** Collider resolves to off
- **AND** collider debug visuals are hidden

### Requirement: Settings availability after battle
The Settings Menu SHALL remain usable after the winner screen without altering the completed battle state.

#### Scenario: Close settings over winner screen
- **WHEN** the player opens and closes settings after the winner is displayed
- **THEN** the same winner screen remains visible
- **AND** gameplay does not restart or resume
