const ASSET_BASE = import.meta.env?.BASE_URL ?? "/";

export const POWERUP_BASES = Object.freeze([
  { id: "shield", title: "Shield", amount: 20, stat: "health", statIcon: "❤️", effect: "shield" },
  { id: "healing-heart", title: "Healing Heart", amount: 20, stat: "health", statIcon: "❤️", effect: "heal" },
  { id: "war-banner", title: "War Banner", amount: 5, stat: "damage", statIcon: "⚔️", effect: "modifier" },
  { id: "winged-boots", title: "Winged Boots", amount: 5, stat: "speed", statIcon: "⚡", effect: "modifier" },
  { id: "battle-cry", title: "Battle Cry", amount: 2, stat: "damage", statIcon: "⚔️", effect: "modifier" },
].map((powerup) => Object.freeze({
  ...powerup,
  art: `${ASSET_BASE}art/powerups/${powerup.id}.svg`,
})));

export const POWERUP_VARIANTS = Object.freeze(POWERUP_BASES.flatMap((base) => [
  Object.freeze({
    ...base,
    id: `${base.id}-positive`,
    baseId: base.id,
    polarity: "positive",
    sign: "+",
    badgeColor: "blue",
    targetSide: "player",
    signedAmount: base.amount,
  }),
  Object.freeze({
    ...base,
    id: `${base.id}-negative`,
    baseId: base.id,
    polarity: "negative",
    sign: "−",
    badgeColor: "red",
    targetSide: "enemy",
    signedAmount: -base.amount,
  }),
]));

export function createPowerupXp() {
  return Object.fromEntries(POWERUP_VARIANTS.map(({ id }) => [id, 0]));
}

export function samplePowerupOffer(random = Math.random) {
  const pool = [...POWERUP_VARIANTS];
  return Array.from({ length: 3 }, () => {
    const index = Math.min(pool.length - 1, Math.floor(random() * pool.length));
    return pool.splice(Math.max(0, index), 1)[0];
  });
}

export function selectPowerupTargets(
  variant,
  playerUnits,
  enemyUnits,
  random = Math.random,
) {
  const units = (variant.targetSide === "player" ? playerUnits : enemyUnits)
    .filter((unit) => !unit.removed && unit.hero.health > 0);
  const rows = [...new Set(units.map(({ line }) => line))].sort((a, b) => a - b);
  if (!rows.length) return [];
  const index = Math.min(rows.length - 1, Math.floor(random() * rows.length));
  const row = rows[Math.max(0, index)];
  return units.filter((unit) => unit.line === row);
}

function rememberModifier(unit, stat, amount) {
  unit.wavePowerupModifiers ??= [];
  unit.wavePowerupModifiers.push({ stat, amount });
}

export function applyPowerupVariant(variant, units) {
  const defeated = [];
  units.filter((unit) => !unit.removed).forEach((unit) => {
    const hero = unit.hero;
    if (variant.effect === "heal") {
      hero.health = Math.min(hero.maxHealth, Math.max(0,
        hero.health + variant.signedAmount));
    } else if (variant.effect === "shield") {
      const oldMaximum = hero.maxHealth;
      hero.maxHealth = Math.max(1, oldMaximum + variant.signedAmount);
      const appliedMaximum = hero.maxHealth - oldMaximum;
      hero.health = Math.min(hero.maxHealth, Math.max(0,
        hero.health + variant.signedAmount));
      rememberModifier(unit, "maxHealth", appliedMaximum);
    } else {
      const oldValue = hero[variant.stat];
      hero[variant.stat] = Math.max(0, oldValue + variant.signedAmount);
      rememberModifier(unit, variant.stat, hero[variant.stat] - oldValue);
    }
    if (hero.health <= 0) defeated.push(unit);
  });
  return { affected: units, defeated };
}

export function clearWavePowerupModifiers(units) {
  units.forEach((unit) => {
    const modifiers = unit.wavePowerupModifiers ?? [];
    modifiers.toReversed().forEach(({ stat, amount }) => {
      unit.hero[stat] -= amount;
      if (stat === "maxHealth") {
        unit.hero.maxHealth = Math.max(1, unit.hero.maxHealth);
        unit.hero.health = Math.min(unit.hero.health, unit.hero.maxHealth);
      } else unit.hero[stat] = Math.max(0, unit.hero[stat]);
    });
    unit.wavePowerupModifiers = [];
  });
}

export function powerupActivationFrame(elapsedSeconds, durationSeconds = 0.9) {
  const progress = Math.min(1, Math.max(0, elapsedSeconds / durationSeconds));
  return {
    progress,
    opacity: Math.max(0, progress < 0.3 ? progress / 0.3 : (1 - progress) / 0.7),
    riseCqw: progress === 0 ? 0 : -8 * progress,
    complete: progress >= 1,
  };
}
