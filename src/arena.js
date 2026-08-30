import {
  Color3,
  MeshBuilder,
  PhysicsAggregate,
  PhysicsShapeType,
  StandardMaterial,
  Texture,
  TransformNode,
  Vector3,
} from "@babylonjs/core";
import { GROUND_Z } from "./depth.js";
import { ARENAS, WALL_DEFINITIONS } from "./arena-config.js";
const ASSET_BASE = import.meta.env?.BASE_URL ?? "/";

export class Arena {
  constructor(
    scene,
    arenaConfig = ARENAS[0],
    { debugColliders = new URLSearchParams(globalThis.location?.search ?? "").get("debugColliders") === "1" } = {},
  ) {
    this.scene = scene;
    this.config = arenaConfig;
    this.root = new TransformNode(`arena-${arenaConfig.id}`, scene);
    this.wallMeshes = [];
    this.wallPhysics = [];
    this.debugMeshes = [];

    this.backgroundTexture = new Texture(`${ASSET_BASE}${arenaConfig.backgroundPath}`, scene);
    this.backgroundTexture.updateSamplingMode(Texture.TRILINEAR_SAMPLINGMODE);
    this.backgroundTexture.anisotropicFilteringLevel = 16;

    this.backgroundMaterial = new StandardMaterial("arena-background-material", scene);
    this.backgroundMaterial.diffuseTexture = this.backgroundTexture;
    this.backgroundMaterial.emissiveTexture = this.backgroundTexture;
    this.backgroundMaterial.emissiveColor = Color3.White();
    this.backgroundMaterial.backFaceCulling = false;

    this.background = MeshBuilder.CreatePlane(
      "arena-background",
      { width: 9, height: 16 },
      scene,
    );
    this.background.parent = this.root;
    this.background.material = this.backgroundMaterial;
    // The camera views from negative Z, so larger Z values are farther away.
    this.background.position.z = GROUND_Z;

    this.createWalls(debugColliders);
  }

  createWalls(debugColliders) {
    if (debugColliders) {
      this.debugMaterial = new StandardMaterial("arena-wall-debug-material", this.scene);
      this.debugMaterial.diffuseColor = new Color3(1, 0.05, 0.05);
      this.debugMaterial.emissiveColor = new Color3(1, 0.05, 0.05);
      this.debugMaterial.alpha = 0.36;
      this.debugMaterial.backFaceCulling = false;
    }

    WALL_DEFINITIONS.forEach((wall) => {
      const mesh = MeshBuilder.CreateBox(
        `arena-wall-${wall.side}`,
        { width: wall.width, height: wall.height, depth: 1 },
        this.scene,
      );
      mesh.parent = this.root;
      mesh.position = new Vector3(wall.x, wall.y, 0);
      mesh.visibility = 0;
      this.wallMeshes.push(mesh);
      this.wallPhysics.push(new PhysicsAggregate(
        mesh,
        PhysicsShapeType.BOX,
        { mass: wall.mass, friction: wall.friction, restitution: wall.restitution },
        this.scene,
      ));

      if (!debugColliders) return;
      const debugMesh = MeshBuilder.CreatePlane(
        `arena-wall-debug-${wall.side}`,
        { width: wall.width, height: wall.height },
        this.scene,
      );
      debugMesh.parent = this.root;
      debugMesh.position = new Vector3(wall.x, wall.y, GROUND_Z - 0.02);
      debugMesh.material = this.debugMaterial;
      debugMesh.isPickable = false;
      this.debugMeshes.push(debugMesh);
    });
  }

  getPhysicsBodies() {
    return this.wallPhysics.map((physics) => physics.body).filter(Boolean);
  }

  dispose() {
    this.wallPhysics.forEach((physics) => physics.dispose());
    this.wallMeshes.forEach((mesh) => mesh.dispose());
    this.debugMeshes.forEach((mesh) => mesh.dispose());
    this.debugMaterial?.dispose();
    this.background.dispose();
    this.backgroundMaterial.dispose();
    this.backgroundTexture.dispose();
    this.root.dispose();
  }
}
