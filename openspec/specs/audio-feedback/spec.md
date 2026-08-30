## Purpose

Provides lightweight, browser-compatible sound feedback with per-effect loudness and natural variation for repeated gameplay events.

## Requirements

### Requirement: Continuous background music

The game SHALL use `invincible` as one looping background-music instance for
the lifetime of the open game, SHALL attempt playback during startup, and SHALL
retry playback on the first player interaction when browser autoplay policy
blocks the startup attempt. The active instance SHALL immediately follow the
persisted Music category volume without pausing for menus or battle states.

#### Scenario: Game remains open

- **WHEN** the game finishes startup and remains open across menus and battles
- **THEN** the `invincible` background track repeats continuously
- **AND** the game does not create a new music instance for each state

#### Scenario: Browser requires a playback gesture

- **WHEN** startup playback is blocked by browser autoplay policy
- **THEN** the first pointer or keyboard interaction retries the same music instance

#### Scenario: Player changes Music volume

- **WHEN** the player changes the Music slider while background music is active
- **THEN** the active background-music volume changes immediately
- **AND** the loop continues without restarting

### Requirement: Configurable sound playback

The audio system SHALL support an individual sound's configured volume and optional random pitch range, SHALL apply the current category volume multiplier when creating playback, and SHALL preserve normal playback for sounds without per-sound options. Changing a category multiplier SHALL affect newly created playback and SHALL not alter audio instances that are already playing.

#### Scenario: Quiet varied sound plays
- **WHEN** a configured sound is played with a volume and pitch range while its category is at 100
- **THEN** playback uses the configured volume and a pitch value selected within the inclusive configured range

#### Scenario: Default sound remains unchanged
- **WHEN** a sound without volume or pitch settings is newly played while its category is at 100
- **THEN** playback uses normal full volume and neutral pitch

#### Scenario: Category multiplier preserves relative loudness
- **WHEN** a sound with configured volume `0.25` is newly played while its category is set to 50
- **THEN** playback volume is `0.125`
- **AND** the sound's other configured behavior is unchanged

#### Scenario: Default sound uses category volume
- **WHEN** a sound without a per-sound volume is newly played while its category is set to 70
- **THEN** playback volume is `0.70`
- **AND** playback uses neutral pitch unless another option configures it

#### Scenario: Category is muted
- **WHEN** a sound is newly played while its category is set to 0
- **THEN** its output volume is zero

#### Scenario: Existing playback is unchanged
- **WHEN** a category slider changes while an audio instance from that category is already playing
- **THEN** that existing instance keeps the volume it had when created
- **AND** later instances use the new multiplier

### Requirement: Projectile launch feedback

The game SHALL play the projectile-launch sound whenever a ranged projectile is spawned, using quiet volume and slight pitch variation.

#### Scenario: Ranged projectile is spawned
- **WHEN** a unit successfully creates a ranged projectile during battle
- **THEN** the projectile-launch sound starts promptly with quiet volume and a slightly varied pitch

#### Scenario: Repeated projectiles overlap
- **WHEN** multiple ranged projectiles spawn before earlier launch sounds finish
- **THEN** each launch produces an audible sound event without requiring earlier playback to finish

#### Scenario: Mobile portrait battle
- **WHEN** a player reaches battle through the existing touch-friendly portrait flow
- **THEN** projectile launch audio does not alter the centered 9:16 layout or resize behavior

### Requirement: Battle result feedback

The game SHALL play the `levelstop` sound once when it presents either a
wave-complete prompt or a game-over prompt.

#### Scenario: Intermediate wave ends

- **WHEN** the game presents the `Wave Complete` prompt
- **THEN** one `levelstop` sound plays as the prompt is shown

#### Scenario: Run ends

- **WHEN** the game presents the `Game Over` prompt after a win or loss
- **THEN** one `levelstop` sound plays as the prompt is shown
