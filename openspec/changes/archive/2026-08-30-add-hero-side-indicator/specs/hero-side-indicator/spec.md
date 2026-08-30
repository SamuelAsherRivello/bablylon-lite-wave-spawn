## Purpose

Provide a temporary, readable ownership cue that follows each battle hero’s actual transparent artwork without adding a separate oval or external badge.

## ADDED Requirements

### Requirement: Alpha-aware side outline

Battle heroes SHALL display a colored outline derived from the visible artwork silhouette. Player heroes SHALL use blue and enemy heroes SHALL use red.

#### Scenario: Player hero outline
- **WHEN** a player hero is rendered in battle
- **THEN** a blue outline follows the opaque edge of that hero’s artwork
- **AND** transparent areas inside and outside the artwork remain transparent

#### Scenario: Enemy hero outline
- **WHEN** an enemy hero is rendered in battle
- **THEN** a red outline follows the opaque edge of that hero’s artwork
- **AND** no oval halo is displayed

### Requirement: Indicator remains visual-only

The side outline SHALL not change hero dimensions, movement, physics, collision behavior, selection behavior, or touch interaction.

#### Scenario: Hero interaction is unchanged
- **WHEN** a user views or plays the battle on desktop or a portrait touch browser
- **THEN** heroes retain their existing size, movement, collision, and input behavior
- **AND** the outline remains within the hero’s visual area apart from its configured narrow edge thickness
