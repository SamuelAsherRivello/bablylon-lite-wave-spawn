## Purpose

Provides lightweight, browser-compatible sound feedback with per-effect loudness and natural variation for repeated gameplay events.

## Requirements

### Requirement: Configurable sound playback

The audio system SHALL support an individual sound's configured volume and optional random pitch range while preserving normal playback for sounds without those options.

#### Scenario: Quiet varied sound plays
- **WHEN** a configured sound is played with a volume and pitch range
- **THEN** playback uses the configured volume and a pitch value selected within the inclusive configured range

#### Scenario: Default sound remains unchanged
- **WHEN** a sound is played without volume or pitch settings
- **THEN** playback uses the normal full-volume, neutral-pitch behavior

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
