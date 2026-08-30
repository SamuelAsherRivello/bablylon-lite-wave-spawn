## Purpose

Defines a reusable modal game window that can host settings now and other game-interface content in future changes.

## ADDED Requirements

### Requirement: Reusable modal window structure
The game SHALL provide a reusable modal window with a caller-supplied title and body content, a close control in the window's upper-right, and a backdrop covering the complete game frame.

#### Scenario: Settings use the reusable window
- **WHEN** the Settings Menu is opened
- **THEN** its title and audio controls are presented through the reusable modal window
- **AND** the window structure does not depend on settings-specific content

### Requirement: Modal presentation
An open game window SHALL be centered horizontally and vertically over the game frame and SHALL darken the entire underlying game frame with 50% black.

#### Scenario: Window opens over gameplay
- **WHEN** a game window opens during hero selection, formation, or battle
- **THEN** the full frame beneath it is visibly darkened
- **AND** the window remains centered above the backdrop

#### Scenario: Window scales with the frame
- **WHEN** the browser is resized within the same live session
- **THEN** the backdrop continues to cover the full centered 9:16 frame
- **AND** the window, controls, typography, spacing, borders, and effects retain their authored relative proportions and positions

### Requirement: Modal dismissal
An open game window SHALL close when the player activates its X control, activates the settings gear again, or activates the backdrop outside the window. Interaction inside the window SHALL not dismiss it unless that interaction targets a dismissal control.

#### Scenario: Close through any dismissal surface
- **WHEN** the player clicks or taps the X, the gear, or the backdrop outside the window
- **THEN** the window closes

#### Scenario: Use a control inside the window
- **WHEN** the player clicks, taps, or drags content inside the window
- **THEN** the window remains open

### Requirement: Modal input isolation
While a game window is open, pointer interaction SHALL remain available to the modal, gear, and backdrop, while input to the canvas and all underlying game controls SHALL be blocked.

#### Scenario: Card lies beneath the backdrop
- **WHEN** the player points, clicks, taps, drags, or presses a key while settings covers hero selection
- **THEN** modal pointer controls remain usable
- **AND** no underlying hero card, canvas gesture, or gameplay command is accepted

### Requirement: Accessible dialog semantics
The reusable window SHALL expose modal dialog semantics, an accessible title, and an accessible name for its close control.

#### Scenario: Assistive technology encounters the window
- **WHEN** the window opens
- **THEN** it is identified as a modal dialog associated with its visible title
- **AND** its close control has an accessible name
