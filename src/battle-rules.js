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
export const RETARGET_INTERVAL_SECONDS = 3;
export const HERO_CLASSES = Object.freeze({
  rook: Object.freeze({ role: "tank", health: 120, speed: 10, damage: 20, attacks: Object.freeze(["melee"]) }),
  pawn: Object.freeze({ role: "swarm", health: 40, speed: 15, damage: 10, attacks: Object.freeze(["melee"]) }),
  bishop: Object.freeze({ role: "striker", health: 80, speed: 10, damage: 30, attacks: Object.freeze(["melee", "ranged"]), range: 4.5, rangedCooldown: 1.2 }),
});
export const HERO_ANGULAR_DAMPING = 8;
export const HERO_HEALTH = HERO_CLASSES.rook.health;
export const HERO_DAMAGE = HERO_CLASSES.rook.damage;
export const COLLISION_ENABLED = true;
export const MELEE_ENABLED = true;
export const RANGED_PROJECTILE_SPEED = 7;
export const HERO_RENDER_DELAY_MS = 50;
export const BASE_MOVEMENT_DURATION_MS = 2600;
export const MOVEMENT_DURATION_MS =
  COLLISION_ENABLED
    ? BASE_MOVEMENT_DURATION_MS / VERTICAL_SPEED_FACTOR
    : BASE_MOVEMENT_DURATION_MS;

const LINE_Y_POSITIONS = [6.5, 4.5, 2.2, -2.2, -4.5, -6.5];

export function lineToY(line) {
  return LINE_Y_POSITIONS[line - 1];
}

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

export function findClosestOpponent(unit, opponents) {
  const position = unit.hero.root.position;
  return opponents
    .filter((opponent) => !opponent.removed)
    .reduce((closest, opponent) => {
      if (!closest) return opponent;
      const closestPosition = closest.hero.root.position;
      const currentPosition = opponent.hero.root.position;
      const closestDistance = (closestPosition.x - position.x) ** 2 +
        (closestPosition.y - position.y) ** 2;
      const currentDistance = (currentPosition.x - position.x) ** 2 +
        (currentPosition.y - position.y) ** 2;
      return currentDistance < closestDistance ? opponent : closest;
    }, null);
}

export function selectTarget(unit, opponents) {
  const active = opponents.filter((opponent) => !opponent.removed);
  const untargeted = active.filter((opponent) => !opponent.target);
  const candidates = untargeted.length ? untargeted : active;
  const position = unit.hero.root.position;
  return candidates.reduce((best, opponent) => {
    if (!best) return opponent;
    const bestPosition = best.hero.root.position;
    const opponentPosition = opponent.hero.root.position;
    const bestDistance = (bestPosition.x - position.x) ** 2 +
      (bestPosition.y - position.y) ** 2;
    const opponentDistance = (opponentPosition.x - position.x) ** 2 +
      (opponentPosition.y - position.y) ** 2;
    if (opponentDistance !== bestDistance) {
      return opponentDistance < bestDistance ? opponent : best;
    }
    return opponent.hero.health < best.hero.health ? opponent : best;
  }, null);
}

export function createMovementVelocity(unit, opponent, speed) {
  const position = unit.hero.root.position;
  const targetPosition = opponent.hero.root.position;
  const x = targetPosition.x - position.x;
  const y = targetPosition.y - position.y;
  const distance = Math.hypot(x, y);
  return distance === 0 ? { x: 0, y: 0 } : {
    x: (x / distance) * speed,
    y: (y / distance) * speed,
  };
}

export function resolveCollision(attacker, defender) {
  return {
    attackerHealth: Math.max(0, attacker.health - defender.damage),
    defenderHealth: Math.max(0, defender.health - attacker.damage),
  };
}

export function canUseRangedAttack(unit, target) {
  return unit?.hero?.profile?.attacks?.includes("ranged") &&
    target && !target.removed && distanceBetweenUnits(unit, target) <=
      (unit.hero.profile.range ?? 0);
}

export function distanceBetweenUnits(first, second) {
  const dx = first.hero.root.position.x - second.hero.root.position.x;
  const dy = first.hero.root.position.y - second.hero.root.position.y;
  return Math.hypot(dx, dy);
}
