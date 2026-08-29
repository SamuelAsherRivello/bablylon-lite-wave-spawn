import {
  Color3,
  Color4,
  Engine,
  FreeCamera,
  Texture,
  MeshBuilder,
  Scene,
  StandardMaterial,
  Vector3,
} from "@babylonjs/core";
import { Hero } from "./hero.js";
import "./style.css";

const canvas = document.querySelector("#renderCanvas");
const engine = new Engine(
  canvas,
  true,
  { preserveDrawingBuffer: true },
  true,
);
const scene = new Scene(engine);
scene.clearColor = new Color4(0.035, 0.047, 0.075, 1);

const camera = new FreeCamera("locked-camera", new Vector3(0, 0, 10), scene);
camera.setTarget(Vector3.Zero());
camera.mode = FreeCamera.ORTHOGRAPHIC_CAMERA;
camera.orthoLeft = -4.5;
camera.orthoRight = 4.5;
camera.orthoBottom = -8;
camera.orthoTop = 8;

const backgroundMaterial = new StandardMaterial("background-material", scene);
const backgroundTexture = new Texture("/field-background.png", scene);
backgroundTexture.updateSamplingMode(Texture.TRILINEAR_SAMPLINGMODE);
backgroundTexture.anisotropicFilteringLevel = 16;
backgroundMaterial.diffuseTexture = backgroundTexture;
backgroundMaterial.emissiveTexture = backgroundTexture;
backgroundMaterial.emissiveColor = Color3.White();
backgroundMaterial.backFaceCulling = false;
const background = MeshBuilder.CreatePlane(
  "field-background",
  { width: 9, height: 16 },
  scene,
);
background.material = backgroundMaterial;
background.position.z = 0;

const markerMaterial = new StandardMaterial("origin-marker-material", scene);
markerMaterial.diffuseColor = new Color3(1, 0.15, 0.1);
markerMaterial.emissiveColor = new Color3(0.5, 0.02, 0.01);
markerMaterial.backFaceCulling = false;
const originMarker = MeshBuilder.CreatePlane(
  "origin-marker",
  { width: 0.3, height: 0.3 },
  scene,
);
originMarker.material = markerMaterial;
originMarker.position.z = 0.05;

const heroes = [
  new Hero(
    "light-bishop",
    "/art/heroes/light-bishop-v1.png",
    new Vector3(-2.2, -4.4, 0),
    scene,
  ),
  new Hero(
    "light-pawn",
    "/art/heroes/light-pawn-v2.png",
    new Vector3(0, 0, 0),
    scene,
  ),
  new Hero(
    "light-rook",
    "/art/heroes/light-rook-v2.png",
    new Vector3(2.2, 4.4, 0),
    scene,
  ),
];

void heroes;

engine.runRenderLoop(() => scene.render());
window.addEventListener("resize", () => engine.resize());
