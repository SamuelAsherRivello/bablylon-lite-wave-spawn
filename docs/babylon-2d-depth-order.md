# Babylon Lite 2D depth order

The camera is at `z = -10` and looks toward increasing Z. Smaller Z values
are therefore closer to the camera. The game uses explicit depth bands:

| Layer | Base Z | Y sorting | Meaning |
| --- | ---: | --- | --- |
| Ground | `1.00` | None | Arena background, farthest |
| Any shadow | `0.80` | Same Y offset | Above ground, behind all actors |
| Players | `0.40` | `base + Y * 0.01` | Lower-on-screen players are in front |
| Projectiles | `0.20` | `base + Y * 0.01` | Lower-on-screen projectiles are in front |

Because lower Z is closer, the ordering is:

```text
Ground (1.00)
  shadows (0.80 + Y offset)
  players (0.40 + Y offset)
  projectiles (0.20 + Y offset)
```

Hero and projectile shadows use a positive local Z offset within their parent
layer, making them farther from the camera than the owning artwork. Hero
physics remains planar in X/Y, while the render root's Z is recalculated from
its current Y after physics and before rendering. Projectile depth is updated
from its ground-path Y each frame; its faux visual height does not change the
depth sort.

Selection cards are HTML overlay elements, not Babylon meshes, so their
stacking is controlled by DOM/CSS rather than world Z.
