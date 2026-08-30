import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  ARENAS,
  ARENA_HEIGHT_PX,
  ARENA_WALL_INSET_PX,
  ARENA_WIDTH_PX,
  PLAYABLE_BOUNDS,
  WALL_DEFINITIONS,
  applyArenaFriction,
  constrainHeroToPlayableBounds,
  createArenaOrder,
  selectArena,
} from "../src/arena-config.js";

test("arena catalog defines three numbered surfaces with increasing friction", () => {
  assert.deepEqual(
    ARENAS.map(({ id, friction }) => ({ id, friction })),
    [
      { id: 1, friction: 0.1 },
      { id: 2, friction: 0.25 },
      { id: 3, friction: 0.4 },
    ],
  );
  assert.equal(new Set(ARENAS.map(({ backgroundPath }) => backgroundPath)).size, 3);
  assert.equal(Object.isFrozen(ARENAS), true);
  ARENAS.forEach((arena) => assert.equal(Object.isFrozen(arena), true));
});

test("valid arena query overrides select reproducible arenas", () => {
  assert.equal(selectArena("?arena=1", () => 0.99), ARENAS[0]);
  assert.equal(selectArena("?arena=2", () => 0), ARENAS[1]);
  assert.equal(selectArena("?arena=3", () => 0), ARENAS[2]);
});

test("normal arena selection divides random values equally", () => {
  assert.equal(selectArena("", () => 0), ARENAS[0]);
  assert.equal(selectArena("", () => 1 / 3), ARENAS[1]);
  assert.equal(selectArena("", () => 2 / 3), ARENAS[2]);
  assert.equal(selectArena("", () => 0.999999), ARENAS[2]);
});

test("a session arena order contains every arena once in randomized order", () => {
  assert.deepEqual(createArenaOrder("", () => 0).map(({ id }) => id), [2, 3, 1]);
  assert.deepEqual(createArenaOrder("", () => 0.999).map(({ id }) => id), [1, 2, 3]);
  assert.equal(new Set(createArenaOrder("", () => 0.5)).size, ARENAS.length);
});

test("arena query override fixes only Wave 1 without allowing repeats", () => {
  assert.deepEqual(
    createArenaOrder("?arena=2", () => 0).map(({ id }) => id),
    [2, 3, 1],
  );
});

test("replacement sessions receive independent complete arena orders", () => {
  const randomValues = [0, 0, 0.999, 0.999];
  const random = () => randomValues.shift();
  const firstSession = createArenaOrder("", random);
  const replacementSession = createArenaOrder("", random);
  assert.deepEqual(firstSession.map(({ id }) => id), [2, 3, 1]);
  assert.deepEqual(replacementSession.map(({ id }) => id), [1, 2, 3]);
  assert.notEqual(firstSession, replacementSession);
  assert.equal(new Set(replacementSession).size, ARENAS.length);
});

test("70-pixel artwork inset maps exactly into the 9 by 16 world", () => {
  assert.equal(ARENA_WIDTH_PX, 800);
  assert.equal(ARENA_HEIGHT_PX, 1472);
  assert.equal(ARENA_WALL_INSET_PX, 70);
  assert.equal(PLAYABLE_BOUNDS.left, -3.7125);
  assert.equal(PLAYABLE_BOUNDS.right, 3.7125);
  assert.ok(Math.abs(PLAYABLE_BOUNDS.top - 7.239130434782608) < 1e-12);
  assert.ok(Math.abs(PLAYABLE_BOUNDS.bottom + 7.239130434782608) < 1e-12);
});

test("optimized arena assets are 400 by 736 WebP files under 100 KB", async () => {
  for (const { backgroundPath } of ARENAS) {
    assert.match(backgroundPath, /[.]webp$/);
    const bytes = await readFile(new URL(`../public/${backgroundPath}`, import.meta.url));
    assert.equal(bytes.toString("ascii", 0, 4), "RIFF");
    assert.equal(bytes.toString("ascii", 8, 12), "WEBP");
    assert.equal(bytes.toString("ascii", 12, 16), "VP8X");
    assert.equal(bytes.readUIntLE(24, 3) + 1, 400);
    assert.equal(bytes.readUIntLE(27, 3) + 1, 736);
    assert.ok(bytes.length < 100_000);
  }
});

test("four static walls cover corners with zero bounce and free sliding", () => {
  assert.deepEqual(WALL_DEFINITIONS.map(({ side }) => side), ["left", "right", "top", "bottom"]);
  WALL_DEFINITIONS.forEach((wall) => {
    assert.equal(wall.mass, 0);
    assert.equal(wall.friction, 0);
    assert.equal(wall.restitution, 0);
  });
  assert.equal(WALL_DEFINITIONS[0].insideFace, PLAYABLE_BOUNDS.left);
  assert.equal(WALL_DEFINITIONS[1].insideFace, PLAYABLE_BOUNDS.right);
  assert.equal(WALL_DEFINITIONS[2].insideFace, PLAYABLE_BOUNDS.top);
  assert.equal(WALL_DEFINITIONS[3].insideFace, PLAYABLE_BOUNDS.bottom);
  assert.equal(WALL_DEFINITIONS[0].height, 16);
  assert.equal(WALL_DEFINITIONS[2].width, 9);
});

test("wall response contains hero feet, removes outward speed, and preserves sliding", () => {
  assert.deepEqual(
    constrainHeroToPlayableBounds(
      { x: -4, y: 1 },
      { x: -2, y: 3 },
      { left: -0.29, right: 0.29, bottom: -0.5, top: 0 },
    ),
    {
      position: { x: PLAYABLE_BOUNDS.left + 0.29, y: 1 },
      velocity: { x: 0, y: 3 },
    },
  );
  assert.deepEqual(
    constrainHeroToPlayableBounds(
      { x: 2, y: 8 },
      { x: 4, y: 2 },
      { left: -0.29, right: 0.29, bottom: -0.5, top: 0 },
    ),
    {
      position: { x: 2, y: PLAYABLE_BOUNDS.top },
      velocity: { x: 4, y: 0 },
    },
  );
});

test("knockback at a wall clips only the blocked component", () => {
  const result = constrainHeroToPlayableBounds(
    { x: PLAYABLE_BOUNDS.right + 0.5, y: 0 },
    { x: 3, y: -2 },
    { left: -0.29, right: 0.29, bottom: -0.5, top: 0 },
  );
  assert.equal(result.position.x, PLAYABLE_BOUNDS.right - 0.29);
  assert.equal(result.velocity.x, 0);
  assert.equal(result.velocity.y, -2);
});

test("bottom-anchored hero bounds clamp asymmetrically at top and bottom", () => {
  const colliderOffsets = { left: -0.29, right: 0.29, bottom: -0.5, top: 0 };

  assert.deepEqual(
    constrainHeroToPlayableBounds(
      { x: 0, y: PLAYABLE_BOUNDS.bottom },
      { x: 1, y: -2 },
      colliderOffsets,
    ),
    {
      position: { x: 0, y: PLAYABLE_BOUNDS.bottom + 0.5 },
      velocity: { x: 1, y: 0 },
    },
  );
  assert.deepEqual(
    constrainHeroToPlayableBounds(
      { x: 0, y: PLAYABLE_BOUNDS.top + 0.25 },
      { x: -1, y: 2 },
      colliderOffsets,
    ),
    {
      position: { x: 0, y: PLAYABLE_BOUNDS.top },
      velocity: { x: -1, y: 0 },
    },
  );
});

test("arena friction scales commanded speed without changing class ordering", () => {
  assert.equal(applyArenaFriction(10, ARENAS[0].friction), 9);
  assert.equal(applyArenaFriction(10, ARENAS[1].friction), 7.5);
  assert.equal(applyArenaFriction(10, ARENAS[2].friction), 6);
  assert.ok(applyArenaFriction(15, 0.4) > applyArenaFriction(10, 0.4));
});

test("startup wires a session arena order to rendering and gameplay", async () => {
  const [source, arenaSource] = await Promise.all([
    readFile(new URL("../src/main.js", import.meta.url), "utf8"),
    readFile(new URL("../src/arena.js", import.meta.url), "utf8"),
  ]);
  assert.match(source, /createSessionArenaOrder = \(\) => createArenaOrder/);
  assert.match(source, /const selectedArena = initialArenaOrder\[0\]/);
  assert.match(source, /new Arena\(scene, selectedArena/);
  assert.match(source, /gameplay = new Gameplay\([\s\S]*document\.querySelector\("#gameUi"\),[\s\S]*selectedArena,[\s\S]*pauseController/);
  assert.match(source, /onArenaChange:[\s\S]*arena\.setConfig\(arenaConfig\)/);
  assert.match(arenaSource, /setConfig\(arenaConfig\)/);
});
