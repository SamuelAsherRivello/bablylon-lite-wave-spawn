## Purpose

Provide a repeatable public release channel for the browser game so a published GitHub Release produces a validated, directly playable GitHub Pages build.

## ADDED Requirements

### Requirement: Published releases produce a validated Pages deployment
The publishing workflow SHALL run when a GitHub Release is published, build the released source using the repository's existing dependency lockfile, run the existing automated tests, and deploy only after the build and artifact validation succeed.

#### Scenario: Successful release publication
- **WHEN** a valid GitHub Release is published
- **THEN** the workflow checks out that release's source, runs tests and the production build, confirms the generated entry page exists, and deploys the result to GitHub Pages

#### Scenario: Failed validation blocks deployment
- **WHEN** dependency installation, tests, the production build, or required browser-artifact validation fails
- **THEN** the workflow fails before the Pages deployment job runs

### Requirement: The public site exposes stable and versioned URLs
The deployed Pages site SHALL retain each successful release under a versioned path and SHALL provide root and `latest` entry points that redirect or link to the current published release.

#### Scenario: Open the latest demo
- **WHEN** a user opens the repository's documented Live Demo URL or its `latest` path
- **THEN** the browser reaches the most recently published release build

#### Scenario: Open a historical release
- **WHEN** a user opens a versioned release path for a successfully published tag
- **THEN** the browser reaches that release's browser build independently of later releases

### Requirement: Release web assets remain reproducible
The workflow SHALL package the generated browser build as an asset on the corresponding GitHub Release and SHALL not replace an existing asset with the same release-build name.

#### Scenario: First publication of a release build
- **WHEN** the corresponding release does not yet contain the packaged web build
- **THEN** the workflow uploads the generated package to that release

#### Scenario: Re-run an already packaged release
- **WHEN** the workflow is re-run and the corresponding release already contains the packaged web build
- **THEN** the workflow preserves the existing asset and continues without overwriting it

### Requirement: The release workflow is documented for desktop and portrait mobile verification
The repository documentation SHALL identify the public demo URL and SHALL describe the release trigger and post-deployment verification for desktop and portrait mobile browsers.

#### Scenario: Maintainer follows the release instructions
- **WHEN** a maintainer reads the documented release workflow
- **THEN** they can identify the required tag/release action, the workflow to monitor, and the Live Demo URL to verify
