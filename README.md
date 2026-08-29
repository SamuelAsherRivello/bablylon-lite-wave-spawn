# Light Never Pawns

This demo is a minimal Babylon.js Lite-style project: one responsive 3D scene,
one glowing crystal, and a centered portrait game frame.

## Live Demo

Run the project locally with the commands below.

## Table of Contents

1. Getting Started
2. Project Overview
3. Project Details
4. OpenSpec
5. Resources
6. Credits

## Getting Started

### Play Project

1. Clone or download this repo.
2. Open the repository root in a command line.
3. Run `npm install` to install the project dependencies.
4. Run `npm run dev` to launch the local development server.
5. Open the URL printed by Vite.

### More Commands

| # | Name | Command | Comment |
| --- | --- | --- | --- |
| 1 | Install | `npm install` | Installs Babylon.js and Vite. |
| 2 | Dev | `npm run dev` | Runs the app with hot reload. |
| 3 | Build | `npm run build` | Creates the production bundle. |
| 4 | Preview | `npm run preview` | Serves the production bundle locally. |

## Project Overview

The project uses Babylon.js for the 3D scene and Vite for local development
and production bundling. The game canvas keeps a 9:16 portrait aspect ratio and
is centered in the browser viewport, matching the inspiration project's mobile
presentation without copying its game systems or project structure.

### Structure

- `index.html`: The page shell and centered game frame.
- `src/main.js`: Babylon.js engine, camera, lights, and scene.
- `src/style.css`: Responsive portrait layout and visual styling.

### Dependencies

- `@babylonjs/core`: Babylon.js rendering engine.
- `vite`: Development server and bundler.

## Project Details

This is intentionally a small starting point for experimenting with Babylon.js
Lite. Drag to orbit the camera and use the wheel or pinch gesture to zoom.

## OpenSpec

OpenSpec keeps the project’s feature intent and implementation requirements
visible in the repository.

- `openspec/config.yaml`: Project context and specification rules.
- `openspec/specs/portrait-game-frame/spec.md`: Responsive viewport contract.
- `openspec/changes/`: Proposed feature changes and their implementation tasks.

Typical change workflow:

1. Create a focused folder under `openspec/changes/`.
2. Add a proposal, design, specs, and tasks for the change.
3. Implement the change and verify its browser-visible scenarios.

## Resources

- [Babylon.js Lite getting started](https://doc.babylonjs.com/lite/01-getting-started)
- [Babylon.js Documentation](https://doc.babylonjs.com/)
- [Vite Documentation](https://vite.dev/guide/)

## Credits

Created as a minimal Babylon.js learning project.

### License

Provided as-is under the MIT License.
