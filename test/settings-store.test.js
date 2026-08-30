import test from "node:test";
import assert from "node:assert/strict";
import {
  AUDIO_SETTING_KEYS,
  DEBUG_SETTING_KEYS,
  GAMEPLAY_SETTING_KEYS,
  SETTINGS_STORAGE_KEY,
  createSettingsStore,
} from "../src/settings-store.js";

test("Skip Start Menu defaults off, validates booleans, persists, and resets", () => {
  const storage = new MemoryStorage();
  const store = createSettingsStore(storage);

  assert.equal(store.get(GAMEPLAY_SETTING_KEYS.skipStartMenu), false);
  assert.equal(store.set(GAMEPLAY_SETTING_KEYS.skipStartMenu, true), true);
  assert.equal(
    createSettingsStore(storage).get(GAMEPLAY_SETTING_KEYS.skipStartMenu), true,
  );
  assert.equal(store.set(GAMEPLAY_SETTING_KEYS.skipStartMenu, "yes"), false);
  store.set(GAMEPLAY_SETTING_KEYS.skipStartMenu, true);
  store.reset();
  assert.equal(store.get(GAMEPLAY_SETTING_KEYS.skipStartMenu), false);
});

class MemoryStorage {
  constructor(initial = {}) { this.values = new Map(Object.entries(initial)); }
  getItem(key) { return this.values.get(key) ?? null; }
  setItem(key, value) { this.values.set(key, value); }
  removeItem(key) { this.values.delete(key); }
}

test("settings default to full audio and persist arbitrary namespaced values", () => {
  const storage = new MemoryStorage();
  const store = createSettingsStore(storage);
  assert.equal(store.get(AUDIO_SETTING_KEYS.music), 100);
  assert.equal(store.get(AUDIO_SETTING_KEYS.sfx), 100);
  store.set("game.futureOption", "enabled");
  assert.equal(createSettingsStore(storage).get("game.futureOption"), "enabled");
  assert.deepEqual(JSON.parse(storage.getItem(SETTINGS_STORAGE_KEY)), {
    version: 1,
    values: { "game.futureOption": "enabled" },
  });
});

test("collider visibility defaults off, persists booleans, and rejects invalid values", () => {
  const storage = new MemoryStorage();
  const store = createSettingsStore(storage);
  assert.equal(store.get(DEBUG_SETTING_KEYS.showColliders), false);
  store.set(DEBUG_SETTING_KEYS.showColliders, true);
  assert.equal(createSettingsStore(storage).get(DEBUG_SETTING_KEYS.showColliders), true);
  store.set(DEBUG_SETTING_KEYS.showColliders, "true");
  assert.equal(store.get(DEBUG_SETTING_KEYS.showColliders), false);
});

test("subscribers receive immediate setting changes", () => {
  const store = createSettingsStore(new MemoryStorage());
  const changes = [];
  const unsubscribe = store.subscribe(AUDIO_SETTING_KEYS.sfx, (value) => changes.push(value));
  store.set(AUDIO_SETTING_KEYS.sfx, 40);
  store.set(DEBUG_SETTING_KEYS.showColliders, true);
  unsubscribe();
  store.set(AUDIO_SETTING_KEYS.sfx, 20);
  assert.deepEqual(changes, [40]);
});

test("invalid or unavailable storage safely falls back while memory remains usable", () => {
  const malformed = new MemoryStorage({ [SETTINGS_STORAGE_KEY]: "{" });
  assert.equal(createSettingsStore(malformed).get(AUDIO_SETTING_KEYS.sfx), 100);
  const throwing = {
    getItem() { throw new Error("blocked"); },
    setItem() { throw new Error("blocked"); },
  };
  const store = createSettingsStore(throwing);
  store.set(AUDIO_SETTING_KEYS.music, 55);
  assert.equal(store.get(AUDIO_SETTING_KEYS.music), 55);
  store.set(AUDIO_SETTING_KEYS.sfx, 500);
  assert.equal(store.get(AUDIO_SETTING_KEYS.sfx), 100);
});

test("reset removes only game settings, restores defaults, and notifies subscribers", () => {
  const storage = new MemoryStorage({ unrelated: "keep" });
  const store = createSettingsStore(storage);
  store.set(AUDIO_SETTING_KEYS.music, 25);
  store.set(AUDIO_SETTING_KEYS.sfx, 40);
  const changes = [];
  store.subscribe(AUDIO_SETTING_KEYS.music, (value) => changes.push(["music", value]));
  store.subscribe(AUDIO_SETTING_KEYS.sfx, (value) => changes.push(["sfx", value]));
  store.subscribe(DEBUG_SETTING_KEYS.showColliders, (value) => changes.push(["colliders", value]));
  store.reset();
  assert.equal(store.get(AUDIO_SETTING_KEYS.music), 100);
  assert.equal(store.get(AUDIO_SETTING_KEYS.sfx), 100);
  assert.equal(store.get(DEBUG_SETTING_KEYS.showColliders), false);
  assert.equal(storage.getItem(SETTINGS_STORAGE_KEY), null);
  assert.equal(storage.getItem("unrelated"), "keep");
  assert.deepEqual(changes, [["music", 100], ["sfx", 100], ["colliders", false]]);

  const throwing = createSettingsStore({
    getItem: () => null,
    setItem() {},
    removeItem() { throw new Error("blocked"); },
  });
  throwing.set(AUDIO_SETTING_KEYS.sfx, 10);
  assert.doesNotThrow(() => throwing.reset());
  assert.equal(throwing.get(AUDIO_SETTING_KEYS.sfx), 100);
});
