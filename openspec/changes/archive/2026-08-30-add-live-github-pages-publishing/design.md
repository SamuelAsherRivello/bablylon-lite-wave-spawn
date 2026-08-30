## Context

The app is a root-level Vite site with `npm run build` and `npm test`, and has no existing CI or hosting workflow. The reference project uses a release-triggered GitHub Actions workflow with versioned Pages output and a `latest` redirect; this change adapts that pattern to the current repository layout.

## Goals / Non-Goals

**Goals:**

- Build the exact published release tag in CI.
- Gate deployment on tests, build success, and a minimal artifact check.
- Preserve versioned builds while making one stable latest URL easy to share.
- Keep the runtime and dependency set unchanged.

**Non-Goals:**

- Continuous deployment on every branch push.
- A new hosting provider, custom domain, or server-side application.
- Changes to gameplay, Babylon.js scene behavior, or mobile layout.

## Decisions

- Use a GitHub Release `published` trigger so the public site represents an intentional release, not arbitrary branch state. A push-triggered Pages workflow was considered but would not provide immutable release URLs or a clear release boundary.
- Use root-level `npm ci`, `npm test`, and `npm run build`, matching the current package scripts and lockfile. No new action dependency, framework, or build tool is needed.
- Package `dist` as a release asset, then reconstruct all supported versioned paths from release assets during deployment. This makes reruns and historical releases reproducible; deploying only the current `dist` was rejected because it would discard prior URLs.
- Use GitHub Pages artifact/deploy actions with least-purpose workflow permissions (`contents`, `pages`, and `id-token`) and a single concurrency group to avoid overlapping publications.
- Generate root and `latest` redirects in the Pages staging directory. Vite's existing relative asset behavior must be checked against the nested versioned path during implementation; if needed, the design should use a compatible base-path configuration without changing app behavior.

## Risks / Trade-offs

- [Risk] GitHub repository Pages settings may not yet use GitHub Actions as the source → Mitigation: document this one-time repository setting and treat the first workflow run as the configuration check.
- [Risk] Nested versioned URLs can expose incorrect absolute asset paths → Mitigation: validate the deployed build at the versioned path in a real browser and configure Vite's base path only if required.
- [Risk] Release asset enumeration can omit an older or malformed tag → Mitigation: accept only documented version tags, skip unsupported releases, and require the triggering release's index page before deploy.
- [Risk] GitHub Actions action versions or runner behavior can drift → Mitigation: use current maintained official Pages actions and keep validation explicit in the workflow.

## Migration Plan

1. Add the workflow and README release instructions.
2. Enable GitHub Pages with GitHub Actions in repository settings.
3. Publish a test release tag and inspect the workflow plus the root, latest, and versioned URLs on desktop and portrait mobile browsers.
4. If deployment must be rolled back, repoint Pages to the prior successful workflow artifact or publish a corrected release; existing versioned assets remain immutable.
