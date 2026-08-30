import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("hero collider covers the bottom half of its artwork", async () => {
  const source = await readFile(new URL("../src/hero.js", import.meta.url), "utf8");

  assert.match(source, /HERO_COLLIDER_HEIGHT\s*=\s*0\.5/);
  assert.match(source, /HERO_COLLIDER_CENTER_Y\s*=\s*-HERO_COLLIDER_HEIGHT\s*\/\s*2/);
  assert.match(source, /extents:\s*new Vector3\(0\.58, HERO_COLLIDER_HEIGHT, 0\.2\)/);
  assert.match(source, /center:\s*new Vector3\(0, HERO_COLLIDER_CENTER_Y, 0\)/);
  assert.doesNotMatch(source, /extents:\s*new Vector3\(0\.58, 0\.84, 0\.2\)/);
});

test("hero collider remains on the gameplay root with existing callbacks", async () => {
  const source = await readFile(new URL("../src/hero.js", import.meta.url), "utf8");

  assert.match(source, /new PhysicsAggregate\(\s*this\.root,/s);
  assert.match(source, /this\.physics\.body\.setCollisionCallbackEnabled\(true\)/);
  assert.match(source, /this\.physics\.dispose\(\)/);
  assert.match(source, /getDepthPivotY\(\)[\s\S]*this\.root\.position\.y \+ this\.shadow\.position\.y/);
});
