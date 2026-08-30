## MODIFIED Requirements

### Requirement: Opposing movement

Player heroes SHALL move toward their remembered opposing targets from lines 4, 5, and 6. Enemy heroes SHALL move toward their remembered opposing targets from lines 1, 2, and 3. Each hero SHALL use the speed in its canonical stats profile, scaled by the battle's existing movement scale, and each hero SHALL have an independent random left-right temporary walk jiggle. Movement SHALL begin one second after the final 500ms formation pause.

#### Scenario: Battle movement starts

- **WHEN** one second has elapsed after the final formation pause
- **THEN** the game enters Started
- **AND** each active hero moves toward its selected opposing target
- **AND** each hero visibly jiggles left and right with its own random motion

#### Scenario: Hero speed creates a visible role difference

- **WHEN** a Pawn and either a Rook or Bishop move toward comparable unobstructed targets
- **THEN** the Pawn reaches the same distance first because its profile speed is 30 while Rook and Bishop profiles are 20
