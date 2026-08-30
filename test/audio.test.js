import test from "node:test";
import assert from "node:assert/strict";
import { createSoundPlayer } from "../src/audio.js";

class FakeAudio {
  static instances = [];

  constructor(path) {
    this.path = path;
    this.currentTime = 12;
    this.volume = 1;
    this.playbackRate = 1;
    this.playCalls = 0;
    FakeAudio.instances.push(this);
  }

  play() {
    this.playCalls += 1;
    return Promise.resolve();
  }
}

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
