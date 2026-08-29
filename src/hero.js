import {
  MeshBuilder,
  Scene,
  StandardMaterial,
  Texture,
  TransformNode,
  Vector3,
  PhysicsAggregate,
  PhysicsShapeType,
} from "@babylonjs/core";
import { HERO_DAMAGE, HERO_HEALTH } from "./battle-rules.js";

export class Hero {
  constructor(
    name,
    imagePath,
    position,
    scene,
  ) {
    this.name = name;
    this.health = HERO_HEALTH;
    this.damage = HERO_DAMAGE;
    this.scene = scene;
    this.root = new TransformNode(`${name}-root`, scene);

    this.shadowTexture = new Texture("/art/shadow-oval.png", scene);
    this.shadowTexture.updateSamplingMode(Texture.TRILINEAR_SAMPLINGMODE);
    this.shadowTexture.hasAlpha = true;

    this.shadowMaterial = new StandardMaterial(`${name}-shadow-material`, scene);
    this.shadowMaterial.diffuseTexture = this.shadowTexture;
    this.shadowMaterial.emissiveTexture = this.shadowTexture;
    this.shadowMaterial.backFaceCulling = false;
    this.shadowMaterial.useAlphaFromDiffuseTexture = true;

    this.shadow = MeshBuilder.CreatePlane(
      `${name}-shadow`,
      { width: 0.9, height: 0.22 },
      scene,
    );
    this.shadow.parent = this.root;
    this.shadow.material = this.shadowMaterial;
    this.shadow.position = new Vector3(0, -0.43, 0.1);

    this.texture = new Texture(imagePath, scene);
    this.texture.updateSamplingMode(Texture.TRILINEAR_SAMPLINGMODE);
    this.texture.anisotropicFilteringLevel = 16;
    this.texture.hasAlpha = true;

    this.material = new StandardMaterial(`${name}-material`, scene);
    this.material.diffuseTexture = this.texture;
    this.material.emissiveTexture = this.texture;
    this.material.backFaceCulling = false;
    this.material.useAlphaFromDiffuseTexture = true;

    this.sprite = MeshBuilder.CreatePlane(
      name,
      { width: 1, height: 1 },
      scene,
    );
    this.sprite.parent = this.root;
    this.sprite.material = this.material;
    this.root.position = position;
    this.sprite.position.z = 0.2;

    this.physics = new PhysicsAggregate(
      this.sprite,
      PhysicsShapeType.BOX,
      { mass: 1, friction: 0, restitution: 0 },
      scene,
    );
    this.physics.shape.setDensity(1);
    this.physics.body.setCollisionCallbackEnabled(true);
  }

  dispose() {
    this.sprite.dispose();
    this.material.dispose();
    this.texture.dispose();
    this.shadow.dispose();
    this.shadowMaterial.dispose();
    this.shadowTexture.dispose();
    this.physics.dispose();
    this.root.dispose();
  }
}
