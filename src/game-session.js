import { lineToY } from "./battle-rules.js";
import { createPowerupXp, samplePowerupOffer } from "./powerups.js";

export const GAME_PHASES = Object.freeze({
  MAIN_MENU: "main-menu",
  WAVE_INTRO: "wave-intro",
  CHOICE_MENU: "choice-menu",
  FORMATION: "formation",
  BATTLE: "battle",
  WAVE_COMPLETE: "wave-complete",
  GAME_OVER: "game-over",
});

export const WAVE_INTRO_TIMINGS = Object.freeze({
  fadeInSeconds: 0.25,
  holdSeconds: 0.5,
  fadeOutSeconds: 0.25,
});

export function createGameSession(skipStartMenu = false, arenaOrder = []) {
  return {
    phase: skipStartMenu ? GAME_PHASES.WAVE_INTRO : GAME_PHASES.MAIN_MENU,
    waveNumber: 1,
    generation: 0,
    selected: [],
    enemySelected: [],
    xp: { bishop: 0, pawn: 0, rook: 0 },
    choiceStep: null,
    powerupOffer: [],
    selectedPowerup: null,
    powerupXp: createPowerupXp(),
    arenaOrder,
  };
}

export function arenaForWave(session, waveNumber = session.waveNumber) {
  if (waveNumber < 1 || waveNumber > 3) throw new Error("Wave must be 1 through 3");
  return session.arenaOrder[waveNumber - 1];
}

export function startWave(session, waveNumber) {
  if (waveNumber < 1 || waveNumber > 3) throw new Error("Wave must be 1 through 3");
  session.waveNumber = waveNumber;
  session.phase = GAME_PHASES.WAVE_INTRO;
  session.generation += 1;
  session.selected = [];
  session.enemySelected = [];
  session.choiceStep = "hero";
  session.powerupOffer = [];
  session.selectedPowerup = null;
  return session.generation;
}

export function beginHeroChoice(session) {
  session.phase = GAME_PHASES.CHOICE_MENU;
  session.choiceStep = "hero";
}

export function beginPowerupChoice(session, random = Math.random) {
  session.phase = GAME_PHASES.CHOICE_MENU;
  session.choiceStep = "powerup";
  if (!session.powerupOffer.length) {
    session.powerupOffer = samplePowerupOffer(random);
  }
  return session.powerupOffer;
}

export function choosePowerupForWave(session, variantId) {
  if (session.phase !== GAME_PHASES.CHOICE_MENU || session.choiceStep !== "powerup") {
    throw new Error("Powerup choice is not active");
  }
  if (!session.powerupOffer.some(({ id }) => id === variantId)) {
    throw new Error("Powerup was not offered");
  }
  session.choiceStep = "activation";
  session.selectedPowerup = variantId;
  session.powerupXp[variantId] = (session.powerupXp[variantId] ?? 0) + 1;
}

export function chooseHeroForWave(session, heroId, enemyId) {
  if (session.selected.includes(heroId)) throw new Error("Hero already selected this wave");
  if (session.enemySelected.includes(enemyId)) throw new Error("Enemy already selected this wave");
  session.selected.push(heroId);
  session.enemySelected.push(enemyId);
  session.xp[heroId] = (session.xp[heroId] ?? 0) + 1;
}

export function formatXp(value) {
  return `XP:${String(Math.max(0, value ?? 0)).padStart(3, "0")}`;
}

export function lineSlots(count, spacing = 0.58, maximumSpan = 7) {
  if (count <= 0) return [];
  const effectiveSpacing = count === 1
    ? 0
    : Math.min(spacing, maximumSpan / (count - 1));
  return Array.from(
    { length: count },
    (_, index) => Number(((index - (count - 1) / 2) * effectiveSpacing).toFixed(2)),
  );
}

function zeroVelocity(body) {
  const current = body?.getLinearVelocity?.();
  if (current?.constructor && current.constructor !== Object) {
    return new current.constructor(0, 0, 0);
  }
  return { x: 0, y: 0, z: 0 };
}

export function resetUnitForNextWave(unit, line, x) {
  unit.target = null;
  unit.speed = 0;
  unit.targetAgeSeconds = 0;
  unit.rangedCooldown = 0;
  unit.knockbackDirection = { x: 0, y: 0 };
  unit.knockbackElapsedSeconds = 0;
  unit.knockbackRemainingSeconds = 0;
  unit.collisionPushVelocity = { x: 0, y: 0 };
  unit.collisionPushRemainingSeconds = 0;
  unit.line = line;
  unit.hero.root.position.x = x;
  unit.hero.root.position.y = lineToY(line);
  const body = unit.hero.physics?.body;
  body?.setLinearVelocity?.(zeroVelocity(body));
  body?.setAngularVelocity?.(zeroVelocity(body));
  unit.hero.teleportPhysicsToTransform?.();
  unit.hero.updateDepthSort?.();
  return unit;
}

export function battleResult(waveNumber, winner) {
  if (winner === "player" && waveNumber < 3) {
    return {
      phase: GAME_PHASES.WAVE_COMPLETE,
      title: "Wave Complete",
      body: "You killed all enemies. Congratulations!",
      action: "Next Wave",
    };
  }
  if (winner === "player") {
    return {
      phase: GAME_PHASES.GAME_OVER,
      title: "Game Over",
      body: "Congratulations, you beat all three waves.",
      action: "Restart Game",
    };
  }
  return {
    phase: GAME_PHASES.GAME_OVER,
    title: "Game Over",
    body: "Your army was defeated. Try again!",
    action: "Restart Game",
  };
}
