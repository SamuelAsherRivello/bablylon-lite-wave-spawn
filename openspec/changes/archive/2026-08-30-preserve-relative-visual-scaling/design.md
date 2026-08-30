## Context

See `proposal.md` for motivation. The game combines a Babylon.js canvas with an HTML interface overlay inside a centered 9:16 container. Babylon's orthographic camera already supplies a stable world-space composition, while the HTML selection overlay currently combines container-query widths with fixed pixel measurements. Existing tests confirm the presence of some container-relative styles but do not reject fixed-size exceptions that cause the narrow-view regression.

## Goals / Non-Goals

**Goals:**

- Establish the 9:16 game frame as the single coordinate and scale reference for browser-visible game composition.
- Preserve the existing large-browser selection layout at smaller supported frame sizes.
- Make the rule discoverable and enforceable for later features.
- Detect mixed-unit regressions through focused automated checks and real-browser comparison.

**Non-Goals:**

- Redesigning the selection screen or changing its three-card row.
- Introducing responsive reflow, alternative mobile art direction, or breakpoint-specific composition.
- Changing Babylon world coordinates, gameplay, touch controls, or camera behavior.
- Adding a CSS framework, UI library, or runtime dependency.

## Decisions

### Use the game frame as the visual reference

Measurements that affect relative appearance or placement inside the game frame will derive from its container dimensions. Because the frame has a fixed 9:16 aspect ratio, width-relative container units provide one uniform scale factor; height-relative or percentage positioning can be used where it communicates the authored coordinate more clearly without creating an independent scale.

This is preferred over browser viewport units because the game frame can be narrower than the viewport on desktop. It is preferred over mobile breakpoints because the requested behavior is the same composition at a different uniform scale, not a reflow.

### Remove mixed fixed-pixel measurements from scalable compositions

Selection-card artwork, card height adjustments, borders, gaps, shadows, and typography will use frame-relative measurements. Reusable custom properties may expose the scale vocabulary where that makes relationships easier to inspect. Fixed pixels remain acceptable only for behavior that is intentionally screen-pixel-based and cannot alter the relative size or placement of visible game-frame content.

This is preferred over scaling only the hero images because fixing a single symptom would leave other elements able to drift as the frame changes size.

### Preserve authored relationships rather than independently clamping elements

The large-browser layout is the reference composition. The cards, artwork, text, and spacing will keep their ratios without independent minimum or maximum clamps. Any future exception, such as a genuine mobile reflow or minimum physical touch target, must be specified as an intentional composition change.

This is preferred over individual `clamp()` rules because independent clamps begin and end at different frame sizes and therefore change relative proportions.

### Make compliance part of permanent project guidance

Applying the change will merge the delta into `openspec/specs/portrait-game-frame/spec.md`, add concise contributor guidance to `README.md`, and extend `openspec/config.yaml` apply guidance. Future OpenSpec changes will therefore encounter the rule both as product behavior and as implementation guidance.

Automated checks will target known failure classes, while browser verification will compare representative large desktop and narrow portrait viewports. Static checks alone are insufficient because proportional errors can still be created with technically frame-relative units.

### Keep the existing resize and resource lifecycle

The current window resize handler continues to resize the Babylon engine. CSS container queries update the HTML overlay automatically, including during touch-device orientation changes. The change creates no Babylon.js resources and therefore adds no ownership or disposal requirements.

## Risks / Trade-offs

- [Very small frames can produce small text or touch targets] -> Preserve the requested uniform composition now; require a separately specified adaptive layout if supported minimum dimensions later demand one.
- [Static unit checks can pass while ratios are visually wrong] -> Pair focused tests with real-browser screenshots or measurements at desktop and narrow portrait sizes.
- [Project-wide wording can be ignored by code outside the selection screen] -> Put the contract in the main frame spec, README guidance, and OpenSpec apply guidance, then include cross-feature acceptance scenarios.
- [A future feature may legitimately need reflow] -> Permit exceptions only when their altered composition and viewport behavior are explicit in that feature's specification.

## Migration Plan

1. Update the selection composition to use one game-frame-relative scale system.
2. Add regression checks for the mixed-unit failure and verify the current behavior at representative viewports.
3. Update the permanent specification and contributor/OpenSpec guidance.
4. Run the production build and repeat real-browser verification before considering the change complete.

Rollback consists of reverting the additive implementation commit through a new commit; no stored data, public API, or migration state is involved.
