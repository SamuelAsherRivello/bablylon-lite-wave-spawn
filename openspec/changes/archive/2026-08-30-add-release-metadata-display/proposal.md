## Why

Players cannot currently tell which published build they are running or how large that browser build is. The game should expose the same release metadata convention as the inspiration project so local builds remain informative and every newly published live build identifies both its release tag and total browser download size.

## What Changes

- Add runtime release metadata containing an exact release version and an optional total browser download size.
- Populate the release version from the GitHub Release tag and calculate the size from all files in the completed production build during publishing.
- Load and validate the metadata at startup without using a cached response, while falling back safely when it is unavailable or malformed.
- Render the version and, when known, the formatted size as one noninteractive line in the upper-left of the centered game frame.
- Preserve the text's frame-relative position, typography, spacing, and effects on desktop and portrait mobile browsers without adding a dependency.

## Capabilities

### New Capabilities

- `release-metadata-display`: Defines release metadata storage, release-time population, runtime loading and fallback behavior, conditional size formatting, and the proportional upper-left display.

### Modified Capabilities

None.

## Impact

- Affects the checked-in public runtime metadata, startup modules, DOM game UI, frame-relative CSS, automated tests, release publishing workflow, and concise release documentation.
- Extends the existing release-triggered GitHub Pages build without replacing its versioned release directories, stable entry points, or immutable release asset behavior.
- Adds no runtime or development dependency and does not change gameplay, touch input, or Babylon.js resource ownership.
