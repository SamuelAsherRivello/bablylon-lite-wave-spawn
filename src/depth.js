export const GROUND_Z = 1;
export const ENVIRONMENT_EFFECT_Z = 0.9;
export const SHADOW_Z = 0.8;
export const HERO_Z = 0.4;
export const PROJECTILE_Z = 0.2;
export const Y_DEPTH_SCALE = 0.01;

export function depthForY(baseZ, y) {
  return baseZ + y * Y_DEPTH_SCALE;
}

export function heroSortValueForPivotY(pivotY) {
  return -pivotY;
}

export function heroDepthForPivotY(pivotY) {
  return HERO_Z - heroSortValueForPivotY(pivotY) * Y_DEPTH_SCALE;
}
