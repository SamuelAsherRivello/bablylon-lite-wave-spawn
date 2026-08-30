## Purpose

Expose trustworthy release identity and browser-build size metadata to players while remaining informative and unobtrusive when release-time size data is unavailable.

## ADDED Requirements

### Requirement: Runtime release metadata has a stable public contract
The game SHALL load runtime metadata from `environment.json` relative to the deployed application base URL without using a cached response. The metadata SHALL accept an exact three-component release tag in the form `v<major>.<minor>.<patch>` and an optional non-negative total-build byte count.

#### Scenario: Valid metadata loads from a versioned deployment
- **WHEN** the game starts under a root, latest, or versioned deployment path and the corresponding environment file contains valid release metadata
- **THEN** the game uses the stored release tag and byte count
- **AND** the environment request bypasses the browser cache

#### Scenario: Uppercase version prefix is normalized
- **WHEN** the stored release version has a valid uppercase `V` prefix
- **THEN** the resolved release version uses a lowercase `v` prefix

#### Scenario: Metadata is unavailable or malformed
- **WHEN** the environment request fails, returns an unsuccessful response, or returns malformed metadata
- **THEN** the game resolves the release version to `v0.0.0`
- **AND** the download size is treated as unknown
- **AND** game startup continues

### Requirement: Published builds contain exact release metadata
The release publishing process SHALL write the exact three-component GitHub Release tag into the browser build and SHALL record the sum of the byte sizes of all files in the completed production output as its download size.

#### Scenario: A valid GitHub Release is published
- **WHEN** a release tagged in the form `v<major>.<minor>.<patch>` triggers the publishing workflow
- **THEN** the deployed environment file contains that exact tag
- **AND** it contains the total byte size of every file in the deployed production build
- **AND** the packaged release asset and versioned GitHub Pages build contain the populated environment file

#### Scenario: The release tag is unsupported
- **WHEN** publishing receives a tag that is not an exact three-component release tag
- **THEN** the publishing workflow fails before deploying the build

#### Scenario: The build size cannot be recorded safely
- **WHEN** the total production output size is not a non-negative integer that fits the reserved metadata field
- **THEN** the publishing workflow fails instead of deploying incomplete or misleading size metadata

### Requirement: The game displays version and optional size in one line
The game SHALL render the resolved release version as one noninteractive line in the upper-left of the game frame. When a valid download size is known, the line SHALL append the size in decimal megabytes with one fractional digit and the `Mb` suffix; when the size is unknown, the line SHALL contain only the version.

#### Scenario: Version and size are known
- **WHEN** runtime metadata resolves to version `v0.1.5` and download size `12300000` bytes
- **THEN** the upper-left line reads `v0.1.5 12.3Mb`

#### Scenario: Download size is unknown
- **WHEN** the runtime release version resolves but the download size is absent, invalid, negative, or otherwise unavailable
- **THEN** the upper-left line displays the version
- **AND** it does not render a size value or an empty size placeholder

#### Scenario: A player interacts with the game beneath the metadata
- **WHEN** the player uses mouse, keyboard, or touch input near the displayed metadata
- **THEN** the metadata does not receive pointer input or obstruct game interaction

### Requirement: Release metadata preserves the portrait composition
The release metadata line SHALL use the centered 9:16 game frame as its size and position reference and SHALL retain the inspiration layout's proportional upper-left inset, typography, spacing, and effects as the frame resizes.

#### Scenario: Large desktop viewport
- **WHEN** the game is viewed in a large desktop browser
- **THEN** the metadata remains one line in the upper-left of the centered game frame
- **AND** its position and visual size remain proportional to the game-frame width
- **AND** the frame remains centered at exactly 9:16

#### Scenario: Narrow portrait viewport
- **WHEN** the same browser session is resized to a narrow portrait viewport
- **THEN** the metadata scales uniformly with the game frame without reflow, clipping, or overlap
- **AND** it retains the same normalized upper-left position

#### Scenario: Tall mobile viewport limited by width
- **WHEN** the game is viewed in a tall mobile viewport where width limits the frame
- **THEN** the metadata remains readable, on one line, and proportionally positioned
- **AND** no reload is required after a viewport or orientation change
