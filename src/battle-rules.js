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
export const COLLISION_PUSH_DURATION_SECONDS = 0.1;
const MIN_HERO_DAMAGE = 10;
const MAX_HERO_DAMAGE = 30;
const MIN_HERO_MASS = 1;
const HERO_MASS_SPREAD = 0.1;

export function heroMassForDamage(damage) {
  const finiteDamage = Number.isFinite(damage) ? damage : MIN_HERO_DAMAGE;
  const boundedDamage = Math.min(MAX_HERO_DAMAGE, Math.max(MIN_HERO_DAMAGE, finiteDamage));
  const damageProgress = (boundedDamage - MIN_HERO_DAMAGE) /
    (MAX_HERO_DAMAGE - MIN_HERO_DAMAGE);
  return MIN_HERO_MASS + damageProgress * HERO_MASS_SPREAD;
}

export const HERO_CLASSES = Object.freeze({
  rook: Object.freeze({ role: "tank", health: 120, speed: 10, damage: 20, mass: heroMassForDamage(20), attacks: Object.freeze(["melee"]) }),
  pawn: Object.freeze({ role: "swarm", health: 40, speed: 15, damage: 10, mass: heroMassForDamage(10), attacks: Object.freeze(["melee"]) }),
  bishop: Object.freeze({ role: "striker", health: 80, speed: 10, damage: 30, mass: heroMassForDamage(30), attacks: Object.freeze(["melee", "ranged"]), range: 4.5, rangedCooldown: 1.2 }),
});
export const HERO_ANGULAR_DAMPING = 8;
export const HERO_HEALTH = HERO_CLASSES.rook.health;
export const HERO_DAMAGE = HERO_CLASSES.rook.damage;
export const COLLISION_ENABLED = true;
export const MELEE_ENABLED = true;
export const RANGED_PROJECTILE_SPEED = 7;
export const KNOCKBACK_DISTANCE_WORLD = 0.25;
export const KNOCKBACK_DURATION_SECONDS = 0.16;
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

function normalizedDirection(firstPosition, secondPosition, fallback) {
  const x = secondPosition.x - firstPosition.x;
  const y = secondPosition.y - firstPosition.y;
  const distance = Math.hypot(x, y);
  if (distance > 0) return { x: x / distance, y: y / distance };

  const fallbackDistance = Math.hypot(fallback.x, fallback.y);
  return fallbackDistance > 0
    ? { x: fallback.x / fallbackDistance, y: fallback.y / fallbackDistance }
    : { x: 0, y: 0 };
}

export function createCollisionPushVelocities(
  first,
  second,
  fallback = { x: 0, y: 0 },
) {
  const axis = normalizedDirection(first.position, second.position, fallback);
  const firstNormal = first.velocity.x * axis.x + first.velocity.y * axis.y;
  const secondNormal = second.velocity.x * axis.x + second.velocity.y * axis.y;
  const firstIncoming = Math.max(0, firstNormal);
  const secondIncoming = Math.max(0, -secondNormal);

  if (firstIncoming === 0 && secondIncoming === 0) {
    return {
      axis,
      sharedNormalVelocity: 0,
      firstVelocity: { ...first.velocity },
      secondVelocity: { ...second.velocity },
    };
  }

  const firstMass = Number.isFinite(first.mass) && first.mass > 0 ? first.mass : 1;
  const secondMass = Number.isFinite(second.mass) && second.mass > 0 ? second.mass : 1;
  const sharedNormalVelocity =
    (firstMass * firstIncoming - secondMass * secondIncoming) /
    (firstMass + secondMass);
  const firstTangent = {
    x: first.velocity.x - firstNormal * axis.x,
    y: first.velocity.y - firstNormal * axis.y,
  };
  const secondTangent = {
    x: second.velocity.x - secondNormal * axis.x,
    y: second.velocity.y - secondNormal * axis.y,
  };

  return {
    axis,
    sharedNormalVelocity,
    firstVelocity: {
      x: firstTangent.x + sharedNormalVelocity * axis.x,
      y: firstTangent.y + sharedNormalVelocity * axis.y,
    },
    secondVelocity: {
      x: secondTangent.x + sharedNormalVelocity * axis.x,
      y: secondTangent.y + sharedNormalVelocity * axis.y,
    },
  };
}

export function createKnockbackDirection(sourcePosition, targetPosition, fallback = { x: 0, y: 0 }) {
  const x = targetPosition.x - sourcePosition.x;
  const y = targetPosition.y - sourcePosition.y;
  const distance = Math.hypot(x, y);
  if (distance > 0) return { x: x / distance, y: y / distance };

  const fallbackDistance = Math.hypot(fallback.x, fallback.y);
  return fallbackDistance > 0
    ? { x: fallback.x / fallbackDistance, y: fallback.y / fallbackDistance }
    : { x: 0, y: 0 };
}

export function createKnockbackVelocity(direction, progress = 0) {
  const normalizedProgress = Math.min(1, Math.max(0, progress));
  const speed = (KNOCKBACK_DISTANCE_WORLD / KNOCKBACK_DURATION_SECONDS) *
    2 * (1 - normalizedProgress);
  return {
    x: direction.x * speed,
    y: direction.y * speed,
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
