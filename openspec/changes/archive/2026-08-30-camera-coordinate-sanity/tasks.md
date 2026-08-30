## 1. Coordinate Contract Tests

- [x] 1.1 Add focused regression coverage for the camera's +X/right and +Y/up contract, including the negative-Z viewing side, and verify the focused test passes
- [x] 1.2 Confirm the existing line-position and movement tests express larger Y as higher placement and upward movement as positive Y; verify the relevant test suite passes

## 2. Runtime Verification

- [x] 2.1 Adjust `src/main.js` so the camera satisfies the coordinate contract without changing responsive bounds or touch behavior; verify the production build succeeds
- [x] 2.2 Start the Vite app and verify in a real browser at desktop and portrait mobile-sized viewports that positive-X placement is rightward, positive-Y placement is upward, and resizing produces no console/runtime errors
