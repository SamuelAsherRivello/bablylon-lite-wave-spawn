import test from "node:test";
import assert from "node:assert/strict";
import { NullEngine, Scene, TransformNode, Vector3 } from "@babylonjs/core";
import { BishopProjectile } from "../src/projectile.js";

function createFixture({ targetPosition = new Vector3(1, 0, 0) } = {}) {
  const engine = new NullEngine();
  const scene = new Scene(engine);
  const attackerRoot = new TransformNode("attacker", scene);
  attackerRoot.position = Vector3.Zero();
  const targetRoot = new TransformNode("target", scene);
  targetRoot.position = targetPosition;
  const attacker = {
    side: "player",
    hero: { name: "attacker", root: attackerRoot, damage: 1 },
  };
  const target = {
    removed: false,
    hero: {
      root: targetRoot,
      health: 10,
      canTakeDamage: () => true,
      playAnimation: () => {},
      playDamageEffect: () => {},
    },
  };
  return { engine, scene, attacker, target };
}

test("projectile impact disposal reports one cloned final ground position", () => {
  const fixture = createFixture({ targetPosition: Vector3.Zero() });
  const reported = [];
  const projectile = new BishopProjectile(
    fixture.scene,
    fixture.attacker,
    fixture.target,
    () => {},
    null,
    (position) => reported.push(position),
  );

  projectile.update(1 / 60);
  projectile.update(0.13);
  projectile.dispose();

  assert.equal(reported.length, 1);
  assert.notEqual(reported[0], projectile.root.position);
  assert.deepEqual(reported[0].asArray().slice(0, 2), [0, 0]);

  fixture.scene.dispose();
  fixture.engine.dispose();
});

test("missing-target disposal reports the last projectile ground position once", () => {
  const fixture = createFixture();
  const reported = [];
  const projectile = new BishopProjectile(
    fixture.scene,
    fixture.attacker,
    fixture.target,
    () => {},
    null,
    (position) => reported.push(position),
  );
  projectile.root.position.set(1.5, -2.25, 0.2);
  fixture.target.removed = true;

  projectile.update(1 / 60);
  projectile.dispose();

  assert.equal(reported.length, 1);
  assert.deepEqual(reported[0].asArray().slice(0, 2), [1.5, -2.25]);

  fixture.scene.dispose();
  fixture.engine.dispose();
});
