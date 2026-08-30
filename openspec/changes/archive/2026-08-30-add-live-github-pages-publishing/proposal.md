## Why

The game currently has no committed, repeatable path from a GitHub release to a public browser demo; the README's “Live Demo” section only describes local development. Adding release-driven GitHub Pages publishing now will make each tagged build reproducible, discoverable, and easy to verify on desktop and portrait mobile browsers.

## What Changes

- Add a GitHub Actions workflow triggered when a GitHub Release is published.
- Check out the released tag, install dependencies with the repository lockfile, run the existing test suite, and build the Vite app.
- Validate that the generated browser artifact contains the expected entry point before deployment.
- Publish the built site to GitHub Pages under versioned release paths, with stable root and `latest` entry points.
- Store the packaged web build on the corresponding GitHub Release without replacing an existing immutable asset.
- Document the public demo URL and release workflow in the root README.

## Capabilities

### New Capabilities

- `github-pages-publishing`: Release-triggered validation, packaging, and deployment of the browser game to GitHub Pages with versioned and latest URLs.

### Modified Capabilities

- None.

## Impact

- Adds `.github/workflows/release-web-build-to-github-pages.yml` and GitHub Actions permissions for Pages deployment and release assets.
- Updates `README.md` with the hosted demo and release instructions.
- Uses the existing npm/Vite build and Node test tooling; no runtime dependencies or new framework are required.
- Requires the repository's GitHub Pages source to use GitHub Actions and a published release tag following the documented version format.
