## 1. Runtime Release Metadata

- [x] 1.1 Add focused failing tests for exact three-component version validation, uppercase-prefix normalization, `v0.0.0` fallback, decimal-megabyte formatting, invalid or negative size omission, deployment-base URL loading with `cache: "no-store"`, and non-blocking request or JSON failures; run the focused tests and confirm the new behavior fails before implementation.
- [x] 1.2 Add the checked-in public environment document and focused runtime metadata module, then rerun the metadata tests and verify all loading, validation, formatting, and fallback cases pass without adding a dependency.

## 2. Upper-Left Game-Frame Display

- [x] 2.1 Add focused failing tests for version-only and version-plus-size text composition, a single noninteractive no-wrap DOM line, and attachment to the existing game UI overlay; run the focused tests and confirm the display behavior fails before implementation.
- [x] 2.2 Create the metadata line during startup and add the inspiration-equivalent cream Arial text, dark outline or shadow, and approximately `5.56cqw` inset, `2.67cqw` font size, and `5.33cqw` line height; rerun the focused UI tests and the visual-scaling contract test and verify they pass.

## 3. Release-Time Population

- [x] 3.1 Add a configuration test that requires the release workflow to write the exact release tag and 12-digit size placeholder before building, calculate all `dist` file bytes afterward, replace the placeholder without changing total size, validate the populated environment file, and package that file; run the focused test and confirm it fails before workflow changes.
- [x] 3.2 Update the release workflow to implement the tested metadata sequence and reject unsupported release tags or unsafe size totals; rerun the configuration test and verify the generated workflow contract passes while preserving versioned Pages assembly and immutable release assets.
- [x] 3.3 Update the concise release documentation to keep the checked-in environment version aligned with its matching exact three-component GitHub Release tag and to state that published builds display total uncompressed browser-build size; verify the documented steps, environment file, and workflow use the same version and field names.

## 4. Integrated Verification

- [x] 4.1 Run the complete test suite and `npm run build` as separate commands; verify both pass and `dist/environment.json` exists with the checked-in version and no rendered size when the local build size is unknown.
- [x] 4.2 Start the production preview and inspect the real page in one browser session at a large desktop viewport, a narrow portrait viewport, and a tall mobile viewport where width limits the frame; verify the frame remains centered at exactly 9:16 and the metadata remains one proportional, readable, noninteractive upper-left line without overlap or reflow.
- [x] 4.3 Exercise a production-preview fixture with valid populated metadata and verify the rendered line includes the exact version plus its one-decimal `Mb` value, then exercise unavailable or malformed metadata and verify startup continues with `v0.0.0` and no size.
- [x] 4.4 After a user-authorized exact three-component GitHub Release is published, inspect the workflow artifact, deployed `environment.json`, stable live URL, and versioned URL in a real browser; verify the exact release tag and measured size are both present and rendered as one upper-left line. If no release is authorized during implementation, leave this post-publication check explicitly pending rather than claiming live verification.
