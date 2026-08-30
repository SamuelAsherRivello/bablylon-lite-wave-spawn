# hero-depth-ordering Specification

## Purpose

Ensure overlapping battle heroes render in a consistent floor-relative order using the pivot where each hero visually meets the arena.

## Requirements

### Requirement: Shadow center defines the hero sorting pivot
Each battle hero SHALL use its existing hero pivot at the center of its shadow as the authoritative point for depth sorting. The system SHALL NOT use the artwork's visual center or its transparent image bounds to determine hero depth order.

#### Scenario: Heroes have differently shaped artwork
- **WHEN** two hero artworks have different heights, silhouettes, or transparent bounds
- **THEN** each hero's depth order is calculated from the y-coordinate of its shadow-centered pivot
- **AND** artwork dimensions do not independently alter that order

### Requirement: Lower pivot renders in front
The system SHALL sort heroes by the y-coordinate of their shadow-centered pivots. A hero with a lower pivot y SHALL receive a higher hero z-sort value and SHALL render in front of a hero with a higher pivot y.

#### Scenario: Two heroes overlap at different pivot heights
- **WHEN** two heroes overlap and one hero's shadow-centered pivot y is lower than the other's
- **THEN** the lower-pivot hero renders in front of the higher-pivot hero
- **AND** their artwork does not exhibit the reversed overlap shown by center-based sorting

#### Scenario: Heroes change vertical order while moving
- **WHEN** moving heroes pass one another and their shadow-centered pivot y ordering changes
- **THEN** their z/depth order updates to match the current pivot ordering
- **AND** the hero with the currently lower pivot renders in front

### Requirement: Pivot sorting preserves the game presentation
Pivot-based hero sorting SHALL preserve hero movement, collisions, shadows, animation, and the centered 9:16 game-frame composition. The visible ordering SHALL remain equivalent on supported desktop and portrait mobile browsers and after viewport resizing.

#### Scenario: Battle is viewed at supported frame sizes
- **WHEN** overlapping moving heroes are viewed at a large desktop viewport, a narrow portrait viewport, and a tall mobile viewport where width limits the frame
- **THEN** shadow-centered pivot ordering remains correct at each viewport
- **AND** the game frame remains centered and exactly 9:16 without overlap errors caused by reflow or non-uniform scaling
