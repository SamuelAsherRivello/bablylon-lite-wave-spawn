export const ARENA_WIDTH_PX = 800;
export const ARENA_HEIGHT_PX = 1472;
export const ARENA_WALL_INSET_PX = 70;
export const ARENA_WORLD_WIDTH = 9;
export const ARENA_WORLD_HEIGHT = 16;

const horizontalInset = ARENA_WALL_INSET_PX / ARENA_WIDTH_PX * ARENA_WORLD_WIDTH;
const verticalInset = ARENA_WALL_INSET_PX / ARENA_HEIGHT_PX * ARENA_WORLD_HEIGHT;

export const PLAYABLE_BOUNDS = Object.freeze({
  left: -ARENA_WORLD_WIDTH / 2 + horizontalInset,
  right: ARENA_WORLD_WIDTH / 2 - horizontalInset,
  top: ARENA_WORLD_HEIGHT / 2 - verticalInset,
  bottom: -ARENA_WORLD_HEIGHT / 2 + verticalInset,
});

const horizontalWallWidth = ARENA_WORLD_WIDTH / 2 - PLAYABLE_BOUNDS.right;
const verticalWallHeight = ARENA_WORLD_HEIGHT / 2 - PLAYABLE_BOUNDS.top;

export const WALL_DEFINITIONS = Object.freeze([
  Object.freeze({
    side: "left",
    x: -ARENA_WORLD_WIDTH / 2 + horizontalWallWidth / 2,
    y: 0,
    width: horizontalWallWidth,
    height: ARENA_WORLD_HEIGHT,
    insideFace: PLAYABLE_BOUNDS.left,
    mass: 0,
    friction: 0,
    restitution: 0,
  }),
  Object.freeze({
    side: "right",
    x: ARENA_WORLD_WIDTH / 2 - horizontalWallWidth / 2,
    y: 0,
    width: horizontalWallWidth,
    height: ARENA_WORLD_HEIGHT,
    insideFace: PLAYABLE_BOUNDS.right,
    mass: 0,
    friction: 0,
    restitution: 0,
  }),
  Object.freeze({
    side: "top",
    x: 0,
    y: ARENA_WORLD_HEIGHT / 2 - verticalWallHeight / 2,
    width: ARENA_WORLD_WIDTH,
    height: verticalWallHeight,
    insideFace: PLAYABLE_BOUNDS.top,
    mass: 0,
    friction: 0,
    restitution: 0,
  }),
  Object.freeze({
    side: "bottom",
    x: 0,
    y: -ARENA_WORLD_HEIGHT / 2 + verticalWallHeight / 2,
    width: ARENA_WORLD_WIDTH,
    height: verticalWallHeight,
    insideFace: PLAYABLE_BOUNDS.bottom,
    mass: 0,
    friction: 0,
    restitution: 0,
  }),
]);

export const ARENAS = Object.freeze([
  Object.freeze({ id: 1, backgroundPath: "field-background.png", friction: 0.1 }),
  Object.freeze({ id: 2, backgroundPath: "arena-dirt.png", friction: 0.25 }),
  Object.freeze({ id: 3, backgroundPath: "arena-metal.png", friction: 0.4 }),
]);

export function selectArena(search = globalThis.location?.search ?? "", random = Math.random) {
  const forcedId = Number.parseInt(new URLSearchParams(search).get("arena") ?? "", 10);
  const forcedArena = ARENAS.find(({ id }) => id === forcedId);
  if (forcedArena) return forcedArena;

  const index = Math.min(ARENAS.length - 1, Math.floor(random() * ARENAS.length));
  return ARENAS[index];
}

export function applyArenaFriction(speed, friction) {
  return speed * (1 - friction);
}

export function constrainHeroToPlayableBounds(position, velocity, colliderOffsets) {
  const minX = PLAYABLE_BOUNDS.left - colliderOffsets.left;
  const maxX = PLAYABLE_BOUNDS.right - colliderOffsets.right;
  const minY = PLAYABLE_BOUNDS.bottom - colliderOffsets.bottom;
  const maxY = PLAYABLE_BOUNDS.top - colliderOffsets.top;
  const constrainedPosition = {
    x: Math.min(maxX, Math.max(minX, position.x)),
    y: Math.min(maxY, Math.max(minY, position.y)),
  };
  const constrainedVelocity = { ...velocity };

  if ((position.x < minX && velocity.x < 0) || (position.x > maxX && velocity.x > 0)) {
    constrainedVelocity.x = 0;
  }
  if ((position.y < minY && velocity.y < 0) || (position.y > maxY && velocity.y > 0)) {
    constrainedVelocity.y = 0;
  }

  return { position: constrainedPosition, velocity: constrainedVelocity };
}
