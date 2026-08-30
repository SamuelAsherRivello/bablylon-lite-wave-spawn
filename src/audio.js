const ASSET_BASE = import.meta.env?.BASE_URL ?? "/";
export const SOUND_PATHS = Object.freeze({
  collision: `${ASSET_BASE}audio/sfx/collision.wav`,
  click: `${ASSET_BASE}audio/sfx/click.wav`,
  levelStart: `${ASSET_BASE}audio/sfx/levelstart.wav`,
  projectileLaunch: `${ASSET_BASE}audio/sfx/projectile-launch.mp3`,
});

export const SOUND_SETTINGS = Object.freeze({
  levelStart: Object.freeze({ volume: 0.25 }),
  projectileLaunch: Object.freeze({ volume: 0.045, pitchRange: [0.96, 1.04] }),
});

export function createSoundPlayer(AudioConstructor = globalThis.Audio) {
  return (name) => {
    const path = SOUND_PATHS[name];
    if (!path || typeof AudioConstructor !== "function") return;
    const sound = new AudioConstructor(path);
    const settings = SOUND_SETTINGS[name] ?? {};
    if (settings.volume !== undefined) sound.volume = settings.volume;
    if (settings.pitchRange) {
      const [minimum, maximum] = settings.pitchRange;
      sound.playbackRate = minimum + Math.random() * (maximum - minimum);
    }
    sound.currentTime = 0;
    void sound.play().catch(() => {});
  };
}
