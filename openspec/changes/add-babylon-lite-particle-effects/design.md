## Context

See `proposal.md` for motivation. Heroes already own their artwork, material, scene observers, and disposal lifecycle; gameplay resolves collisions and triggers `TAKE_DAMAGE`. The effect must fit that boundary and the existing planar XY scene.

## Goals / Non-Goals

**Goals:**

- Add a small hero-owned cloud burst with deterministic, configurable timing and variation helpers.
- Keep particles in scene space relative to the hero artwork so camera resizing does not require reprojection.
- Make resource ownership and disposal explicit.
- Use core Babylon meshes/materials/textures already available in the project.

**Non-Goals:**

- A general-purpose GPU particle engine, emitter editor, or sprite-sheet system.
- Touch gestures, UI controls, or changes to collision physics.
- New npm dependencies or a new renderer.

## Decisions

### Use transient plane particles with a shared cloud texture

Create small alpha-enabled planes under a particle-effect transform owned by each hero. Use one shared cloud texture and lightweight material configuration, while each particle owns only its plane and animation state. This keeps the implementation Babylon Lite-friendly and makes the PNG visually inspectable.

An engine-level GPU particle system was considered but rejected for the initial few-particle burst because it adds lifecycle/configuration complexity without improving the required effect.

### Use one effect controller per hero

The controller owns active particles and one render observer. `spawnDamageCloudBurst()` samples bounded position, size, and delay/lifetime values, then updates opacity with a piecewise fade-in/fade-out curve. Gameplay calls the semantic method after non-lethal damage; it does not manage individual particles.

Creating independent observers per particle was considered but rejected because a single observer is easier to dispose and has less steady-state overhead.

### Keep artwork-local placement and depth ordering

Particle positions are sampled within configured normalized artwork bounds and converted to local scene units. The effect root is parented to the hero root, with particle Z placed just in front of the artwork. It does not alter the root, collider, shadow, or animation controller transforms.

### Explicitly share and release the asset

The cloud texture/material strategy must avoid disposing a shared resource while another hero uses it. Prefer a scene-level cache with reference counting (or an equivalent single owner) and release it when the last effect controller is disposed. Per-particle planes are always disposed when complete or when the hero ends.

### Passive resize and touch behavior

No input listeners are added. Since particles remain in Babylon scene coordinates under the hero, existing camera and 9:16 resize handling continues to position them correctly on desktop and portrait mobile browsers.

## Risks / Trade-offs

- [A tiny cloud may be hard to see on high-density displays] → Keep size and peak opacity configurable and validate at desktop and portrait mobile viewport sizes.
- [Rapid repeated contacts could create too many particles] → Bound the burst count and either restart or cap active bursts per hero.
- [Texture alpha/material behavior may differ across renderers] → Verify the cloud PNG and alpha blending in the real browser with the project's current renderer paths.
- [Shared resource ownership can leak or dispose early] → Add focused lifecycle tests and verify no active particles remain after hero disposal.
