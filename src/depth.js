export const GROUND_Z = 1;
export const SHADOW_Z = 0.8;
export const HERO_Z = 0.4;
export const PROJECTILE_Z = 0.2;
export const Y_DEPTH_SCALE = 0.01;

export function depthForY(baseZ, y) {
  return baseZ + y * Y_DEPTH_SCALE;
}
