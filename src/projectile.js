import { Color3, MeshBuilder, StandardMaterial, TransformNode, Vector3 } from "@babylonjs/core";
import { HERO_ANIMATION_STATES } from "./hero-animation.js";
import { RANGED_PROJECTILE_SPEED } from "./battle-rules.js";

export class BishopProjectile {
  constructor(scene, attacker, target, onHit) {
    this.scene = scene;
    this.attacker = attacker;
    this.target = target;
    this.onHit = onHit;
    this.elapsed = 0;
    this.hit = false;
    this.start = attacker.hero.root.position.clone();
    this.root = new TransformNode(`${attacker.hero.name}-projectile`, scene);
    this.root.position = this.start.clone();
    this.root.position.z = attacker.hero.physicsPlaneZ + 0.45;
    this.collider = MeshBuilder.CreateDisc(`${this.root.name}-collider`, { radius: 0.16, tessellation: 20 }, scene);
    this.collider.parent = this.root;
    this.collider.isVisible = false;
    this.collider.metadata = { projectile: this };
    this.mesh = MeshBuilder.CreateDisc(`${this.root.name}-body-art`, { radius: 0.13, tessellation: 20 }, scene);
    this.mesh.parent = this.root;
    this.shadow = MeshBuilder.CreateDisc(`${this.root.name}-shadow`, { radius: 0.18, tessellation: 20 }, scene);
    this.shadow.parent = this.root;
    this.shadow.position.z = -0.02;
    this.shadow.scaling = new Vector3(1.35, 0.55, 1);
    this.shadowMaterial = new StandardMaterial(`${this.root.name}-shadow-material`, scene);
    this.shadowMaterial.diffuseColor = new Color3(0, 0, 0);
    this.shadowMaterial.alpha = 0.3;
    this.shadow.material = this.shadowMaterial;
    this.material = new StandardMaterial(`${this.mesh.name}-material`, scene);
    this.material.diffuseColor = attacker.side === "enemy" ? new Color3(0.95, 0.05, 0.05) : new Color3(0.05, 0.3, 1);
    this.material.emissiveColor = this.material.diffuseColor;
    this.mesh.material = this.material;
    this.observer = scene.onBeforeRenderObservable.add(() => this.update(scene.getEngine().getDeltaTime() / 1000));
  }

  update(deltaSeconds) {
    if (this.hit) {
      this.elapsed += deltaSeconds;
      this.mesh.scaling.scaleInPlace(Math.max(0, 1 - deltaSeconds * 12));
      this.shadow.scaling.scaleInPlace(Math.max(0, 1 - deltaSeconds * 8));
      if (this.elapsed >= 0.12) this.dispose();
      return;
    }
    if (!this.target || this.target.removed) return this.dispose();
    const targetPosition = this.target.hero.root.position;
    const distance = Vector3.Distance(this.start, targetPosition);
    this.elapsed += deltaSeconds;
    const progress = Math.min(1, (this.elapsed * RANGED_PROJECTILE_SPEED) / Math.max(distance, 0.01));
    const groundPosition = Vector3.Lerp(this.start, targetPosition, progress);
    this.root.position.x = groundPosition.x;
    this.root.position.y = groundPosition.y;
    // The root and collider stay on the ground path. Faux height is represented
    // by lifting body art in screen Y while its shadow remains attached to root.
    const fauxHeight = Math.sin(progress * Math.PI) * 0.9;
    this.mesh.position.y = fauxHeight;
    this.mesh.scaling.x = 1 + fauxHeight * 0.12;
    this.mesh.scaling.y = 1 + fauxHeight * 0.12;
    if (progress >= 1 || Vector3.Distance(this.root.position, targetPosition) < 0.35) {
      this.hit = true;
      this.elapsed = 0;
      this.material.diffuseColor = new Color3(1, 1, 1);
      this.material.emissiveColor = new Color3(1, 1, 1);
      if (this.target.hero.canTakeDamage()) {
        this.onHit(this.target, this.attacker);
        if (!this.target.removed) {
          this.target.hero.playAnimation(HERO_ANIMATION_STATES.TAKE_DAMAGE);
          this.target.hero.playDamageEffect();
        }
      }
    }
  }

  dispose() {
    if (!this.mesh) return;
    this.scene.onBeforeRenderObservable.remove(this.observer);
    this.mesh.dispose();
    this.collider.dispose();
    this.shadow.dispose();
    this.shadowMaterial.dispose();
    this.material.dispose();
    this.root.dispose();
    this.mesh = null;
  }
}
