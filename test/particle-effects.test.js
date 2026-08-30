import test from "node:test";
import assert from "node:assert/strict";
import { NullEngine, Scene, TransformNode } from "@babylonjs/core";
import {
  DAMAGE_CLOUD_CONFIG,
  DamageCloudEffect,
  fadeOpacity,
} from "../src/particle-effects.js";
import { heroDepthForPivotY } from "../src/depth.js";

function createDamageCloud(randomValue) {
  const engine = new NullEngine();
  const scene = new Scene(engine);
  const parent = new TransformNode("hero", scene);
  const effect = new DamageCloudEffect(
    scene,
    parent,
    DAMAGE_CLOUD_CONFIG,
    () => randomValue,
  );

  effect.spawnDamageCloudBurst();
  return { effect, engine, parent, scene };
}

function disposeDamageCloud({ effect, engine, parent, scene }) {
  effect.dispose();
  parent.dispose();
  scene.dispose();
  engine.dispose();
}

function particleSize(particle) {
  return particle.mesh.getBoundingInfo().boundingBox.extendSize.x * 2;
}

test("damage cloud variation uses enlarged bounded sizes and offsets", () => {
  const minimum = createDamageCloud(0);
  const midpoint = createDamageCloud(0.5);
  const maximum = createDamageCloud(1);

  try {
    assert.equal(DAMAGE_CLOUD_CONFIG.count, 5);
    assert.equal(DAMAGE_CLOUD_CONFIG.minimumSize, 1.65);
    assert.equal(DAMAGE_CLOUD_CONFIG.maximumSize, 2.7);
    assert.equal(DAMAGE_CLOUD_CONFIG.horizontalRange, 0.255);
    assert.equal(DAMAGE_CLOUD_CONFIG.verticalRange, 0.315);

    assert.equal(minimum.effect.particles.length, DAMAGE_CLOUD_CONFIG.count);
    assert.equal(particleSize(minimum.effect.particles[0]), 1.65);
    assert.deepEqual(
      minimum.effect.particles[0].mesh.position.asArray().slice(0, 2),
      [-0.255, -0.315],
    );

    assert.equal(
      particleSize(midpoint.effect.particles[0]),
      (DAMAGE_CLOUD_CONFIG.minimumSize + DAMAGE_CLOUD_CONFIG.maximumSize) / 2,
    );
    assert.deepEqual(
      midpoint.effect.particles[0].mesh.position.asArray().slice(0, 2),
      [0, 0],
    );

    assert.equal(particleSize(maximum.effect.particles[0]), 2.7);
    assert.deepEqual(
      maximum.effect.particles[0].mesh.position.asArray().slice(0, 2),
      [0.255, 0.315],
    );
  } finally {
    disposeDamageCloud(minimum);
    disposeDamageCloud(midpoint);
    disposeDamageCloud(maximum);
  }
});

test("damage clouds fade in and back out", () => {
  assert.equal(fadeOpacity(0), 0);
  assert.equal(fadeOpacity(0.25), 0.5);
  assert.equal(fadeOpacity(0.5), 1);
  assert.equal(fadeOpacity(0.75), 0.5);
  assert.equal(fadeOpacity(1), 0);
});

test("a cloud is in front of its owner without bypassing hero Y sorting", () => {
  const ownerDepth = heroDepthForPivotY(0);
  const ownerCloudDepth = ownerDepth + DAMAGE_CLOUD_CONFIG.z;
  const lowerHeroDepth = heroDepthForPivotY(-2);

  assert.equal(DAMAGE_CLOUD_CONFIG.z, -1);
  assert.ok(ownerCloudDepth < ownerDepth);
  assert.ok(lowerHeroDepth < ownerCloudDepth);
});

test("damage cloud lifecycle clears completed particles and owned resources", () => {
  const fixture = createDamageCloud(0.5);

  try {
    const { effect } = fixture;
    const particle = effect.particles[0];
    const { material, root, scene, texture } = effect;

    assert.equal(particle.mesh.parent, effect.root);
    assert.equal(particle.mesh.position.z, DAMAGE_CLOUD_CONFIG.z);
    assert.equal(particle.mesh.material, effect.material);
    assert.equal(particle.mesh.visibility, 0);

    effect.update(DAMAGE_CLOUD_CONFIG.maximumLifetimeSeconds + 1);
    assert.equal(effect.particles.length, 0);
    assert.equal(particle.mesh.isDisposed(), true);

    effect.dispose();
    assert.equal(root.isDisposed(), true);
    assert.equal(scene.materials.includes(material), false);
    assert.equal(scene.textures.includes(texture), false);
  } finally {
    disposeDamageCloud(fixture);
  }
});
