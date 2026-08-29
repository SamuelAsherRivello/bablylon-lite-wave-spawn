export const SOUND_PATHS = Object.freeze({
  collision: "/audio/sfx/collision.wav",
  click: "/audio/sfx/click.wav",
  levelStart: "/audio/sfx/levelstart.wav",
});

export function createSoundPlayer(AudioConstructor = globalThis.Audio) {
  const sounds = new Map();
  return (name) => {
    const path = SOUND_PATHS[name];
    if (!path || typeof AudioConstructor !== "function") return;
    let sound = sounds.get(name);
    if (!sound) {
      sound = new AudioConstructor(path);
      sounds.set(name, sound);
    }
    sound.currentTime = 0;
    void sound.play().catch(() => {});
  };
}
