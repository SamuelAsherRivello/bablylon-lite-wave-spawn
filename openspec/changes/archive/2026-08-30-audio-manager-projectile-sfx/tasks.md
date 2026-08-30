## 1. Audio Manager

- [x] 1.1 Extend sound definitions and playback to support optional volume and inclusive randomized pitch ranges, while preserving defaults; verify with focused Node tests using a fake Audio implementation
- [x] 1.2 Register the existing projectile-launch asset and configure quiet volume with slight pitch variation; verify the asset path resolves from the Vite public directory

## 2. Projectile Integration

- [x] 2.1 Play the configured projectile-launch sound immediately after each ranged projectile is spawned; verify the ranged-attack path triggers one independent audio event per projectile

## 3. Verification

- [x] 3.1 Run the full test suite and production build, then verify the battle flow in a real browser at desktop and portrait mobile viewport sizes without layout or resize regressions
