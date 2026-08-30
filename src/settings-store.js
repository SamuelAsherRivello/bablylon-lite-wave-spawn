export const SETTINGS_STORAGE_KEY = "light-never-pawns.settings";
export const SETTINGS_VERSION = 1;
export const AUDIO_SETTING_KEYS = Object.freeze({
  music: "audio.musicVolume",
  sfx: "audio.sfxVolume",
});
export const DEBUG_SETTING_KEYS = Object.freeze({
  showColliders: "debug.showColliders",
});
export const GAMEPLAY_SETTING_KEYS = Object.freeze({
  skipStartMenu: "gameplay.skipStartMenu",
});

function defaultFor(key) {
  if (key === DEBUG_SETTING_KEYS.showColliders ||
      key === GAMEPLAY_SETTING_KEYS.skipStartMenu) return false;
  return key === AUDIO_SETTING_KEYS.music || key === AUDIO_SETTING_KEYS.sfx
    ? 100
    : undefined;
}

function validValue(key, value) {
  if (key === DEBUG_SETTING_KEYS.showColliders ||
      key === GAMEPLAY_SETTING_KEYS.skipStartMenu) {
    return typeof value === "boolean";
  }
  if (key !== AUDIO_SETTING_KEYS.music && key !== AUDIO_SETTING_KEYS.sfx) return true;
  return Number.isFinite(value) && value >= 0 && value <= 100;
}

function browserStorage() {
  if (typeof window === "undefined") return null;
  try { return window.localStorage; } catch { return null; }
}

export function createSettingsStore(storage = browserStorage()) {
  let values = {};
  const listeners = new Map();
  try {
    const parsed = JSON.parse(storage?.getItem?.(SETTINGS_STORAGE_KEY) ?? "null");
    if (parsed?.version === SETTINGS_VERSION && parsed.values && typeof parsed.values === "object") {
      values = { ...parsed.values };
    }
  } catch {
    values = {};
  }

  const get = (key, fallback = defaultFor(key)) => {
    const value = values[key];
    return validValue(key, value) && value !== undefined ? value : fallback;
  };

  return {
    get,
    set(key, value) {
      values[key] = validValue(key, value) ? value : defaultFor(key);
      try {
        storage?.setItem?.(SETTINGS_STORAGE_KEY, JSON.stringify({
          version: SETTINGS_VERSION,
          values,
        }));
      } catch {
        // The in-memory value remains authoritative for this session.
      }
      listeners.get(key)?.forEach((listener) => listener(get(key)));
      return get(key);
    },
    subscribe(key, listener) {
      if (!listeners.has(key)) listeners.set(key, new Set());
      listeners.get(key).add(listener);
      return () => listeners.get(key)?.delete(listener);
    },
    reset() {
      const changedKeys = new Set([
        ...Object.keys(values),
        ...listeners.keys(),
        AUDIO_SETTING_KEYS.music,
        AUDIO_SETTING_KEYS.sfx,
        DEBUG_SETTING_KEYS.showColliders,
        GAMEPLAY_SETTING_KEYS.skipStartMenu,
      ]);
      values = {};
      try {
        storage?.removeItem?.(SETTINGS_STORAGE_KEY);
      } catch {
        // Defaults remain active in memory when persistent removal is blocked.
      }
      for (const key of changedKeys) {
        listeners.get(key)?.forEach((listener) => listener(get(key)));
      }
    },
  };
}

export const settingsStore = createSettingsStore();
