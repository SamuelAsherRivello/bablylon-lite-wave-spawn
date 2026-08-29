import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  ENEMY_LINE_COUNTS,
  COLLISION_ENABLED,
  HERO_RENDER_DELAY_MS,
  PLAYER_LINE_COUNTS,
  VERTICAL_SPEED_FACTOR,
  createFormationPlan,
  createWalkOffsets,
  HERO_HEALTH,
  HERO_DAMAGE,
  resolveCollision,
} from "../src/battle-rules.js";
import { SOUND_PATHS } from "../src/audio.js";

test("the game frame fills the viewport vertically", async () => {
  const styles = await readFile(new URL("../src/style.css", import.meta.url), "utf8");

  assert.match(styles, /\.stage\s*\{[^}]*place-items:\s*center;[^}]*background:/s);
  assert.match(styles, /\.game-frame\s*\{[^}]*width:\s*auto;[^}]*height:\s*100vh;/s);
  assert.match(styles, /\.game-frame\s*\{[^}]*max-width:\s*100vw;/s);
  assert.doesNotMatch(styles, /\.stage\s*\{[^}]*padding:/s);
});

test("game art uses the game frame as its scaling container", async () => {
  const styles = await readFile(new URL("../src/style.css", import.meta.url), "utf8");

  assert.match(styles, /container-type:\s*size/);
  assert.match(styles, /\.hero-card\s*\{[^}]*cqw/s);
  assert.match(styles, /flex:\s*0\s+0\s+25cqw/);
  assert.match(styles, /height:\s*42cqw/);
  assert.match(styles, /\.hero-shadow, \.hero-sprite/);
  assert.match(styles, /\.unit\s*\{\s*display:\s*none;/s);
  assert.doesNotMatch(styles, /@keyframes walk-up|@keyframes walk-down/);
});

test("gameplay sound effects use the public audio files", () => {
  assert.equal(SOUND_PATHS.collision, "/audio/sfx/collision.wav");
  assert.equal(SOUND_PATHS.click, "/audio/sfx/click.wav");
  assert.equal(SOUND_PATHS.levelStart, "/audio/sfx/levelstart.wav");
});

test("gameplay creates heroes on all six lines", () => {
  const plan = createFormationPlan();

  assert.deepEqual(plan.player.map(({ line }) => line), [6, 5, 4]);
  assert.deepEqual(plan.enemy.map(({ line }) => line), [1, 2, 3]);
  assert.deepEqual(plan.player, PLAYER_LINE_COUNTS);
  assert.deepEqual(plan.enemy, ENEMY_LINE_COUNTS);
});

test("hero formations render left to right with a quarter-second delay", () => {
  assert.equal(HERO_RENDER_DELAY_MS, 250);
});

test("movement is slow and each hero walks with zero-drift jiggle", () => {
  assert.equal(VERTICAL_SPEED_FACTOR, 0.1);
  const offsets = createWalkOffsets(() => 0.5);

  assert.equal(offsets.reduce((sum, offset) => sum + offset, 0), 0);
  assert.ok(offsets.some((offset) => offset < 0));
  assert.ok(offsets.some((offset) => offset > 0));
});

test("collision damage is enabled during movement", () => {
  assert.equal(COLLISION_ENABLED, true);
});

test("heroes have 100 health and deal 11 damage on collision", () => {
  assert.equal(HERO_HEALTH, 100);
  assert.equal(HERO_DAMAGE, 11);

  const result = resolveCollision({ health: HERO_HEALTH }, { health: HERO_HEALTH });
  assert.deepEqual(result, { attackerHealth: 89, defenderHealth: 89 });
});

test("collision resolution identifies a defeated hero", () => {
  assert.deepEqual(
    resolveCollision({ health: 11 }, { health: 1 }),
    { attackerHealth: 0, defenderHealth: 0 },
  );
});
