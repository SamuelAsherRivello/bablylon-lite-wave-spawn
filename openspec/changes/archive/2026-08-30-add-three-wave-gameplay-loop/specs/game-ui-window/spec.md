## MODIFIED Requirements

### Requirement: Reusable modal window structure
The game SHALL provide a reusable modal window with a caller-supplied title and
body content, a caller-selected policy for showing an upper-right X control, and
a backdrop covering the complete game frame.

#### Scenario: Settings use the reusable window
- **WHEN** the Settings Menu is opened
- **THEN** its title and controls are presented through the reusable modal window
- **AND** its X control is visible

#### Scenario: Gameplay prompt omits the X control
- **WHEN** the main-menu, Wave Complete, or Game Over window is displayed
- **THEN** no X control or reserved close-control spacing is visible
- **AND** the window remains an accessible modal dialog associated with its title

### Requirement: Modal dismissal
The reusable window SHALL allow its caller to control whether its X and backdrop
are dismissal surfaces. Settings SHALL close through its X, the settings gear,
or the backdrop; mandatory gameplay prompts SHALL close only through their
explicit action button.

#### Scenario: Close through any dismissal surface
- **WHEN** the player clicks or taps the Settings X, gear, or backdrop outside
  the window
- **THEN** the Settings window closes

#### Scenario: Use a control inside the window
- **WHEN** the player clicks, taps, or drags content inside a Settings or
  mandatory gameplay window
- **THEN** the window remains open unless that interaction activates its
  explicit dismissal or progression control

#### Scenario: Mandatory prompt rejects incidental dismissal
- **WHEN** the player activates the backdrop around a main-menu, Wave Complete,
  or Game Over prompt
- **THEN** that prompt remains open
- **AND** underlying game input remains blocked
