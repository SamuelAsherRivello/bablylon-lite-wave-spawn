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

test("70-pixel artwork inset maps exactly into the 9 by 16 world", () => {
  assert.equal(ARENA_WIDTH_PX, 800);
  assert.equal(ARENA_HEIGHT_PX, 1472);
  assert.equal(ARENA_WALL_INSET_PX, 70);
  assert.equal(PLAYABLE_BOUNDS.left, -3.7125);
  assert.equal(PLAYABLE_BOUNDS.right, 3.7125);
  assert.ok(Math.abs(PLAYABLE_BOUNDS.top - 7.239130434782608) < 1e-12);
  assert.ok(Math.abs(PLAYABLE_BOUNDS.bottom + 7.239130434782608) < 1e-12);
});

test("approved arena assets are exact 800 by 1472 PNG files", async () => {
  for (const { backgroundPath } of ARENAS) {
    const bytes = await readFile(new URL(`../public/${backgroundPath}`, import.meta.url));
    assert.equal(bytes.toString("ascii", 1, 4), "PNG");
    assert.equal(bytes.readUInt32BE(16), 800);
    assert.equal(bytes.readUInt32BE(20), 1472);
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

test("startup passes one selected arena to rendering and gameplay", async () => {
  const source = await readFile(new URL("../src/main.js", import.meta.url), "utf8");
  assert.match(source, /const selectedArena = selectArena\(window\.location\.search\)/);
  assert.match(source, /new Arena\(scene, selectedArena/);
  assert.match(source, /gameplay = new Gameplay\([\s\S]*document\.querySelector\("#gameUi"\),[\s\S]*selectedArena,[\s\S]*pauseController/);
  assert.equal(source.match(/selectArena\(/g)?.length, 1);
});
