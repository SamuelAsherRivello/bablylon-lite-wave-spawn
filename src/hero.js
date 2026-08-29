import {
  MeshBuilder,
  Scene,
  StandardMaterial,
  Texture,
  Vector3,
} from "@babylonjs/core";

export class Hero {
  constructor(
    name,
    imagePath,
    position,
    scene,
  ) {
    this.name = name;
    this.scene = scene;
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
      { width: 1.3, height: 1.8 },
      scene,
    );
    this.sprite.material = this.material;
    this.sprite.position = position;
    this.sprite.position.z = 0.1;
  }

  dispose() {
    this.sprite.dispose();
    this.material.dispose();
    this.texture.dispose();
  }
}
