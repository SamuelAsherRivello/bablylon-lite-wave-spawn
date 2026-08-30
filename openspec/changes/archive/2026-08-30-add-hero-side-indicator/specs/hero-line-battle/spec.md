## MODIFIED Requirements

### Requirement: Player and enemy line formations

The player SHALL control heroes on lines 4, 5, and 6, and the enemy SHALL control heroes on lines 1, 2, and 3. Player line counts SHALL be 1, 3, and 5 from lines 4 through 6; enemy line counts SHALL be 5, 3, and 1 from lines 1 through 3. Battle heroes SHALL visibly identify their side with a blue alpha-aware outline for player heroes and a red alpha-aware outline for enemy heroes.

#### Scenario: Formations become ready
- **WHEN** all three player hero choices are complete
- **THEN** player heroes occupy lines 4, 5, and 6 with counts 1, 3, and 5
- **AND** after player line 6 is placed, one unused enemy type is randomly assigned to line 1 with 5 heroes
- **AND** after player line 5 is placed, one unused enemy type is randomly assigned to line 2 with 3 heroes
- **AND** after player line 4 is placed, the final unused enemy type is randomly assigned to line 3 with 1 hero
- **AND** the game enters FormationReady
- **AND** player heroes show blue outlines while enemy heroes show red outlines
