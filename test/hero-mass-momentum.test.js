import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  COLLISION_PUSH_DURATION_SECONDS,
  HERO_CLASSES,
  createCollisionPushVelocities,
  heroMassForDamage,
} from "../src/battle-rules.js";

function hero({ x, y, vx, vy, mass }) {
  return {
    position: { x, y },
    velocity: { x: vx, y: vy },
    mass,
  };
}

test("hero mass is a bounded linear function of canonical damage", () => {
  assert.equal(heroMassForDamage(10), 1);
  assert.equal(heroMassForDamage(20), 1.05);
  assert.equal(heroMassForDamage(30), 1.1);
  assert.equal(heroMassForDamage(-100), 1);
  assert.equal(heroMassForDamage(100), 1.1);

  assert.equal(HERO_CLASSES.pawn.mass, 1);
  assert.equal(HERO_CLASSES.rook.mass, 1.05);
  assert.equal(HERO_CLASSES.bishop.mass, 1.1);
  assert.ok(Math.abs(HERO_CLASSES.rook.mass - HERO_CLASSES.pawn.mass - 0.05) < 1e-12);
  assert.ok(Math.abs(HERO_CLASSES.bishop.mass - HERO_CLASSES.rook.mass - 0.05) < 1e-12);
  assert.equal(
    HERO_CLASSES.bishop.mass / HERO_CLASSES.pawn.mass,
    1.1,
  );
});

test("hero physics uses the profile mass without changing collider constraints", async () => {
  const source = await readFile(new URL("../src/hero.js", import.meta.url), "utf8");

  assert.match(source, /this\.mass\s*=\s*stats\.mass/);
  assert.match(source, /mass:\s*this\.mass/);
  assert.match(source, /setMassProperties\(\{\s*mass:\s*this\.mass,\s*inertia:\s*Vector3\.Zero\(\)/s);
  assert.match(source, /friction:\s*0/);
  assert.match(source, /restitution:\s*0/);
  assert.match(source, /extents:\s*new Vector3\(0\.58, HERO_COLLIDER_HEIGHT, 0\.2\)/);
  assert.match(source, /center:\s*new Vector3\(0, HERO_COLLIDER_CENTER_Y, 0\)/);
});

test("greater equal-speed mass decides contact-axis push", () => {
  const result = createCollisionPushVelocities(
    hero({ x: 0, y: 0, vx: 1, vy: 0, mass: 1.1 }),
    hero({ x: 1, y: 0, vx: -1, vy: 0, mass: 1 }),
  );

  assert.ok(result.sharedNormalVelocity > 0);
  assert.deepEqual(result.firstVelocity, result.secondVelocity);
});

test("greater speed can overcome a small mass disadvantage", () => {
  const result = createCollisionPushVelocities(
    hero({ x: 0, y: 0, vx: 1.2, vy: 0, mass: 1 }),
    hero({ x: 1, y: 0, vx: -1, vy: 0, mass: 1.1 }),
  );

  assert.ok(result.sharedNormalVelocity > 0);
});

test("equal opposing momentum has no biased normal winner", () => {
  const result = createCollisionPushVelocities(
    hero({ x: 0, y: 0, vx: 1, vy: 0, mass: 1 }),
    hero({ x: 1, y: 0, vx: -1, vy: 0, mass: 1 }),
  );

  assert.equal(result.sharedNormalVelocity, 0);
  assert.deepEqual(result.firstVelocity, { x: 0, y: 0 });
  assert.deepEqual(result.secondVelocity, { x: 0, y: 0 });
});

test("stationary and separating velocities are not reversed into contact", () => {
  const separating = createCollisionPushVelocities(
    hero({ x: 0, y: 0, vx: -2, vy: 0, mass: 1 }),
    hero({ x: 1, y: 0, vx: 2, vy: 0, mass: 1.1 }),
  );
  const stationary = createCollisionPushVelocities(
    hero({ x: 0, y: 0, vx: 0, vy: 0, mass: 1 }),
    hero({ x: 1, y: 0, vx: 0, vy: 0, mass: 1.1 }),
  );

  assert.deepEqual(separating.firstVelocity, { x: -2, y: 0 });
  assert.deepEqual(separating.secondVelocity, { x: 2, y: 0 });
  assert.deepEqual(stationary.firstVelocity, { x: 0, y: 0 });
  assert.deepEqual(stationary.secondVelocity, { x: 0, y: 0 });
});

test("angled contact preserves tangential velocity", () => {
  const result = createCollisionPushVelocities(
    hero({ x: 0, y: 0, vx: 2, vy: 3, mass: 1 }),
    hero({ x: 1, y: 0, vx: -1, vy: -4, mass: 1 }),
  );

  assert.equal(result.firstVelocity.y, 3);
  assert.equal(result.secondVelocity.y, -4);
  assert.equal(result.firstVelocity.x, result.secondVelocity.x);
});

test("coincident positions use a normalized finite fallback", () => {
  const result = createCollisionPushVelocities(
    hero({ x: 2, y: 2, vx: 0, vy: 1, mass: 1 }),
    hero({ x: 2, y: 2, vx: 0, vy: -1, mass: 1.1 }),
    { x: 0, y: 5 },
  );

  assert.deepEqual(result.axis, { x: 0, y: 1 });
  for (const value of [
    result.sharedNormalVelocity,
    result.firstVelocity.x,
    result.firstVelocity.y,
    result.secondVelocity.x,
    result.secondVelocity.y,
  ]) assert.equal(Number.isFinite(value), true);
  assert.equal(COLLISION_PUSH_DURATION_SECONDS, 0.1);
});
