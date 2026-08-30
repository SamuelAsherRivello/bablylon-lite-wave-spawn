import {
  Color3,
  MeshBuilder,
  Scene,
  StandardMaterial,
  ShaderMaterial,
  Texture,
  TransformNode,
  Vector3,
  Vector2,
  PhysicsAggregate,
  PhysicsShapeType,
} from "@babylonjs/core";
import { HERO_ANGULAR_DAMPING, HERO_CLASSES } from "./battle-rules.js";
import {
  HERO_ANIMATION_STATES,
  HeroAnimationController,
} from "./hero-animation.js";
import { DamageCloudEffect } from "./particle-effects.js";
import { depthForY, HERO_Z, SHADOW_Z } from "./depth.js";

export class Hero {
  constructor(
    name,
    imagePath,
    position,
    scene,
    classId = "rook",
    side = null,
  ) {
    this.name = name;
    const stats = HERO_CLASSES[classId] ?? HERO_CLASSES.rook;
    this.classId = classId;
    this.profile = stats;
    this.health = stats.health;
    this.maxHealth = stats.health;
    this.speed = stats.speed;
    this.damage = stats.damage;
    this.damageCooldownRemaining = 0;
    this.scene = scene;
    this.disposed = false;
    this.deathCompleteCallback = null;
    this.root = new TransformNode(`${name}-root`, scene);
    this.physicsPlaneZ = depthForY(HERO_Z, position.y);

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
    this.shadow.position = new Vector3(0, -0.43, SHADOW_Z - HERO_Z);

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
    this.root.position.z = depthForY(HERO_Z, position.y);
    this.sprite.position.z = 0;

    this.animationController = new HeroAnimationController({
      visual: {
        setOffset: (x, y) => {
          this.sprite.position.x = x;
          this.sprite.position.y = y;
        },
        setRotation: (rotation) => {
          this.sprite.rotation.z = rotation;
        },
        setScale: (scale) => {
          this.sprite.scaling.x = scale;
          this.sprite.scaling.y = scale;
        },
        setBlinkColor: (color) => {
          this.material.diffuseColor = color
            ? Color3.FromHexString(color)
            : new Color3(1, 1, 1);
          this.material.emissiveColor = color
            ? Color3.FromHexString(color)
            : new Color3(0, 0, 0);
        },
      },
      onDeathComplete: () => {
        const callback = this.deathCompleteCallback;
        this.deathCompleteCallback = null;
        callback?.();
      },
    });
    this.animationObserver = scene.onBeforeRenderObservable.add(() => {
      this.damageCooldownRemaining = Math.max(
        0,
        this.damageCooldownRemaining - scene.getEngine().getDeltaTime() / 1000,
      );
      this.animationController.update(scene.getEngine().getDeltaTime() / 1000);
    });
    this.damageCloudEffect = new DamageCloudEffect(scene, this.root);

    if (side) {
      this.glow = MeshBuilder.CreatePlane(`${name}-glow`, { width: 1, height: 1 }, scene);
      this.glow.parent = this.root;
      this.glow.position.z = SHADOW_Z - HERO_Z;
      this.glow.scaling = new Vector3(1, 1, 1);
      this.glowMaterial = new ShaderMaterial(`${name}-glow-material`, scene, {
        vertexSource: "precision highp float; attribute vec3 position; attribute vec2 uv; uniform mat4 worldViewProjection; varying vec2 vUV; void main(void) { vUV = uv; gl_Position = worldViewProjection * vec4(position, 1.0); }",
        fragmentSource: "precision highp float; varying vec2 vUV; uniform sampler2D textureSampler; uniform vec2 texelSize; uniform vec3 outlineColor; void main(void) { float alpha = texture2D(textureSampler, vUV).a; float neighborAlpha = 0.0; neighborAlpha = max(neighborAlpha, texture2D(textureSampler, vUV + vec2(texelSize.x, 0.0)).a); neighborAlpha = max(neighborAlpha, texture2D(textureSampler, vUV - vec2(texelSize.x, 0.0)).a); neighborAlpha = max(neighborAlpha, texture2D(textureSampler, vUV + vec2(0.0, texelSize.y)).a); neighborAlpha = max(neighborAlpha, texture2D(textureSampler, vUV - vec2(0.0, texelSize.y)).a); if (alpha > 0.1 || neighborAlpha <= 0.1) discard; gl_FragColor = vec4(outlineColor, neighborAlpha); }",
      }, {
        attributes: ["position", "uv"],
        uniforms: ["worldViewProjection", "texelSize", "outlineColor"],
        samplers: ["textureSampler"],
      });
      this.glowMaterial.setTexture("textureSampler", this.texture);
      const textureSize = this.texture.getSize();
      this.glowMaterial.setVector2("texelSize", new Vector2(1 / textureSize.width, 1 / textureSize.height));
      this.glowMaterial.setColor3("outlineColor", side === "enemy"
        ? new Color3(0.95, 0.05, 0.05)
        : new Color3(0.05, 0.3, 1));
      this.glowMaterial.backFaceCulling = false;
      this.glowMaterial.alphaMode = 2;
      this.glow.material = this.glowMaterial;
    }

    this.physics = new PhysicsAggregate(
      this.root,
      PhysicsShapeType.BOX,
      { mass: 1, friction: 0, restitution: 0, extents: new Vector3(0.58, 0.84, 0.2) },
      scene,
    );
    // Prevent the body from rotating on any axis.
    this.physics.body.setMassProperties({
      mass: 1,
      inertia: Vector3.Zero(),
    });
    this.physics.body.setAngularDamping(HERO_ANGULAR_DAMPING);
    this.physics.body.setCollisionCallbackEnabled(true);

    // Havok has no per-axis velocity lock on PhysicsBody. Enforce the planar
    // restriction after each physics step so collisions cannot rotate the hero.
    this.physicsObserver = scene.onAfterPhysicsObservable.add(() => {
      if (this.physics?.body) {
        const linearVelocity = this.physics.body.getLinearVelocity();
        this.physics.body.setLinearVelocity(
          new Vector3(linearVelocity.x, linearVelocity.y, 0),
        );
        this.physics.body.setAngularVelocity(Vector3.Zero());
        this.root.position.z = depthForY(HERO_Z, this.root.position.y);
      }
    });

  }

  playAnimation(state, onComplete = null) {
    if (this.disposed) return;
    if (state === HERO_ANIMATION_STATES.DEAD) {
      this.deathCompleteCallback = onComplete;
    }
    this.animationController.requestState(state);
  }

  playDamageEffect() {
    if (!this.disposed) this.damageCloudEffect.spawnDamageCloudBurst();
  }

  canTakeDamage() {
    if (this.disposed || this.damageCooldownRemaining > 0) return false;
    this.damageCooldownRemaining = 0.2;
    return true;
  }

  disablePhysics() {
    if (!this.physics) return;
    if (this.physicsObserver) {
      this.scene.onAfterPhysicsObservable.remove(this.physicsObserver);
      this.physicsObserver = null;
    }
    this.physics.body.setCollisionCallbackEnabled(false);
    this.physics.body.setLinearVelocity(Vector3.Zero());
    this.physics.body.setAngularVelocity(Vector3.Zero());
    this.physics.dispose();
    this.physics = null;
    this.root.metadata = null;
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    if (this.animationObserver) {
      this.scene.onBeforeRenderObservable.remove(this.animationObserver);
      this.animationObserver = null;
    }
    this.disablePhysics();
    this.damageCloudEffect.dispose();
    this.sprite.dispose();
    this.material.dispose();
    this.texture.dispose();
    this.glow?.dispose();
    this.glowMaterial?.dispose();
    this.shadow.dispose();
    this.shadowMaterial.dispose();
    this.shadowTexture.dispose();
    this.root.dispose();
  }

  updateDepthSort() {
    if (!this.disposed) this.root.position.z = depthForY(HERO_Z, this.root.position.y);
  }
}
