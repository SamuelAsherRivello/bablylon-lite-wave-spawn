## Purpose

Define the per-wave Choice Menu powerup draft, ten paired row effects, temporary battle modifiers, and scalable activation feedback.

## ADDED Requirements

### Requirement: Every wave offers one of three powerup variants
After the three hero choices finish, the Choice Menu SHALL display the exact text `Choose Powerup` above three distinct cards sampled without replacement from ten variants. The player SHALL select exactly one before the wave starts.

#### Scenario: Powerup offer follows the 3-2-1 hero draft
- **WHEN** the third hero formation finishes spawning and its existing pause completes
- **THEN** `Choose Powerup` appears above three distinct powerup cards
- **AND** no battle movement begins while the offer awaits input

#### Scenario: Opposite variants may appear together
- **WHEN** an offer is sampled
- **THEN** blue `+` and red `−` variants of the same base power remain independently eligible
- **AND** an offer may contain both variants

#### Scenario: One powerup starts the wave
- **WHEN** the player activates one offered card
- **THEN** the offer is removed and the effect applies exactly once to one eligible row
- **AND** no second card can activate
- **AND** the wave starts only after activation completes

### Requirement: Catalog contains five paired row powers
The catalog SHALL contain the following ten variants. Blue `+` SHALL target one randomly selected occupied player row. Red `−` SHALL target one randomly selected occupied enemy row.

| Base power | Blue `+` effect | Red `−` effect |
| --- | --- | --- |
| Shield | Add 20 current and maximum health for this wave | Remove 20 current and maximum health for this wave |
| Healing Heart | Restore 20 current health once, capped at maximum | Remove 20 current health once |
| War Banner | Add 5 damage for this wave | Remove 5 damage for this wave |
| Winged Boots | Add 5 speed for this wave | Remove 5 speed for this wave |
| Battle Cry | Add 2 damage for this wave | Remove 2 damage for this wave |

Damage and speed SHALL not fall below zero. Maximum health SHALL not fall below one. A current-health reduction MAY defeat a unit when health reaches zero.

#### Scenario: Blue variant targets the player
- **WHEN** a blue `+` card activates
- **THEN** exactly one occupied player row is selected randomly
- **AND** every living unit on that row receives the stated effect
- **AND** no enemy receives it

#### Scenario: Red variant targets the enemy
- **WHEN** a red `−` card activates
- **THEN** exactly one occupied enemy row is selected randomly
- **AND** every living unit on that row receives the stated effect
- **AND** no player unit receives it

#### Scenario: Temporary modifiers expire
- **WHEN** the battle ends
- **THEN** Shield, War Banner, Winged Boots, and Battle Cry modifiers from that wave are removed from surviving units
- **AND** Healing Heart's one-time current-health change is not reversed

### Requirement: Cards communicate polarity and XP
Each card SHALL share the hero-card composition with centered artwork and title, effect stat, and XP at the bottom. A blue `+` badge SHALL identify a positive player-row card and a red `−` badge SHALL identify a negative enemy-row card. Each of the ten variants SHALL have independent run-scoped XP.

#### Scenario: Positive Shield card is new
- **WHEN** blue Shield appears before being selected in the run
- **THEN** it shows Shield artwork, title `Shield`, a blue `+`, heart `+20`, and `XP:000`

#### Scenario: Negative speed card is offered
- **WHEN** red Winged Boots appears
- **THEN** it shows a red `−`, speed `−5`, and that negative variant's XP

#### Scenario: Variant XP increments
- **WHEN** a variant is selected
- **THEN** only that exact color/polarity variant's XP increases by one
- **AND** later cards display it padded to three digits

#### Scenario: Cards are accessible
- **WHEN** the offer is visible on desktop or touch browsers
- **THEN** every native button has an accessible name including power, polarity, target side, and amount
- **AND** it supports keyboard, pointer, and touch without requiring hover

### Requirement: Shield activation gives per-unit feedback
Shield SHALL create one frame-relative shield icon for every affected unit. Blue Shield icons SHALL be green and red Shield icons SHALL be red. Each icon SHALL fade in, rise, fade out, pause with gameplay, and be disposed before battle starts.

#### Scenario: Shield animation completes
- **WHEN** either Shield variant activates
- **THEN** one correctly colored icon appears over every affected unit and no unaffected unit
- **AND** all icons finish and are removed before movement begins

#### Scenario: Activation pauses and disposes safely
- **WHEN** Settings pauses an active Shield animation or the session is disposed
- **THEN** paused icons stop progressing and resume from the same state
- **AND** disposal removes every icon and owned update registration

### Requirement: Choice Menu visuals scale with the game frame
The heading, cards, badges, artwork, text, spacing, borders, shadows, and activation icons SHALL preserve their relative composition from the centered 9:16 frame. Shield icons SHALL use `8cqw`, approximately 32 pixels at a 400-pixel-wide frame.

#### Scenario: Offer and effect resize proportionally
- **WHEN** the Choice Menu and Shield effect are live-resized through large desktop, narrow portrait, and tall width-limited mobile viewports
- **THEN** the frame remains centered and exactly 9:16
- **AND** `Choose Powerup`, all cards, contents, and icons retain their relative positions without overlap or reflow
