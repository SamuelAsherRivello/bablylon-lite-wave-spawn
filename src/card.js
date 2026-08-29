import {
  Color3,
  MeshBuilder,
  StandardMaterial,
  TransformNode,
  Vector3,
} from "@babylonjs/core";
import { Hero } from "./hero.js";

export class Card {
  constructor(name, heroImagePath, position, scene) {
    this.scene = scene;
    this.root = new TransformNode(`${name}-root`, scene);
    this.root.position = position;

    this.mesh = MeshBuilder.CreatePlane(
      name,
      { width: 1.2, height: 1.8 },
      scene,
    );
    this.mesh.parent = this.root;
    this.mesh.position.z = 0;
    this.material = new StandardMaterial(`${name}-material`, scene);
    this.material.diffuseColor = new Color3(0.97, 0.96, 0.93);
    this.material.emissiveColor = this.material.diffuseColor;
    this.mesh.material = this.material;

    this.hero = new Hero(`${name}-hero`, heroImagePath, Vector3.Zero(), scene);
    this.hero.root.parent = this.root;
  }

  dispose() {
    this.hero.dispose();
    this.mesh.dispose();
    this.material.dispose();
    this.root.dispose();
  }
}
