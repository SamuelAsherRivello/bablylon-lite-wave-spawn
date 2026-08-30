import {
  Color4,
  Engine,
  FreeCamera,
  Scene,
  Vector3,
} from "@babylonjs/core";
import HavokPhysics from "@babylonjs/havok";
import havokWasmUrl from "@babylonjs/havok/lib/esm/HavokPhysics.wasm?url";
import { HavokPlugin } from "@babylonjs/core/Physics/v2/Plugins/havokPlugin";
import { Arena } from "./arena.js";
import { Gameplay } from "./gameplay.js";
import "./style.css";

const canvas = document.querySelector("#renderCanvas");
const engine = new Engine(
  canvas,
  true,
  { preserveDrawingBuffer: true },
  true,
);
const scene = new Scene(engine);
const havok = await HavokPhysics({ locateFile: () => havokWasmUrl });
scene.enablePhysics(null, new HavokPlugin(true, havok));
scene.getPhysicsEngine().setGravity(new Vector3(0, 0, 0));
scene.clearColor = new Color4(0.035, 0.047, 0.075, 1);

const camera = new FreeCamera("locked-camera", new Vector3(0, 0, 10), scene);
camera.setTarget(Vector3.Zero());
camera.mode = FreeCamera.ORTHOGRAPHIC_CAMERA;
camera.orthoLeft = -4.5;
camera.orthoRight = 4.5;
camera.orthoBottom = -8;
camera.orthoTop = 8;

new Arena(scene);

new Gameplay(scene, document.querySelector("#gameUi"));

engine.runRenderLoop(() => scene.render());
window.addEventListener("resize", () => engine.resize());
