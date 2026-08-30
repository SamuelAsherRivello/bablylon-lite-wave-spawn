const ASSET_BASE = import.meta.env?.BASE_URL ?? "/";
export const MUSIC_PATH = `${ASSET_BASE}audio/music/invincible.ogg`;
export const SOUND_PATHS = Object.freeze({
  collision: `${ASSET_BASE}audio/sfx/collision.wav`,
  click: `${ASSET_BASE}audio/sfx/click.wav`,
  levelStart: `${ASSET_BASE}audio/sfx/levelstart.wav`,
  levelStop: `${ASSET_BASE}audio/sfx/levelstop.wav`,
  projectileLaunch: `${ASSET_BASE}audio/sfx/projectile-launch.mp3`,
});

export const SOUND_SETTINGS = Object.freeze({
  levelStart: Object.freeze({ volume: 0.25 }),
  projectileLaunch: Object.freeze({ volume: 0.045, pitchRange: [0.96, 1.04] }),
});

function categoryVolume(value) {
  return Math.min(100, Math.max(0, Number(value) || 0)) / 100;
}

export function createMusicPlayer({
  AudioConstructor = globalThis.Audio,
  getMusicVolume = () => 100,
  unlockTarget = globalThis.document,
} = {}) {
  if (typeof AudioConstructor !== "function") {
    return { audio: null, setVolume() {}, dispose() {} };
  }

  const audio = new AudioConstructor(MUSIC_PATH);
  audio.loop = true;
  const setVolume = (value = getMusicVolume()) => {
    audio.volume = categoryVolume(value);
  };
  const play = () => {
    try {
      void audio.play()?.catch?.(() => {});
    } catch {
      // Browser autoplay may reject until the first player gesture.
    }
  };
  const removeUnlockListeners = () => {
    unlockTarget?.removeEventListener?.("pointerdown", unlock);
    unlockTarget?.removeEventListener?.("keydown", unlock);
  };
  const unlock = () => {
    removeUnlockListeners();
    play();
  };

  setVolume();
  play();
  unlockTarget?.addEventListener?.("pointerdown", unlock, { once: true });
  unlockTarget?.addEventListener?.("keydown", unlock, { once: true });

  return {
    audio,
    setVolume,
    dispose() {
      removeUnlockListeners();
      audio.pause();
    },
  };
}

export function createSoundPlayer(
  AudioConstructor = globalThis.Audio,
  getSfxVolume = () => 100,
) {
  return (name) => {
    const path = SOUND_PATHS[name];
    if (!path || typeof AudioConstructor !== "function") return;
    const sound = new AudioConstructor(path);
    const settings = SOUND_SETTINGS[name] ?? {};
    const baseVolume = settings.volume ?? 1;
    sound.volume = Math.min(1, Math.max(0, baseVolume * categoryVolume(
      getSfxVolume(),
    )));
    if (settings.pitchRange) {
      const [minimum, maximum] = settings.pitchRange;
      sound.playbackRate = minimum + Math.random() * (maximum - minimum);
    }
    sound.currentTime = 0;
    void sound.play().catch(() => {});
  };
}
