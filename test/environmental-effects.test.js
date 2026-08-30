import test from "node:test";
import assert from "node:assert/strict";
import { NullEngine, Scene, Vector3 } from "@babylonjs/core";
import {
  EnvironmentalEffects,
  GROUND_CRACK_EFFECT,
  groundCrackScaleForDamage,
} from "../src/environmental-effects.js";
import {
  ENVIRONMENT_EFFECT_Z,
  GROUND_Z,
  SHADOW_Z,
} from "../src/depth.js";

function createScene() {
  const engine = new NullEngine();
  return { engine, scene: new Scene(engine) };
}

test("ground cracks use one shared transparent definition at the requested ground positions", () => {
  const { engine, scene } = createScene();
  const effects = new EnvironmentalEffects(scene);
  const suppliedPosition = new Vector3(1.25, -2.5, -99);

  const first = effects.create(GROUND_CRACK_EFFECT, suppliedPosition);
  const second = effects.create(GROUND_CRACK_EFFECT, new Vector3(-1, 3, 99));

  suppliedPosition.set(8, 8, 8);
  assert.deepEqual(first.position.asArray(), [1.25, -2.5, ENVIRONMENT_EFFECT_Z]);
  assert.deepEqual(second.position.asArray(), [-1, 3, ENVIRONMENT_EFFECT_Z]);
  assert.deepEqual(first.scaling.asArray(), [0.5, 0.5, 0.5]);
  assert.equal(first.material, second.material);
  assert.equal(first.material.alpha, 1);
  assert.equal(first.material.diffuseTexture.hasAlpha, true);
  assert.equal(first.material.useAlphaFromDiffuseTexture, true);
  assert.equal(first.isPickable, false);
  assert.equal(effects.instances.size, 2);

  effects.dispose();
  scene.dispose();
  engine.dispose();
});

test("ground effects persist until idempotent owner disposal releases all resources", () => {
  const { engine, scene } = createScene();
  const effects = new EnvironmentalEffects(scene);
  const first = effects.create(GROUND_CRACK_EFFECT, Vector3.Zero());
  const second = effects.create(GROUND_CRACK_EFFECT, Vector3.One());
  const material = first.material;
  const texture = material.diffuseTexture;

  assert.equal(first.isDisposed(), false);
  assert.equal(second.isDisposed(), false);

  effects.dispose();
  effects.dispose();

  assert.equal(first.isDisposed(), true);
  assert.equal(second.isDisposed(), true);
  assert.equal(scene.materials.includes(material), false);
  assert.equal(scene.textures.includes(texture), false);
  assert.equal(effects.instances.size, 0);
  assert.equal(effects.disposed, true);

  scene.dispose();
  engine.dispose();
});

test("each ground crack independently rotates through the full circle around its center", () => {
  const { engine, scene } = createScene();
  const samples = [0, 0.25, 0.999];
  const effects = new EnvironmentalEffects(scene, () => samples.shift());

  const first = effects.create(GROUND_CRACK_EFFECT, new Vector3(1, 2, 3));
  const second = effects.create(GROUND_CRACK_EFFECT, new Vector3(1, 2, 3));
  const third = effects.create(GROUND_CRACK_EFFECT, new Vector3(1, 2, 3));

  assert.equal(first.rotation.z, 0);
  assert.equal(second.rotation.z, Math.PI / 2);
  assert.equal(third.rotation.z, Math.PI * 2 * 0.999);
  assert.ok(first.getPivotPoint().asArray().every((value) => value === 0));
  assert.deepEqual(second.position.asArray(), first.position.asArray());
  assert.deepEqual(second.scaling.asArray(), first.scaling.asArray());
  assert.equal(second.material, first.material);

  effects.dispose();
  scene.dispose();
  engine.dispose();
});

test("ground crack damage maps linearly from baseline through 150 percent", () => {
  assert.equal(groundCrackScaleForDamage(0), 0.5);
  assert.equal(groundCrackScaleForDamage(10), 0.5);
  assert.equal(groundCrackScaleForDamage(20), 0.625);
  assert.equal(groundCrackScaleForDamage(30), 0.75);
  assert.equal(groundCrackScaleForDamage(100), 0.75);
  assert.equal(groundCrackScaleForDamage(Number.NaN), 0.5);
  assert.equal(groundCrackScaleForDamage(undefined), 0.5);
});

test("ground crack meshes apply damage scale without changing other visual invariants", () => {
  const { engine, scene } = createScene();
  const effects = new EnvironmentalEffects(scene, () => 0.25);

  const baseline = effects.create(
    GROUND_CRACK_EFFECT,
    new Vector3(1, 2, 3),
    { damage: 10 },
  );
  const maximum = effects.create(
    GROUND_CRACK_EFFECT,
    new Vector3(1, 2, 3),
    { damage: 30 },
  );

  assert.deepEqual(baseline.scaling.asArray(), [0.5, 0.5, 0.5]);
  assert.deepEqual(maximum.scaling.asArray(), [0.75, 0.75, 0.75]);
  assert.equal(maximum.rotation.z, baseline.rotation.z);
  assert.deepEqual(maximum.position.asArray(), baseline.position.asArray());
  assert.equal(maximum.material, baseline.material);
  assert.equal(maximum.material.alpha, 1);

  effects.dispose();
  scene.dispose();
  engine.dispose();
});

test("scene disposal also disposes its environmental effects owner", () => {
  const { engine, scene } = createScene();
  const effects = new EnvironmentalEffects(scene);
  const instance = effects.create(GROUND_CRACK_EFFECT, Vector3.Zero());

  scene.dispose();

  assert.equal(effects.disposed, true);
  assert.equal(instance.isDisposed(), true);
  engine.dispose();
});

test("the environmental band stays above the background and below all shadows", () => {
  assert.ok(GROUND_Z > ENVIRONMENT_EFFECT_Z);
  assert.ok(ENVIRONMENT_EFFECT_Z > SHADOW_Z);
});
