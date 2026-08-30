import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("settings UI composes a reusable modal with the required controls and dismissal paths", async () => {
  const [ui, gameWindow, main, gameplay] = await Promise.all([
    readFile(new URL("../src/settings-ui.js", import.meta.url), "utf8"),
    readFile(new URL("../src/game-window.js", import.meta.url), "utf8"),
    readFile(new URL("../src/main.js", import.meta.url), "utf8"),
    readFile(new URL("../src/gameplay.js", import.meta.url), "utf8"),
  ]);
  assert.match(ui, /title:\s*"Settings Menu"/);
  assert.match(ui, /"Music", AUDIO_SETTING_KEYS\.music/);
  assert.match(ui, /"SFX", AUDIO_SETTING_KEYS\.sfx/);
  assert.match(ui, /label\.textContent = "Collider\?"/);
  assert.match(ui, /checkbox\.type = "checkbox"/);
  assert.match(ui, /checkbox\.checked = store\.get\(DEBUG_SETTING_KEYS\.showColliders\)/);
  assert.match(ui, /store\.set\(DEBUG_SETTING_KEYS\.showColliders, checkbox\.checked\)/);
  assert.match(ui, /slider\.min = "0"/);
  assert.match(ui, /slider\.max = "100"/);
  assert.match(ui, /addEventListener\("input"/);
  assert.match(ui, /resetButton\.textContent = "Reset"/);
  assert.match(ui, /store\.reset\(\)/);
  assert.match(ui, /musicSlider\.value = String\(store\.get\(AUDIO_SETTING_KEYS\.music\)\)/);
  assert.match(ui, /sfxSlider\.value = String\(store\.get\(AUDIO_SETTING_KEYS\.sfx\)\)/);
  assert.match(ui, /colliderCheckbox\.checked = store\.get\(DEBUG_SETTING_KEYS\.showColliders\)/);
  assert.match(ui, /pauseController\.pause\(\)/);
  assert.match(ui, /pauseController\.resume\(\)/);
  assert.match(gameWindow, /setAttribute\("role", "dialog"\)/);
  assert.match(gameWindow, /setAttribute\("aria-modal", "true"\)/);
  assert.match(gameWindow, /event\.target === this\.backdrop/);
  assert.match(main, /createSettingsUi\(/);
  assert.match(gameplay, /pauseController\.setTerminal\(\)/);
  assert.doesNotMatch(gameplay, /stopRenderLoop\(\)/);
});

test("settings chrome follows the frame-relative visual contract", async () => {
  const styles = await readFile(new URL("../src/style.css", import.meta.url), "utf8");
  const selectors = [
    ".settings-gear",
    ".game-window-backdrop",
    ".game-window",
    ".game-window-title",
    ".game-window-close",
    ".settings-controls",
    ".volume-control",
    ".volume-scale",
    ".settings-reset",
    ".collider-control",
  ];
  for (const selector of selectors) {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const declarations = styles.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`, "s"))?.[1] ?? "";
    assert.ok(declarations, `missing ${selector}`);
    assert.doesNotMatch(declarations, /(?:\d|\.)(?:px|vw|vh)\b/);
  }
  assert.match(styles, /\.settings-gear\s*\{[^}]*top:\s*8\.75cqw;[^}]*right:\s*8\.75cqw;[^}]*width:\s*8cqw;[^}]*height:\s*8cqw;/s);
  assert.match(styles, /\.game-window-backdrop\s*\{[^}]*inset:\s*0;[^}]*place-items:\s*center;[^}]*rgb\(0 0 0 \/ 50%\)/s);
  assert.doesNotMatch(styles, /@media/);
});

test("gear icon is transparent vector artwork", async () => {
  const icon = await readFile(new URL("../public/gear.svg", import.meta.url), "utf8");
  assert.match(icon, /viewBox="0 0 64 64"/);
  assert.doesNotMatch(icon, /<rect[^>]+(?:fill|style)=/);
});

test("close icon cross is geometrically centered instead of font-baseline aligned", async () => {
  const [ui, styles] = await Promise.all([
    readFile(new URL("../src/game-window.js", import.meta.url), "utf8"),
    readFile(new URL("../src/style.css", import.meta.url), "utf8"),
  ]);
  assert.match(ui, /this\.closeButton\.textContent = ""/);
  assert.match(styles, /\.game-window-close::before,\s*\.game-window-close::after\s*\{[^}]*position:\s*absolute;[^}]*top:\s*50%;[^}]*left:\s*50%;[^}]*transform-origin:\s*center;/s);
  assert.match(styles, /\.game-window-close::before\s*\{[^}]*translate\(-50%,\s*-50%\) rotate\(45deg\)/s);
  assert.match(styles, /\.game-window-close::after\s*\{[^}]*translate\(-50%,\s*-50%\) rotate\(-45deg\)/s);
});
