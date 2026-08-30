import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PauseController } from "../src/pause-controller.js";

function vector(x, y, z = 0) { return { x, y, z }; }

test("pause controller returns active delta and preserves scheduled remaining time", () => {
  const controller = new PauseController();
  let calls = 0;
  controller.schedule(1, () => { calls += 1; });
  controller.update(0.4);
  assert.equal(controller.getDelta(0.5), 0.5);
  controller.pause();
  controller.pause();
  controller.update(5);
  assert.equal(controller.getDelta(0.5), 0);
  assert.equal(calls, 0);
  controller.resume();
  controller.update(0.59);
  assert.equal(calls, 0);
  controller.update(0.01);
  assert.equal(calls, 1);
});

test("terminal controller never resumes mutable gameplay", () => {
  const controller = new PauseController();
  controller.setTerminal();
  controller.pause();
  controller.resume();
  assert.equal(controller.getDelta(1), 0);
  assert.equal(controller.isTerminal, true);
});

test("physics pause snapshots, zeros, and restores valid bodies", () => {
  const values = { linear: vector(2, 3), angular: vector(0, 0, 1) };
  const body = {
    getLinearVelocity: () => values.linear,
    getAngularVelocity: () => values.angular,
    setLinearVelocity: (value) => { values.linear = value; },
    setAngularVelocity: (value) => { values.angular = value; },
  };
  const scene = { physicsEnabled: true };
  const controller = new PauseController({ scene, getBodies: () => [body] });
  controller.pause();
  assert.deepEqual(values.linear, vector(0, 0));
  assert.deepEqual(values.angular, vector(0, 0));
  assert.equal(scene.physicsEnabled, false);
  controller.resume();
  assert.deepEqual(values.linear, vector(2, 3));
  assert.deepEqual(values.angular, vector(0, 0, 1));
  assert.equal(scene.physicsEnabled, true);
});

test("every current mutable time owner consumes pause-aware game time", async () => {
  const [gameplay, hero, projectile, particles] = await Promise.all([
    readFile(new URL("../src/gameplay.js", import.meta.url), "utf8"),
    readFile(new URL("../src/hero.js", import.meta.url), "utf8"),
    readFile(new URL("../src/projectile.js", import.meta.url), "utf8"),
    readFile(new URL("../src/particle-effects.js", import.meta.url), "utf8"),
  ]);
  assert.match(gameplay, /pauseController\.schedule\(index \* HERO_RENDER_DELAY_MS \/ 1000/);
  assert.match(gameplay, /pauseController\.schedule\(1,/);
  assert.match(gameplay, /const activeDelta = this\.pauseController\.getDelta\(rawDelta\)/);
  assert.match(gameplay, /remaining - activeDelta/);
  assert.match(gameplay, /tryRangedAttack\(unit, target, deltaSeconds\)/);
  assert.match(hero, /animationController\.update\(activeDelta\)/);
  assert.match(hero, /damageCooldownRemaining - activeDelta/);
  assert.match(projectile, /pauseController\?\.getDelta\(rawDelta\)/);
  assert.match(particles, /pauseController\?\.getDelta\(rawDelta\)/);
  assert.match(gameplay, /pauseController\.isPaused \|\| player\.removed/);
  assert.match(gameplay, /pauseController\.setTerminal\(\)/);
});
