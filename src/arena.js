import {
  Color3,
  MeshBuilder,
  StandardMaterial,
  Texture,
  TransformNode,
} from "@babylonjs/core";

export class Arena {
  constructor(scene, backgroundPath = "/field-background.png") {
    this.scene = scene;
    this.root = new TransformNode("arena", scene);

    this.backgroundTexture = new Texture(backgroundPath, scene);
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
    this.background.position.z = 0;
  }

  dispose() {
    this.background.dispose();
    this.backgroundMaterial.dispose();
    this.backgroundTexture.dispose();
    this.root.dispose();
  }
}
