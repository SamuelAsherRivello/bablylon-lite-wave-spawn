import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { Hero } from "../src/hero.js";
import { FreeCamera, NullEngine, Scene, Vector3 } from "@babylonjs/core";
import HavokPhysics from "@babylonjs/havok";
import { HavokPlugin } from "@babylonjs/core/Physics/v2/Plugins/havokPlugin.js";
import {
  GAME_PHASES,
  WAVE_INTRO_TIMINGS,
  createGameSession,
  startWave,
  chooseHeroForWave,
  formatXp,
  arenaForWave,
  lineSlots,
  resetUnitForNextWave,
  battleResult,
  beginHeroChoice,
  beginPowerupChoice,
  choosePowerupForWave,
} from "../src/game-session.js";
import { POWERUP_VARIANTS } from "../src/powerups.js";

test("a fresh session routes through menu or directly to Wave 1", () => {
  const arenaOrder = [{ id: 3 }, { id: 1 }, { id: 2 }];
  assert.deepEqual(createGameSession(false, arenaOrder), {
    phase: GAME_PHASES.MAIN_MENU,
    waveNumber: 1,
    generation: 0,
    selected: [],
    enemySelected: [],
    xp: { bishop: 0, pawn: 0, rook: 0 },
    choiceStep: null,
    powerupOffer: [],
    selectedPowerup: null,
    powerupXp: Object.fromEntries(POWERUP_VARIANTS.map(({ id }) => [id, 0])),
    arenaOrder,
  });
  assert.equal(createGameSession(true).phase, GAME_PHASES.WAVE_INTRO);
  assert.equal(arenaForWave(createGameSession(false, arenaOrder), 2).id, 1);
});

test("wave intro uses quarter-half-quarter pause-aware timing", () => {
  assert.deepEqual(WAVE_INTRO_TIMINGS, {
    fadeInSeconds: 0.25,
    holdSeconds: 0.5,
    fadeOutSeconds: 0.25,
  });
});

test("every wave resets choices and increments run-scoped padded XP", () => {
  const session = createGameSession(false);
  startWave(session, 1);
  chooseHeroForWave(session, "bishop", "rook");
  chooseHeroForWave(session, "pawn", "pawn");
  chooseHeroForWave(session, "rook", "bishop");
  assert.deepEqual(session.xp, { bishop: 1, pawn: 1, rook: 1 });
  assert.throws(() => chooseHeroForWave(session, "rook", "bishop"));

  startWave(session, 2);
  assert.deepEqual(session.selected, []);
  assert.deepEqual(session.enemySelected, []);
  chooseHeroForWave(session, "rook", "bishop");
  assert.equal(session.xp.rook, 2);
  assert.equal(formatXp(session.xp.rook), "XP:002");
});

test("choice menu advances from hero cards to one stable powerup selection", () => {
  const session = createGameSession(false);
  startWave(session, 1);
  beginHeroChoice(session);
  assert.equal(session.phase, GAME_PHASES.CHOICE_MENU);
  assert.equal(session.choiceStep, "hero");
  const offer = beginPowerupChoice(session, () => 0);
  assert.equal(session.choiceStep, "powerup");
  assert.equal(session.powerupOffer, offer);
  assert.deepEqual(offer.map(({ id }) => id), [
    "shield-positive", "shield-negative", "healing-heart-positive",
  ]);
  assert.equal(beginPowerupChoice(session, () => 0.9), offer);
  choosePowerupForWave(session, "shield-negative");
  assert.equal(session.choiceStep, "activation");
  assert.equal(session.selectedPowerup, "shield-negative");
  assert.equal(session.powerupXp["shield-negative"], 1);
  assert.throws(() => choosePowerupForWave(session, "shield-positive"));
  startWave(session, 2);
  assert.equal(session.choiceStep, "hero");
  assert.deepEqual(session.powerupOffer, []);
  assert.equal(session.selectedPowerup, null);
  assert.equal(session.powerupXp["shield-negative"], 1);
});

test("survivors keep health while combat transients are cleared", () => {
  const velocityWrites = [];
  let physicsSyncs = 0;
  const unit = {
    hero: {
      health: 17,
      root: { position: { x: 3, y: 2 } },
      physics: { body: { setLinearVelocity: (value) => velocityWrites.push(value) } },
      teleportPhysicsToTransform: () => { physicsSyncs += 1; },
    },
    target: {},
    speed: 2,
    targetAgeSeconds: 2,
    rangedCooldown: 3,
    knockbackElapsedSeconds: 1,
    knockbackRemainingSeconds: 1,
  };
  resetUnitForNextWave(unit, 6, -1);
  assert.equal(unit.hero.health, 17);
  assert.equal(unit.hero.root.position.y, -6.5);
  assert.equal(unit.hero.root.position.x, -1);
  assert.equal(unit.target, null);
  assert.equal(unit.rangedCooldown, 0);
  assert.equal(unit.knockbackRemainingSeconds, 0);
  assert.equal(velocityWrites.length, 1);
  assert.equal(physicsSyncs, 1);
});

test("hero rollover teleports the transform into Havok instead of copying Havok back", () => {
  const calls = [];
  let prestepType = 0;
  const body = {
    getPrestepType: () => prestepType,
    setPrestepType: (value) => {
      prestepType = value;
      calls.push(["prestep", value]);
    },
  };
  const root = { position: { x: 0, y: -6.5 } };
  const hero = {
    physics: { body },
    root,
    scene: {
      getPhysicsEngine: () => ({
        getPhysicsPlugin: () => ({
          setPhysicsBodyTransformation: (...args) => calls.push(["to-body", ...args]),
          syncTransform: (...args) => calls.push(["from-body", ...args]),
        }),
      }),
    },
  };
  Hero.prototype.teleportPhysicsToTransform.call(hero);
  assert.deepEqual(calls.map(([operation]) => operation), [
    "prestep", "to-body", "prestep",
  ]);
  assert.equal(prestepType, 0);
});

test("a rolled-over survivor remains on line 6 after a real Havok step", async () => {
  const engine = new NullEngine();
  const scene = new Scene(engine);
  const camera = new FreeCamera("test-camera", Vector3.Zero(), scene);
  camera.setTarget(new Vector3(0, 0, 1));
  const wasmBinary = await readFile(new URL(
    "../node_modules/@babylonjs/havok/lib/esm/HavokPhysics.wasm",
    import.meta.url,
  ));
  const havok = await HavokPhysics({ wasmBinary });
  scene.enablePhysics(null, new HavokPlugin(true, havok));
  scene.getPhysicsEngine().setGravity(Vector3.Zero());
  const hero = new Hero(
    "rollover-survivor",
    "data:image/png;base64,iVBORw0KGgo=",
    new Vector3(0, 0, 0),
    scene,
    "pawn",
    "player",
  );
  const unit = { hero };
  resetUnitForNextWave(unit, 6, 1.25);
  scene.render();
  scene.render();
  assert.ok(Math.abs(hero.root.position.x - 1.25) < 1e-6);
  assert.ok(Math.abs(hero.root.position.y + 6.5) < 1e-6);
  hero.dispose();
  scene.dispose();
  engine.dispose();
});

test("combined back lines are centered in stable left-to-right slots", () => {
  assert.deepEqual(lineSlots(1), [0]);
  assert.deepEqual(lineSlots(5), [-1.16, -0.58, 0, 0.58, 1.16]);
  const crowded = lineSlots(12);
  assert.equal(crowded.length, 12);
  assert.equal(crowded[0], -3.19);
  assert.equal(crowded.at(-1), 3.19);
  assert.ok(crowded.every((slot, index) => index === 0 || slot > crowded[index - 1]));
  const maximumWaveGroup = lineSlots(23);
  assert.equal(maximumWaveGroup[0], -3.5);
  assert.equal(maximumWaveGroup.at(-1), 3.5);
});

test("battle results advance only intermediate wins and never create Wave 4", () => {
  assert.deepEqual(battleResult(1, "player"), {
    phase: GAME_PHASES.WAVE_COMPLETE,
    title: "Wave Complete",
    body: "You killed all enemies. Congratulations!",
    action: "Next Wave",
  });
  assert.equal(battleResult(2, "player").phase, GAME_PHASES.WAVE_COMPLETE);
  assert.deepEqual(battleResult(3, "player"), {
    phase: GAME_PHASES.GAME_OVER,
    title: "Game Over",
    body: "Congratulations, you beat all three waves.",
    action: "Restart Game",
  });
  assert.equal(battleResult(1, "enemy").body, "Your army was defeated. Try again!");
});

test("gameplay integrates mandatory prompts, wave timing, XP, and disposal", async () => {
  const [gameplay, styles] = await Promise.all([
    readFile(new URL("../src/gameplay.js", import.meta.url), "utf8"),
    readFile(new URL("../src/style.css", import.meta.url), "utf8"),
  ]);
  assert.match(gameplay, /showCloseButton:\s*false/);
  assert.match(gameplay, /closeOnBackdrop:\s*false/);
  assert.match(gameplay, /WAVE_INTRO_TIMINGS\.fadeInSeconds/);
  assert.match(gameplay, /formatXp\(this\.session\.xp\[hero\.id\]\)/);
  assert.match(gameplay, /resetUnitForNextWave/);
  assert.match(gameplay, /lineSlots/);
  assert.match(gameplay, /disposeSession\(\)/);
  assert.match(gameplay, /applyWaveArena/);
  assert.match(gameplay, /createGameSession\([\s\S]*this\.createArenaOrder\(\)/);
  assert.match(styles, /\.wave-intro/);
  assert.match(styles, /\.game-prompt-action/);
  assert.match(
    styles,
    /\.game-window--no-close \.game-window-title\s*\{[^}]*text-align:\s*center;/,
  );
  assert.match(styles, /\.game-prompt-body\s*\{[^}]*text-align:\s*center;/);
});
