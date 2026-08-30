import {
  Color3,
  MeshBuilder,
  StandardMaterial,
  Texture,
  TransformNode,
  Vector3,
} from "@babylonjs/core";

export const DAMAGE_CLOUD_CONFIG = {
  texturePath: "/art/cloud-puff.png",
  count: 5,
  minimumSize: 0.055,
  maximumSize: 0.09,
  minimumLifetimeSeconds: 0.32,
  maximumLifetimeSeconds: 0.52,
  minimumDelaySeconds: 0,
  maximumDelaySeconds: 0.08,
  horizontalRange: 0.34,
  verticalRange: 0.42,
  z: 0.04,
};

export function fadeOpacity(progress) {
  if (progress <= 0 || progress >= 1) return 0;
  return progress < 0.5 ? progress * 2 : (1 - progress) * 2;
}

function randomBetween(random, minimum, maximum) {
  return minimum + random() * (maximum - minimum);
}

export class DamageCloudEffect {
  constructor(scene, parent, config = DAMAGE_CLOUD_CONFIG, random = Math.random) {
    this.scene = scene;
    this.config = config;
    this.random = random;
    this.particles = [];
    this.root = new TransformNode("damage-clouds", scene);
    this.root.parent = parent;
    this.texture = new Texture(config.texturePath, scene);
    this.texture.hasAlpha = true;
    this.material = new StandardMaterial("damage-cloud-material", scene);
    this.material.diffuseTexture = this.texture;
    this.material.emissiveTexture = this.texture;
    this.material.diffuseColor = new Color3(1, 1, 1);
    this.material.emissiveColor = new Color3(1, 1, 1);
    this.material.useAlphaFromDiffuseTexture = true;
    this.material.backFaceCulling = false;
    this.observer = scene.onBeforeRenderObservable.add(() => {
      this.update(scene.getEngine().getDeltaTime() / 1000);
    });
  }

  spawnDamageCloudBurst() {
    this.clear();
    for (let index = 0; index < this.config.count; index += 1) {
      const size = randomBetween(this.random, this.config.minimumSize, this.config.maximumSize);
      const mesh = MeshBuilder.CreatePlane(`damage-cloud-${index}`, { size }, this.scene);
      mesh.parent = this.root;
      mesh.position = new Vector3(
        randomBetween(this.random, -this.config.horizontalRange, this.config.horizontalRange),
        randomBetween(this.random, -this.config.verticalRange, this.config.verticalRange),
        this.config.z,
      );
      mesh.material = this.material;
      mesh.visibility = 0;
      this.particles.push({
        mesh,
        age: -randomBetween(this.random, this.config.minimumDelaySeconds, this.config.maximumDelaySeconds),
        lifetime: randomBetween(this.random, this.config.minimumLifetimeSeconds, this.config.maximumLifetimeSeconds),
      });
    }
  }

  update(deltaSeconds) {
    this.particles = this.particles.filter((particle) => {
      particle.age += deltaSeconds;
      const progress = particle.age / particle.lifetime;
      particle.mesh.visibility = fadeOpacity(progress);
      if (progress >= 1) {
        particle.mesh.dispose();
        return false;
      }
      return true;
    });
  }

  clear() {
    this.particles.forEach(({ mesh }) => mesh.dispose());
    this.particles = [];
  }

  dispose() {
    this.clear();
    this.scene.onBeforeRenderObservable.remove(this.observer);
    this.root.dispose();
    this.material.dispose();
    this.texture.dispose();
  }
}
