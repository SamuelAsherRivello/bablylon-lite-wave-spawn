## 1. Arena Data and Geometry

- [x] 1.1 Add focused tests for a three-entry numbered arena catalog, equal-probability injectable selection, `?arena=1|2|3` overrides, friction values `0.10`, `0.25`, and `0.40`, and the 70-pixel-to-world boundary conversion; run the focused tests and confirm they fail before production implementation.
- [x] 1.2 Implement the immutable arena catalog, selection helper, and shared 800 by 1472 geometry constants; verify the focused catalog and geometry tests pass.
- [x] 1.3 Pass one startup-selected arena record to both arena rendering and gameplay; verify an automated test proves the selection is made once and remains stable for the session.

## 2. Arena Artwork

- [x] 2.1 Revise the grass Arena 1 and generate an exact 70-pixel review guide while preserving its established theme; verify the candidate is 800 by 1472 and its floor begins exactly 70 pixels from every edge.
- [x] 2.2 Generate an 800 by 1472 Arena 2 background with a dirt floor inside the exact 70-pixel inset and trees confined to the outer wall bands; verify dimensions programmatically and inspect it with a visible 70-pixel guide.
- [x] 2.3 Generate an 800 by 1472 Arena 3 background with a futuristic metal floor inside the exact 70-pixel inset and metal walls in the outer bands; verify dimensions programmatically and inspect it with a visible 70-pixel guide.
- [x] 2.4 Present all three guided candidates for explicit user approval and pause implementation; after approval, save the unguided assets to their final paths and verify an asset-loading test and browser network inspection show all three images load without errors.

## 3. Boundaries and Debugging

- [x] 3.1 Add failing tests for four static arena walls whose playable-side faces map to `x = +/-3.7125` and `y = +/-7.23913`, including complete corner coverage, zero restitution, and preserved tangential motion.
- [x] 3.2 Implement the four mass-zero wall colliders as arena-owned resources and dispose them with the arena; verify the geometry tests pass, heroes cannot cross any edge, do not bounce, and can slide along walls in a physics test or controlled browser scenario.
- [x] 3.3 Implement opt-in `debugColliders=1` translucent collider visuals that have no physics participation; verify in a real browser that all four overlays align with the 70-pixel boundary and that no overlays appear without the parameter.

## 4. Friction-Affected Movement

- [x] 4.1 Add failing movement tests proving effective speed uses `canonical speed * existing movement scale * (1 - arena friction)`, produces Arena 1 > Arena 2 > Arena 3 travel distance, and preserves Pawn > Rook/Bishop relative speed.
- [x] 4.2 Route the selected arena friction through gameplay movement without mutating hero profiles; verify all focused movement and existing battle-rule tests pass.

## 5. Integrated Verification

- [x] 5.1 Run the complete automated test suite and lint checks, fixing only regressions caused by this change, and record that all commands pass.
- [x] 5.2 Run the production build and verify it completes without missing asset, Babylon.js, or Havok errors.
- [x] 5.3 Use a real browser to load `?arena=1`, `?arena=2`, and `?arena=3`, then also verify normal loads remain random; confirm each arena retains its artwork/friction/boundaries for the full session and compare hero movement ordering.
- [x] 5.4 Verify desktop resizing and a portrait mobile viewport keep artwork and collider overlays aligned, heroes contained, touch selection functional, and the 9:16 presentation intact.
