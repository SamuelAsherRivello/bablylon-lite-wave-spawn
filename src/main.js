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
import { initializeWithDefaultLoadingScreen } from "./startup.js";
import { createArenaOrder } from "./arena-config.js";
import { PauseController } from "./pause-controller.js";
import { createSettingsUi } from "./settings-ui.js";
import { EnvironmentalEffects } from "./environmental-effects.js";
import { ColliderDebugController } from "./collider-debug-controller.js";
import { createMusicPlayer } from "./audio.js";
import {
  AUDIO_SETTING_KEYS,
  DEBUG_SETTING_KEYS,
  settingsStore,
} from "./settings-store.js";
import { loadReleaseMetadata } from "./release-metadata.js";
import { createReleaseMetadataUi } from "./release-metadata-ui.js";
import "./style.css";

const canvas = document.querySelector("#renderCanvas");
const engine = new Engine(
  canvas,
  true,
  { preserveDrawingBuffer: true },
  true,
);
const scene = new Scene(engine);
const musicPlayer = createMusicPlayer({
  getMusicVolume: () => settingsStore.get(AUDIO_SETTING_KEYS.music),
});
const unsubscribeMusicVolume = settingsStore.subscribe(
  AUDIO_SETTING_KEYS.music,
  (volume) => musicPlayer.setVolume(volume),
);
window.addEventListener("pagehide", () => {
  unsubscribeMusicVolume();
  musicPlayer.dispose();
}, { once: true });
const createSessionArenaOrder = () => createArenaOrder(window.location.search);
const initialArenaOrder = createSessionArenaOrder();
const selectedArena = initialArenaOrder[0];
canvas.dataset.arenaId = String(selectedArena.id);
canvas.dataset.arenaFriction = String(selectedArena.friction);
await initializeWithDefaultLoadingScreen(engine, async () => {
  const releaseMetadata = await loadReleaseMetadata(import.meta.env.BASE_URL);
  const havok = await HavokPhysics({ locateFile: () => havokWasmUrl });
  scene.enablePhysics(null, new HavokPlugin(true, havok));
  scene.getPhysicsEngine().setGravity(new Vector3(0, 0, 0));
  scene.clearColor = new Color4(0.035, 0.047, 0.075, 1);

  const camera = new FreeCamera("locked-camera", new Vector3(0, 0, -10), scene);
  camera.setTarget(Vector3.Zero());
  camera.mode = FreeCamera.ORTHOGRAPHIC_CAMERA;
  camera.orthoLeft = -4.5;
  camera.orthoRight = 4.5;
  camera.orthoBottom = -8;
  camera.orthoTop = 8;

  const arena = new Arena(scene, selectedArena);
  const environmentalEffects = new EnvironmentalEffects(scene);
  let gameplay = null;
  const pauseController = new PauseController({
    scene,
    getBodies: () => gameplay?.getPhysicsBodies() ?? [],
  });
  gameplay = new Gameplay(
    scene,
    document.querySelector("#gameUi"),
    selectedArena,
    pauseController,
    environmentalEffects,
    {
      initialArenaOrder,
      createArenaOrder: createSessionArenaOrder,
      onArenaChange: (arenaConfig) => {
        arena.setConfig(arenaConfig);
        canvas.dataset.arenaId = String(arenaConfig.id);
        canvas.dataset.arenaFriction = String(arenaConfig.friction);
      },
    },
  );
  const colliderDebugController = new ColliderDebugController({
    scene,
    getBodies: () => [
      ...arena.getPhysicsBodies(),
      ...gameplay.getPhysicsBodies(),
    ],
  });
  colliderDebugController.setEnabled(settingsStore.get(DEBUG_SETTING_KEYS.showColliders));
  settingsStore.subscribe(DEBUG_SETTING_KEYS.showColliders, (enabled) => {
    colliderDebugController.setEnabled(enabled);
  });
  createSettingsUi({
    host: document.querySelector(".game-frame"),
    pauseController,
  });
  createReleaseMetadataUi({
    host: document.querySelector("#gameUi"),
    metadata: releaseMetadata,
  });
});

engine.runRenderLoop(() => scene.render());
window.addEventListener("resize", () => engine.resize());
