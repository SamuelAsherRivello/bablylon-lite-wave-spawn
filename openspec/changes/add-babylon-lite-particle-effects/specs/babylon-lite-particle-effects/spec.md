## Purpose

Provide a lightweight, reusable visual-effects capability that makes hero combat impacts legible while remaining suitable for Babylon Lite and constrained portrait gameplay.

## ADDED Requirements

### Requirement: Hero damage cloud burst

When a live hero takes non-lethal damage, the game SHALL spawn a short burst of multiple cloud PNG particles over the hero artwork. Each particle SHALL use a small randomized size, approximately 5 CSS pixels in the authored visual scale or a nearby configured size, and a randomized position within the hero artwork bounds.

#### Scenario: Hero takes damage
- **WHEN** collision damage reduces a hero's health but leaves it above zero
- **THEN** a visible cloud burst starts on that hero
- **AND** the burst contains more than one cloud particle
- **AND** particles appear at different positions and may use different configured sizes

### Requirement: Cloud opacity animation

Each damage cloud particle SHALL animate from zero opacity to full opacity and then back to zero opacity over a finite configured lifetime. Completed particles SHALL no longer be visible or remain active in the scene.

#### Scenario: Cloud particle completes
- **WHEN** a spawned cloud particle reaches the end of its lifetime
- **THEN** its opacity has returned to zero
- **AND** its Babylon render resources are disposed or returned to an explicitly bounded reusable pool

### Requirement: Babylon Lite and lifecycle compliance

The effect SHALL use only the project's approved Babylon.js core APIs and existing dependencies. It SHALL not require touch input, screen-space coordinates, or a new renderer, and it SHALL clean up active particles when the owning hero is disposed.

#### Scenario: Hero is disposed during an effect
- **WHEN** a hero is disposed while damage clouds are active
- **THEN** all particles owned by that hero are removed and their resources are released
- **AND** no render observer or particle update continues referencing the disposed hero

#### Scenario: Portrait resize during an effect
- **WHEN** the viewport changes size while a cloud burst is playing
- **THEN** the burst remains attached to the hero in scene space
- **AND** the existing centered 9:16 frame and touch behavior remain unchanged
