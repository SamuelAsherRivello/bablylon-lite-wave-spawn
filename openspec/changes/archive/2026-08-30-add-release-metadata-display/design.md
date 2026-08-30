## Context

See `proposal.md` for motivation. The game is a root-level Vite application with a release-triggered workflow that packages `dist`, stores an immutable ZIP on each GitHub Release, and assembles versioned GitHub Pages directories. It has no runtime release environment file today. Browser UI already uses a DOM overlay inside the centered 9:16 `.game-frame`, whose composition must use frame-relative units.

The inspiration project stores release metadata in `public/environment.json`, overwrites the release version from the release tag before building, reserves a fixed-width download-size field, replaces that field after measuring the completed output, fetches the deployed file with `cache: "no-store"`, and conditionally appends the formatted size to its upper-left version text. This design carries that complete data path into the current repository while adapting rendering to the existing DOM overlay.

## Goals / Non-Goals

**Goals:**

- Keep checked-in, built, packaged, and deployed release metadata in one JSON contract.
- Make release-time metadata deterministic and keep the recorded byte total self-consistent.
- Match the inspiration's upper-left placement and visual treatment using the current game's proportional layout rules.
- Keep loading, validation, formatting, and DOM creation independently testable.

**Non-Goals:**

- Measuring compressed ZIP size, HTTP transfer size, cache size, or per-asset download progress.
- Adding a settings control, hiding the metadata during gameplay, or reserving a generalized HUD layout for future UI.
- Reworking the existing GitHub Pages directory structure, release asset immutability, or manual-dispatch behavior beyond supplying the selected release tag to this metadata path.
- Adding Babylon.js GUI resources or another dependency.

## Decisions

### Use the inspiration's public environment document

Add `public/environment.json` with `releaseVersion` and no checked-in `downloadSize` when the size is unknown. Keep its three-component version aligned with the prepared release, as documented in the release steps. Vite copies the file unchanged for local and ordinary production builds.

The publishing workflow will replace the source document before building with the selected exact release tag and a 12-character numeric placeholder for `downloadSize`. A source-generated module or package-version injection was rejected because it would not preserve the inspiration's runtime, deployment-relative metadata behavior and would make late build-size population awkward.

### Populate size after the production build without changing the measured total

After `npm run build`, the workflow will sum the byte length of every file under `dist`. It will validate that the result is an integer of at most 12 digits, left-pad it to exactly 12 digits, replace the numeric placeholder in `dist/environment.json`, and verify that the total build size is unchanged after replacement. Build validation will require both `dist/index.html` and a populated environment document before packaging.

This value intentionally represents the uncompressed total deployed browser build, matching the inspiration. Using ZIP size or network transfer size was rejected because both depend on packaging or transport rather than the actual deployed file set.

### Resolve and format metadata in a small runtime model

Add a focused ES module that:

- validates exact `v<major>.<minor>.<patch>` versions and normalizes an uppercase prefix;
- falls back to `v0.0.0` for invalid or unavailable versions;
- accepts a numeric byte value or a non-empty numeric string;
- returns an empty formatted size for non-finite, negative, missing, or invalid values;
- formats valid bytes as decimal megabytes with one fractional digit and `Mb`;
- fetches `${import.meta.env.BASE_URL}environment.json` using `cache: "no-store"`; and
- catches request and parsing failures so metadata cannot prevent game startup.

Keeping this behavior outside `main.js` makes the fallback contract testable without Babylon.js initialization. Reading `package.json` at runtime or using `VITE_*` build variables was rejected because neither reproduces the deployed runtime file used by the inspiration.

### Render a DOM overlay equivalent of the inspiration's HUD text

Create one semantic text element in `#gameUi` after metadata resolves. Its text is `releaseVersion` plus a single space and `downloadSize` only when the formatted size is non-empty. The element is noninteractive, does not wrap, and remains present for the application lifetime; the game UI overlay owns it, and no Babylon.js resource requires disposal.

The inspiration uses a 50-unit inset, 24-unit font, 48-unit line height, 4-unit outline, and a 900-by-1600 portrait UI design space. The DOM equivalent will therefore use approximately `5.56cqw` top and left offsets, `2.67cqw` font size, `5.33cqw` line height, and a proportional dark outline or text-shadow around bold cream Arial text. These `cqw` values preserve the same normalized composition in the current 9:16 frame. Fixed pixels, viewport units, breakpoints, reflow, and independent clamps are rejected by the project-wide scaling contract.

The overlay retains `pointer-events: none`, so mouse and touch behavior are unaffected. Window resize and orientation changes need no JavaScript handler for this element because container units update with the existing frame.

### Verify the whole path at unit, build, and deployed-browser levels

Focused Node tests will cover validation, uppercase normalization, formatting, request options, failure fallback, text composition, and noninteractive DOM creation. Configuration tests will protect the workflow's placeholder, post-build size calculation, validation, and output locations. The production build will prove the public file is copied.

Real-browser verification will use one live browser session at a large desktop viewport, a narrow portrait viewport, and a tall mobile viewport where width limits the frame. After a release is published, verification will inspect both the deployed environment document and the rendered line at the live, latest, and versioned entry points.

## Risks / Trade-offs

- [Risk] The displayed size can be mistaken for compressed network transfer size. -> Mitigation: keep the implementation and release documentation explicit that it is the total uncompressed production output and preserve the inspiration's `Mb` presentation.
- [Risk] Updating the metadata after measurement could make its own measurement stale. -> Mitigation: reserve and replace an exact 12-character field, then assert that the final total equals the initial total.
- [Risk] A cached redirect or environment response could show an older release. -> Mitigation: resolve the file from Vite's deployment base and request it with `cache: "no-store"`.
- [Risk] A future upper-left control can overlap the metadata. -> Mitigation: keep this change to the requested inspiration position; future UI can deliberately revise the shared layout contract.
- [Risk] Release metadata failure could delay or prevent startup. -> Mitigation: catch unsuccessful responses, invalid JSON, and fetch failures and render the safe local fallback without a size.

## Migration Plan

1. Add the checked-in environment document, runtime loader, DOM display, proportional styles, tests, workflow population, and release documentation.
2. Run focused tests, the full test suite, and a production build; inspect the generated environment file and verify the local version-only fallback.
3. Verify the proportional display in the same browser session at the required desktop and portrait mobile viewports.
4. Prepare a new exact three-component release version, publish the GitHub Release, and verify the workflow records both fields before packaging and deployment.
5. Inspect the deployed environment document and rendered version-plus-size line through the live and versioned URLs.

Rollback is additive: publish a corrected later release or revert the feature in a later commit and release. Existing immutable versioned release assets remain unchanged.
