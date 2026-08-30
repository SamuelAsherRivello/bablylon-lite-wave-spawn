import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  HERO_ANIMATION_CONFIG,
  HERO_ANIMATION_STATES,
  HeroAnimationController,
  createCycleVariation,
  createSpawnEasing,
} from "../src/hero-animation.js";

function createVisualSpy() {
  const values = {
    x: 0,
    y: 0,
    rotation: 0,
    scale: 1,
    blinkColor: null,
  };
  return {
    values,
    setOffset(x, y) {
      values.x = x;
      values.y = y;
    },
    setRotation(rotation) {
      values.rotation = rotation;
    },
    setScale(scale) {
      values.scale = scale;
    },
    setBlinkColor(color) {
      values.blinkColor = color;
    },
  };
}

test("animation settings use human-readable configurable timings", () => {
  assert.deepEqual(HERO_ANIMATION_STATES, {
    SPAWN: "spawn",
    IDLE: "idle",
    WALKING: "walking",
    TAKE_DAMAGE: "take-damage",
    DEAD: "dead",
  });
  assert.deepEqual(HERO_ANIMATION_CONFIG.spawn, {
    durationSeconds: 0.2,
    easingType: "BackEase",
    easingMode: "EASEOUT",
  });
  assert.equal(HERO_ANIMATION_CONFIG.idle.minimumCycleSeconds, 0.1);
  assert.equal(HERO_ANIMATION_CONFIG.idle.maximumCycleSeconds, 0.2);
  assert.equal(HERO_ANIMATION_CONFIG.walking.minimumCycleSeconds, 0.1);
  assert.equal(HERO_ANIMATION_CONFIG.walking.maximumCycleSeconds, 0.2);
  assert.equal(HERO_ANIMATION_CONFIG.dead.shrinkDurationSeconds, 0.1);
  assert.equal(typeof HERO_ANIMATION_CONFIG.damage.blinkColor, "string");
  assert.equal(typeof HERO_ANIMATION_CONFIG.damage.blinkDurationSeconds, "number");
  assert.equal(typeof HERO_ANIMATION_CONFIG.dead.blinkColor, "string");
  assert.equal(typeof HERO_ANIMATION_CONFIG.dead.blinkDurationSeconds, "number");
});

test("spawn uses Babylon easing from zero scale into the queued repeating state", () => {
  const visual = createVisualSpy();
  const easing = createSpawnEasing(HERO_ANIMATION_CONFIG.spawn);
  const controller = new HeroAnimationController({ visual, random: () => 0.25 });

  assert.equal(easing.constructor.name, "BackEase");
  assert.equal(controller.state, HERO_ANIMATION_STATES.SPAWN);
  assert.equal(visual.values.scale, 0);

  controller.requestState(HERO_ANIMATION_STATES.WALKING);
  controller.update(HERO_ANIMATION_CONFIG.spawn.durationSeconds / 2);
  assert.equal(controller.state, HERO_ANIMATION_STATES.SPAWN);
  assert.ok(visual.values.scale > 0);

  controller.update(HERO_ANIMATION_CONFIG.spawn.durationSeconds / 2);
  assert.equal(controller.state, HERO_ANIMATION_STATES.WALKING);
  assert.equal(visual.values.scale, 1);
});

test("cycle variation is bounded and changes consecutive identical samples", () => {
  const random = () => 0.5;
  const firstIdle = createCycleVariation(HERO_ANIMATION_CONFIG.idle, random);
  const secondIdle = createCycleVariation(
    HERO_ANIMATION_CONFIG.idle,
    random,
    firstIdle,
  );
  const firstWalking = createCycleVariation(
    HERO_ANIMATION_CONFIG.walking,
    random,
  );
  const secondWalking = createCycleVariation(
    HERO_ANIMATION_CONFIG.walking,
    random,
    firstWalking,
  );

  for (const [variation, config] of [
    [firstIdle, HERO_ANIMATION_CONFIG.idle],
    [secondIdle, HERO_ANIMATION_CONFIG.idle],
    [firstWalking, HERO_ANIMATION_CONFIG.walking],
    [secondWalking, HERO_ANIMATION_CONFIG.walking],
  ]) {
    assert.ok(variation.durationSeconds >= config.minimumCycleSeconds);
    assert.ok(variation.durationSeconds <= config.maximumCycleSeconds);
    assert.ok(Math.abs(variation.verticalOffset) <= config.maximumVerticalOffset);
    assert.ok(Math.abs(variation.rotationRadians) <= config.maximumRotationRadians);
    assert.ok(Math.abs(variation.horizontalOffset) <= (config.maximumHorizontalOffset ?? 0));
  }

  assert.notDeepEqual(secondIdle, firstIdle);
  assert.notDeepEqual(secondWalking, firstWalking);
});

test("damage blink restores the interrupted repeating state", () => {
  const visual = createVisualSpy();
  const controller = new HeroAnimationController({ visual, random: () => 0.25 });

  controller.requestState(HERO_ANIMATION_STATES.WALKING);
  controller.requestState(HERO_ANIMATION_STATES.TAKE_DAMAGE);
  assert.equal(controller.state, HERO_ANIMATION_STATES.TAKE_DAMAGE);
  assert.equal(visual.values.blinkColor, HERO_ANIMATION_CONFIG.damage.blinkColor);

  controller.update(HERO_ANIMATION_CONFIG.damage.blinkDurationSeconds);
  assert.equal(controller.state, HERO_ANIMATION_STATES.WALKING);
  assert.equal(visual.values.blinkColor, null);
});

test("repeated damage coalesces by restarting one blink", () => {
  const visual = createVisualSpy();
  const controller = new HeroAnimationController({ visual, random: () => 0.25 });

  controller.requestState(HERO_ANIMATION_STATES.TAKE_DAMAGE);
  controller.update(HERO_ANIMATION_CONFIG.damage.blinkDurationSeconds * 0.75);
  controller.requestState(HERO_ANIMATION_STATES.TAKE_DAMAGE);
  controller.update(HERO_ANIMATION_CONFIG.damage.blinkDurationSeconds * 0.5);

  assert.equal(controller.state, HERO_ANIMATION_STATES.TAKE_DAMAGE);
  assert.equal(visual.values.blinkColor, HERO_ANIMATION_CONFIG.damage.blinkColor);
});

test("dead blinks, shrinks to zero, completes once, and remains terminal", () => {
  const visual = createVisualSpy();
  let completions = 0;
  const controller = new HeroAnimationController({
    visual,
    random: () => 0.25,
    onDeathComplete: () => {
      completions += 1;
    },
  });

  controller.requestState(HERO_ANIMATION_STATES.DEAD);
  assert.equal(visual.values.blinkColor, HERO_ANIMATION_CONFIG.dead.blinkColor);
  assert.equal(visual.values.scale, 1);

  controller.update(HERO_ANIMATION_CONFIG.dead.blinkDurationSeconds);
  assert.equal(visual.values.blinkColor, null);
  assert.equal(visual.values.scale, 1);

  controller.update(HERO_ANIMATION_CONFIG.dead.shrinkDurationSeconds / 2);
  assert.ok(Math.abs(visual.values.scale - 0.5) < Number.EPSILON);

  controller.requestState(HERO_ANIMATION_STATES.IDLE);
  controller.update(HERO_ANIMATION_CONFIG.dead.shrinkDurationSeconds / 2);
  controller.update(1);

  assert.equal(controller.state, HERO_ANIMATION_STATES.DEAD);
  assert.equal(visual.values.scale, 0);
  assert.equal(completions, 1);
});

test("Hero owns and disposes an artwork-only animation controller", async () => {
  const source = await readFile(new URL("../src/hero.js", import.meta.url), "utf8");

  assert.match(source, /new HeroAnimationController\(/);
  assert.match(source, /setOffset:\s*\(x, y\)\s*=>\s*\{[^}]*this\.sprite\.position\.x = x;[^}]*this\.sprite\.position\.y = y;/s);
  assert.match(source, /setRotation:\s*\(rotation\)\s*=>\s*\{[^}]*this\.sprite\.rotation\.z = rotation;/s);
  assert.match(source, /setScale:\s*\(scale\)\s*=>\s*\{[^}]*this\.sprite\.scaling\.x = scale;[^}]*this\.sprite\.scaling\.y = scale;/s);
  assert.match(source, /this\.animationObserver\s*=\s*scene\.onBeforeRenderObservable\.add/);
  assert.match(source, /remove\(this\.animationObserver\)/);
  assert.match(source, /if \(this\.disposed\) return;/);
  assert.doesNotMatch(source, /setOffset:[\s\S]{0,250}this\.root\.position/);
  assert.doesNotMatch(source, /setScale:[\s\S]{0,250}this\.shadow\.scaling/);
});

test("gameplay derives repeating animation from velocity without changing velocity", async () => {
  const source = await readFile(new URL("../src/gameplay.js", import.meta.url), "utf8");

  assert.match(source, /syncUnitAnimation\(unit\)/);
  assert.match(source, /getLinearVelocity\(\)/);
  assert.match(source, /HERO_ANIMATION_STATES\.WALKING/);
  assert.match(source, /HERO_ANIMATION_STATES\.IDLE/);
});

test("gameplay blinks survivors and delays dead disposal until animation completion", async () => {
  const source = await readFile(new URL("../src/gameplay.js", import.meta.url), "utf8");

  assert.match(source, /if \(player\.removed \|\| enemy\.removed\) return;/);
  assert.match(source, /HERO_ANIMATION_STATES\.TAKE_DAMAGE/);
  assert.match(source, /HERO_ANIMATION_STATES\.DEAD/);
  assert.match(source, /this\.dyingUnits\.add\(unit\)/);
  assert.match(source, /unit\.hero\.disablePhysics\(\)/);
  assert.match(source, /this\.dyingUnits\.delete\(unit\)/);
  assert.match(source, /unit\.hero\.dispose\(\)/);
});

test("battle completion waits for pending death animations", async () => {
  const source = await readFile(new URL("../src/gameplay.js", import.meta.url), "utf8");

  assert.match(source, /this\.pendingBattleResult\s*=\s*message/);
  assert.match(source, /if \(this\.dyingUnits\.size > 0\) return;/);
  assert.match(source, /finalizeBattle\(message\)/);
  assert.match(source, /stopRenderLoop\(\)/);
});

test("hero lines one through six create every formation from left to right", async () => {
  const gameplaySource = await readFile(new URL("../src/gameplay.js", import.meta.url), "utf8");
  const rulesSource = await readFile(new URL("../src/battle-rules.js", import.meta.url), "utf8");

  assert.match(rulesSource, /const LINE_Y_POSITIONS\s*=\s*\[[^\]]+\]/s);
  assert.match(gameplaySource, /Array\.from\(\{ length: count \}, \(_, index\) => index\)\.forEach/);
  assert.match(gameplaySource, /index \* HERO_RENDER_DELAY_MS/);
  assert.match(gameplaySource, /new Hero\(`/);
});
