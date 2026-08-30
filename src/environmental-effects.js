import {
  Color3,
  MeshBuilder,
  StandardMaterial,
  Texture,
  TransformNode,
  Vector3,
} from "@babylonjs/core";
import { ENVIRONMENT_EFFECT_Z } from "./depth.js";

const ASSET_BASE = import.meta.env?.BASE_URL ?? "/";

export const GROUND_CRACK_EFFECT = "ground-crack";

export const ENVIRONMENTAL_EFFECT_DEFINITIONS = Object.freeze({
  [GROUND_CRACK_EFFECT]: Object.freeze({
    texturePath: `${ASSET_BASE}art/environmental/ground-crack.png`,
    size: 1,
    baselineScale: 0.5,
    minimumDamage: 10,
    maximumDamage: 30,
    maximumSizeMultiplier: 1.5,
    opacity: 1,
    z: ENVIRONMENT_EFFECT_Z,
  }),
});

export function groundCrackScaleForDamage(damage) {
  const definition = ENVIRONMENTAL_EFFECT_DEFINITIONS[GROUND_CRACK_EFFECT];
  const safeDamage = Number.isFinite(damage) ? damage : definition.minimumDamage;
  const clampedDamage = Math.min(
    definition.maximumDamage,
    Math.max(definition.minimumDamage, safeDamage),
  );
  const progress = (clampedDamage - definition.minimumDamage)
    / (definition.maximumDamage - definition.minimumDamage);
  const multiplier = 1 + progress * (definition.maximumSizeMultiplier - 1);
  return definition.baselineScale * multiplier;
}

export class EnvironmentalEffects {
  constructor(scene, random = Math.random) {
    this.scene = scene;
    this.random = random;
    this.instances = new Set();
    this.resources = new Map();
    this.disposed = false;
    this.root = new TransformNode("environmental-effects", scene);
    this.sceneDisposeObserver = scene.onDisposeObservable.add(() => this.dispose());
  }

  create(type, position, { damage } = {}) {
    if (this.disposed) throw new Error("Environmental effects owner is disposed");
    const definition = ENVIRONMENTAL_EFFECT_DEFINITIONS[type];
    if (!definition) throw new Error(`Unknown environmental effect: ${type}`);

    const { material } = this.getResources(type, definition);
    const instance = MeshBuilder.CreatePlane(
      `${type}-${this.instances.size}`,
      { size: definition.size },
      this.scene,
    );
    instance.parent = this.root;
    instance.position = new Vector3(position.x, position.y, definition.z);
    const scale = type === GROUND_CRACK_EFFECT
      ? groundCrackScaleForDamage(damage)
      : definition.baselineScale;
    instance.scaling.setAll(scale);
    instance.rotation.z = this.random() * Math.PI * 2;
    instance.material = material;
    instance.isPickable = false;
    this.instances.add(instance);
    return instance;
  }

  getResources(type, definition) {
    const existing = this.resources.get(type);
    if (existing) return existing;

    const texture = new Texture(definition.texturePath, this.scene);
    texture.hasAlpha = true;

    const material = new StandardMaterial(`${type}-material`, this.scene);
    material.diffuseTexture = texture;
    material.emissiveTexture = texture;
    material.diffuseColor = Color3.White();
    material.emissiveColor = Color3.White();
    material.useAlphaFromDiffuseTexture = true;
    material.backFaceCulling = false;
    material.alpha = definition.opacity;

    const resources = { texture, material };
    this.resources.set(type, resources);
    return resources;
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.scene.onDisposeObservable.remove(this.sceneDisposeObserver);
    this.instances.forEach((instance) => instance.dispose());
    this.instances.clear();
    this.resources.forEach(({ material, texture }) => {
      material.dispose();
      texture.dispose();
    });
    this.resources.clear();
    this.root.dispose();
  }
}
