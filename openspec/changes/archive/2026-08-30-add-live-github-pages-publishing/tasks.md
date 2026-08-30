## 1. Workflow

- [x] 1.1 Add `.github/workflows/release-web-build-to-github-pages.yml` with a published-release trigger, safe concurrency, required Pages/release permissions, released-tag checkout, Node setup, lockfile installation, `npm test`, and `npm run build`; verify the workflow YAML is present and each required command is represented.
- [x] 1.2 Add release-tag validation, `dist/index.html` validation, and packaging of `dist` as an immutable GitHub Release web-build asset; verify malformed tags fail and an existing same-name asset is not overwritten.
- [x] 1.3 Assemble versioned Pages directories from stored release web-build assets and generate root/latest redirects, then upload and deploy the Pages artifact; verify the triggering release's versioned index is present before deployment.

## 2. Documentation

- [x] 2.1 Update the root `README.md` with the repository's GitHub Pages Live Demo URL, release-trigger instructions, and concise desktop/portrait-mobile verification steps; verify the documented URL matches the repository Pages URL and the commands remain accurate.
- [x] 2.2 Document the one-time GitHub Pages Actions setting and expected release tag format; verify a maintainer can follow the documented release workflow without relying on undocumented repository state.

## 3. Verification

- [x] 3.1 Run `npm test` and `npm run build`, and verify `dist/index.html` exists; record any required Vite base-path adjustment for nested versioned URLs.
- [ ] 3.2 Perform a real-browser smoke check against the deployed root/latest and versioned URLs on desktop and portrait mobile viewport sizes after a test release; verify the Babylon scene loads and no asset requests fail.
- [x] 3.3 Run `openspec validate "add-live-github-pages-publishing" --type change --strict` and `git diff --check`; verify all change artifacts and workflow documentation are consistent.
