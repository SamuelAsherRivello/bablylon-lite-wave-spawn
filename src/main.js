import {
  ArcRotateCamera,
  Color3,
  Color4,
  DirectionalLight,
  Engine,
  HemisphericLight,
  MeshBuilder,
  Scene,
  StandardMaterial,
  Vector3,
} from "@babylonjs/core";
import "./style.css";

const canvas = document.querySelector("#renderCanvas");
const engine = new Engine(canvas, true, { preserveDrawingBuffer: true });
const scene = new Scene(engine);
scene.clearColor = new Color4(0.035, 0.047, 0.075, 1);

const camera = new ArcRotateCamera(
  "camera",
  -Math.PI / 2,
  Math.PI / 3,
  8,
  new Vector3(0, 0.7, 0),
  scene,
);
camera.attachControl(canvas, true);
camera.lowerRadiusLimit = 5;
camera.upperRadiusLimit = 11;
camera.wheelPrecision = 80;

new HemisphericLight("ambient", new Vector3(0, 1, 0), scene).intensity = 0.8;
const keyLight = new DirectionalLight("key", new Vector3(-1, -2, -1), scene);
keyLight.position = new Vector3(3, 6, 4);
keyLight.intensity = 1.6;

const groundMaterial = new StandardMaterial("ground-material", scene);
groundMaterial.diffuseColor = new Color3(0.08, 0.12, 0.19);
groundMaterial.specularColor = new Color3(0.12, 0.18, 0.3);
const ground = MeshBuilder.CreateGround("ground", { width: 6, height: 6 }, scene);
ground.material = groundMaterial;

const crystalMaterial = new StandardMaterial("crystal-material", scene);
crystalMaterial.diffuseColor = new Color3(0.2, 0.75, 0.9);
crystalMaterial.emissiveColor = new Color3(0.04, 0.25, 0.35);
const crystal = MeshBuilder.CreateCylinder(
  "crystal",
  { diameterTop: 0, diameterBottom: 1.2, height: 2.2, tessellation: 6 },
  scene,
);
crystal.position.y = 1.1;
crystal.material = crystalMaterial;

const ringMaterial = new StandardMaterial("ring-material", scene);
ringMaterial.diffuseColor = new Color3(0.96, 0.66, 0.24);
ringMaterial.emissiveColor = new Color3(0.22, 0.1, 0.02);
const ring = MeshBuilder.CreateTorus(
  "ring",
  { diameter: 2.5, thickness: 0.08, tessellation: 48 },
  scene,
);
ring.rotation.x = Math.PI / 2;
ring.position.y = 0.06;
ring.material = ringMaterial;

scene.registerBeforeRender(() => {
  crystal.rotation.y += engine.getDeltaTime() * 0.0007;
  ring.rotation.z -= engine.getDeltaTime() * 0.0004;
});

engine.runRenderLoop(() => scene.render());
window.addEventListener("resize", () => engine.resize());
