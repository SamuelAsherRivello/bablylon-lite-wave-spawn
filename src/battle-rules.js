export const PLAYER_LINE_COUNTS = [
  { line: 6, count: 5 },
  { line: 5, count: 3 },
  { line: 4, count: 1 },
];
export const ENEMY_LINE_COUNTS = [
  { line: 1, count: 5 },
  { line: 2, count: 3 },
  { line: 3, count: 1 },
];
export const VERTICAL_SPEED_FACTOR = 0.1;
export const HERO_HEALTH = 100;
export const HERO_DAMAGE = 11;
export const COLLISION_ENABLED = true;
export const HERO_RENDER_DELAY_MS = 250;
export const BASE_MOVEMENT_DURATION_MS = 2600;
export const MOVEMENT_DURATION_MS =
  COLLISION_ENABLED
    ? BASE_MOVEMENT_DURATION_MS / VERTICAL_SPEED_FACTOR
    : BASE_MOVEMENT_DURATION_MS;

export function createFormationPlan() {
  return {
    player: PLAYER_LINE_COUNTS.map((formation) => ({ ...formation })),
    enemy: ENEMY_LINE_COUNTS.map((formation) => ({ ...formation })),
  };
}

export function createWalkOffsets(random = Math.random) {
  const amplitude = 1 + Math.floor(random() * 3);
  return [-amplitude, amplitude, -amplitude, amplitude, 0];
}

export function resolveCollision(attacker, defender) {
  return {
    attackerHealth: Math.max(0, attacker.health - HERO_DAMAGE),
    defenderHealth: Math.max(0, defender.health - HERO_DAMAGE),
  };
}
