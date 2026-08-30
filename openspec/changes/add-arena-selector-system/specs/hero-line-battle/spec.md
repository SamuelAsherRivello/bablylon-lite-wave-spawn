## MODIFIED Requirements

### Requirement: Opposing movement
Player heroes SHALL move toward opposing heroes from lines 4, 5, and 6. Enemy
heroes SHALL move toward opposing heroes from lines 1, 2, and 3. Each hero
SHALL use the speed in its canonical stats profile, scaled by the battle's
existing movement scale and the selected arena's global friction. Higher
arena friction SHALL slow every hero proportionally without changing the
relative ordering of canonical hero speeds. Movement SHALL begin one second
after the final 500ms formation pause and SHALL remain within the arena's
playable floor.

#### Scenario: Battle movement starts
- **WHEN** one second has elapsed after the final formation pause
- **THEN** the game enters Started
- **AND** each player and enemy hero moves toward a selected opposing hero
- **AND** each hero's effective speed reflects the selected arena's friction
- **AND** arena walls prevent heroes from leaving the playable floor

#### Scenario: Hero speed creates a visible role difference
- **WHEN** a Pawn and either a Rook or Bishop move over the same unobstructed
  surface in the same arena
- **THEN** the Pawn reaches that distance first because its profile speed is 30
  while Rook and Bishop profiles are 20

#### Scenario: Arena friction changes effective movement
- **WHEN** equivalent heroes move unobstructed in two arenas with different
  global friction values
- **THEN** the hero in the higher-friction arena moves more slowly
- **AND** neither hero's canonical stats profile is modified
