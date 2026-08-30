export const GROUND_Z = 400;
export const ENVIRONMENT_EFFECT_Z = 300;
export const SHADOW_Z = 200;
export const HERO_Z = 100;
export const PROJECTILE_Z = 0;
export const Y_DEPTH_SCALE = 1;

export function depthForY(baseZ, y) {
  return baseZ + y * Y_DEPTH_SCALE;
}

export function heroSortValueForPivotY(pivotY) {
  return -pivotY;
}

export function heroDepthForPivotY(pivotY) {
  return HERO_Z - heroSortValueForPivotY(pivotY) * Y_DEPTH_SCALE;
}
