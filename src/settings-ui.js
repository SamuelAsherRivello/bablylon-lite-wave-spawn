import {
  AUDIO_SETTING_KEYS,
  DEBUG_SETTING_KEYS,
  GAMEPLAY_SETTING_KEYS,
  settingsStore,
} from "./settings-store.js";
import { GameWindow } from "./game-window.js";

const ASSET_BASE = import.meta.env?.BASE_URL ?? "/";

function createVolumeControl(documentRef, store, labelText, key) {
  const row = documentRef.createElement("label");
  row.className = "volume-control";
  const label = documentRef.createElement("span");
  label.className = "volume-label";
  label.textContent = labelText;
  const scale = documentRef.createElement("span");
  scale.className = "volume-scale";
  const minimum = documentRef.createElement("span");
  minimum.textContent = "0";
  const slider = documentRef.createElement("input");
  slider.type = "range";
  slider.min = "0";
  slider.max = "100";
  slider.step = "1";
  slider.value = String(store.get(key));
  slider.setAttribute("aria-label", `${labelText} volume`);
  const maximum = documentRef.createElement("span");
  maximum.textContent = "100";
  slider.addEventListener("input", () => store.set(key, Number(slider.value)));
  scale.append(minimum, slider, maximum);
  row.append(label, scale);
  return { row, slider };
}

function createColliderControl(documentRef, store) {
  const row = documentRef.createElement("label");
  row.className = "collider-control";
  const label = documentRef.createElement("span");
  label.textContent = "Collider?";
  const checkbox = documentRef.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = store.get(DEBUG_SETTING_KEYS.showColliders);
  checkbox.addEventListener("change", () => {
    store.set(DEBUG_SETTING_KEYS.showColliders, checkbox.checked);
  });
  row.append(label, checkbox);
  return { row, checkbox };
}

function createSkipStartControl(documentRef, store) {
  const row = documentRef.createElement("label");
  row.className = "skip-start-control";
  const label = documentRef.createElement("span");
  label.textContent = "Skip Start Menu";
  const checkbox = documentRef.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = store.get(GAMEPLAY_SETTING_KEYS.skipStartMenu);
  checkbox.addEventListener("change", () => {
    store.set(GAMEPLAY_SETTING_KEYS.skipStartMenu, checkbox.checked);
  });
  row.append(label, checkbox);
  return { row, checkbox };
}

export function createSettingsUi({
  host,
  pauseController,
  store = settingsStore,
  documentRef = globalThis.document,
}) {
  const gear = documentRef.createElement("button");
  gear.className = "settings-gear";
  gear.type = "button";
  gear.setAttribute("aria-label", "Open settings");
  const icon = documentRef.createElement("img");
  icon.src = `${ASSET_BASE}gear.svg`;
  icon.alt = "";
  icon.setAttribute("aria-hidden", "true");
  gear.append(icon);
  host.append(gear);

  let activeWindow = null;
  const close = () => activeWindow?.close();
  const open = () => {
    if (activeWindow) return close();
    const content = documentRef.createElement("div");
    content.className = "settings-controls";
    const musicControl = createVolumeControl(
      documentRef, store, "Music", AUDIO_SETTING_KEYS.music,
    );
    const sfxControl = createVolumeControl(
      documentRef, store, "SFX", AUDIO_SETTING_KEYS.sfx,
    );
    const colliderControl = createColliderControl(documentRef, store);
    const skipStartControl = createSkipStartControl(documentRef, store);
    const musicSlider = musicControl.slider;
    const sfxSlider = sfxControl.slider;
    const colliderCheckbox = colliderControl.checkbox;
    const skipStartCheckbox = skipStartControl.checkbox;
    const resetButton = documentRef.createElement("button");
    resetButton.className = "settings-reset";
    resetButton.type = "button";
    resetButton.textContent = "Reset";
    resetButton.addEventListener("click", () => {
      store.reset();
      musicSlider.value = String(store.get(AUDIO_SETTING_KEYS.music));
      sfxSlider.value = String(store.get(AUDIO_SETTING_KEYS.sfx));
      colliderCheckbox.checked = store.get(DEBUG_SETTING_KEYS.showColliders);
      skipStartCheckbox.checked = store.get(GAMEPLAY_SETTING_KEYS.skipStartMenu);
    });
    content.append(
      musicControl.row,
      sfxControl.row,
      colliderControl.row,
      skipStartControl.row,
      resetButton,
    );
    pauseController.pause();
    gear.setAttribute("aria-label", "Close settings");
    activeWindow = new GameWindow({
      host,
      title: "Settings Menu",
      content,
      documentRef,
      closeLabel: "Close settings",
      onClose: () => {
        activeWindow = null;
        gear.setAttribute("aria-label", "Open settings");
        pauseController.resume();
      },
    });
  };
  gear.addEventListener("click", open);
  return { gear, open, close, get activeWindow() { return activeWindow; } };
}
