## 1. Outline Rendering

- [x] 1.1 Add an alpha-aware outline shader using the existing hero texture and verify its fragment logic isolates transparent edge pixels
- [x] 1.2 Replace the enlarged duplicate-sprite indicator with the shader-backed outline plane and verify blue player and red enemy colors are passed correctly
- [x] 1.3 Dispose outline materials and meshes with each hero and verify hero cleanup remains safe

## 2. Verification

- [x] 2.1 Add or update focused tests for side color, alpha-aware outline setup, and unchanged card behavior; verify npm.cmd test passes for the relevant tests
- [x] 2.2 Run npm.cmd run build and git diff --check successfully
- [x] 2.3 Run the Vite app in a real browser, complete hero selection, and verify the outline follows the hero artwork with blue player and red enemy indicators at portrait scale
