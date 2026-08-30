## ADDED Requirements

### Requirement: Pause wave and result transitions
Opening Settings during a wave introduction, mandatory gameplay prompt,
between-wave transition, or restartable terminal result SHALL preserve that
exact state and prevent scheduled game-time work from advancing until Settings
closes.

#### Scenario: Pause a wave introduction
- **WHEN** Settings opens during a wave-label fade or hold
- **THEN** its remaining phase time stops advancing
- **AND** closing Settings resumes the same animation phase with its remaining time

#### Scenario: Settings overlays a mandatory prompt
- **WHEN** Settings opens while the main-menu, Wave Complete, or Game Over prompt
  is active
- **THEN** the gameplay prompt and its underlying state remain unchanged
- **AND** closing Settings reveals the same prompt without triggering its action

#### Scenario: Pause between-wave setup
- **WHEN** Settings opens while survivors are being consolidated or a formation
  is being added and re-spaced
- **THEN** hero movement, spawning, positioning, and delays stop advancing
- **AND** closing Settings resumes the interrupted transition exactly once
