import test from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import {
  MUSIC_PATH,
  SOUND_PATHS,
  createMusicPlayer,
  createSoundPlayer,
} from "../src/audio.js";

class FakeAudio {
  static instances = [];

  constructor(path) {
    this.path = path;
    this.currentTime = 12;
    this.volume = 1;
    this.playbackRate = 1;
    this.playCalls = 0;
    this.pauseCalls = 0;
    this.loop = false;
    FakeAudio.instances.push(this);
  }

  play() {
    this.playCalls += 1;
    return Promise.resolve();
  }

  pause() {
    this.pauseCalls += 1;
  }
}

class FakeUnlockTarget {
  constructor() { this.listeners = new Map(); }
  addEventListener(type, listener) { this.listeners.set(type, listener); }
  removeEventListener(type, listener) {
    if (this.listeners.get(type) === listener) this.listeners.delete(type);
  }
  dispatch(type) { this.listeners.get(type)?.(); }
}

test("music loops for the app lifetime and follows live category volume", () => {
  FakeAudio.instances = [];
  const unlockTarget = new FakeUnlockTarget();
  const player = createMusicPlayer({
    AudioConstructor: FakeAudio,
    getMusicVolume: () => 60,
    unlockTarget,
  });
  const music = FakeAudio.instances[0];

  assert.equal(music.path, MUSIC_PATH);
  assert.equal(music.loop, true);
  assert.equal(music.volume, 0.6);
  assert.equal(music.playCalls, 1);
  assert.equal(unlockTarget.listeners.has("pointerdown"), true);
  assert.equal(unlockTarget.listeners.has("keydown"), true);

  player.setVolume(25);
  assert.equal(music.volume, 0.25);
  unlockTarget.dispatch("pointerdown");
  assert.equal(music.playCalls, 2);
  assert.equal(unlockTarget.listeners.size, 0);

  player.dispose();
  assert.equal(music.pauseCalls, 1);
});

test("mono lower-quality trial assets stay below their size ceilings", async () => {
  const ceilings = new Map([
    ["audio/music/invincible.ogg", 50_000],
    ["audio/sfx/projectile-launch.mp3", 15_000],
    ["audio/sfx/levelstop.wav", 20_000],
    ["audio/sfx/levelstart.wav", 15_000],
    ["audio/sfx/collision.wav", 3_000],
    ["audio/sfx/click.wav", 300],
  ]);
  for (const [path, ceiling] of ceilings) {
    const file = await stat(new URL(`../public/${path}`, import.meta.url));
    assert.ok(file.size < ceiling, `${path} is ${file.size} bytes`);
  }
});

test("startup subscribes the active music instance to Music settings", async () => {
  const source = await readFile(new URL("../src/main.js", import.meta.url), "utf8");
  assert.match(source, /createMusicPlayer\(/);
  assert.match(
    source,
    /settingsStore[.]subscribe\(\s*AUDIO_SETTING_KEYS[.]music,[\s\S]*setVolume/,
  );
});

test("wave-complete and game-over prompts play level stop first", async () => {
  const source = await readFile(
    new URL("../src/gameplay.js", import.meta.url),
    "utf8",
  );
  assert.equal(SOUND_PATHS.levelStop, "/audio/sfx/levelstop.wav");
  assert.match(
    source,
    /finalizeBattle\(winner\)[\s\S]*playSound\("levelStop"\)[\s\S]*showPrompt\(result[.]title/,
  );
});

test("configured sounds use volume and a pitch within their range", () => {
  FakeAudio.instances = [];
  const originalRandom = Math.random;
  Math.random = () => 0.5;
  try {
    createSoundPlayer(FakeAudio)("projectileLaunch");
  } finally {
    Math.random = originalRandom;
  }

  assert.equal(FakeAudio.instances.length, 1);
  assert.equal(FakeAudio.instances[0].path, "/audio/sfx/projectile-launch.mp3");
  assert.equal(FakeAudio.instances[0].volume, 0.045);
  assert.equal(FakeAudio.instances[0].playbackRate, 1);
  assert.equal(FakeAudio.instances[0].playCalls, 1);
});

test("each play creates an independent audio instance", () => {
  FakeAudio.instances = [];
  const playSound = createSoundPlayer(FakeAudio);
  playSound("projectileLaunch");
  playSound("projectileLaunch");

  assert.equal(FakeAudio.instances.length, 2);
  assert.notEqual(FakeAudio.instances[0], FakeAudio.instances[1]);
});

test("unconfigured sounds retain default audio settings", () => {
  FakeAudio.instances = [];
  createSoundPlayer(FakeAudio)("click");

  assert.equal(FakeAudio.instances[0].volume, 1);
  assert.equal(FakeAudio.instances[0].playbackRate, 1);
});

test("round start sound plays at half volume", () => {
  FakeAudio.instances = [];
  createSoundPlayer(FakeAudio)("levelStart");

  assert.equal(FakeAudio.instances[0].volume, 0.25);
  assert.equal(FakeAudio.instances[0].playbackRate, 1);
});

test("new sounds use the creation-time SFX multiplier without changing earlier instances", () => {
  FakeAudio.instances = [];
  let sfxVolume = 50;
  const playSound = createSoundPlayer(FakeAudio, () => sfxVolume);
  playSound("levelStart");
  const first = FakeAudio.instances[0];
  assert.equal(first.volume, 0.125);
  sfxVolume = 0;
  playSound("click");
  assert.equal(first.volume, 0.125);
  assert.equal(FakeAudio.instances[1].volume, 0);
});
