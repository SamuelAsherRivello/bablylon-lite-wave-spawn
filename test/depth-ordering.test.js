import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  GROUND_Z,
  HERO_Z,
  PROJECTILE_Z,
  SHADOW_Z,
  heroDepthForPivotY,
  heroSortValueForPivotY,
} from "../src/depth.js";
import { PLAYABLE_BOUNDS } from "../src/arena-config.js";

test("a lower shadow-centered pivot receives higher sort priority and closer camera depth", () => {
  const lowerPivotY = -2;
  const higherPivotY = 2;

  assert.ok(
    heroSortValueForPivotY(lowerPivotY) > heroSortValueForPivotY(higherPivotY),
  );
  assert.ok(
    heroDepthForPivotY(lowerPivotY) < heroDepthForPivotY(higherPivotY),
  );
});

test("pivot sorting is independent of artwork dimensions and stable for equal pivots", () => {
  const pivotY = -1.25;
  const shortArtwork = { width: 1, height: 1, pivotY };
  const tallArtwork = { width: 1, height: 3, pivotY };

  assert.equal(
    heroSortValueForPivotY(shortArtwork.pivotY),
    heroSortValueForPivotY(tallArtwork.pivotY),
  );
  assert.equal(
    heroDepthForPivotY(shortArtwork.pivotY),
    heroDepthForPivotY(tallArtwork.pivotY),
  );
});

test("moving pivots exchange sort order when their y positions cross", () => {
  const firstBefore = heroSortValueForPivotY(-1);
  const secondBefore = heroSortValueForPivotY(1);
  const firstAfter = heroSortValueForPivotY(1);
  const secondAfter = heroSortValueForPivotY(-1);

  assert.ok(firstBefore > secondBefore);
  assert.ok(firstAfter < secondAfter);
});

test("hero depth remains between the fixed shadow and projectile layer bands", () => {
  const depths = [
    heroDepthForPivotY(PLAYABLE_BOUNDS.bottom),
    heroDepthForPivotY(PLAYABLE_BOUNDS.top),
  ];

  assert.ok(GROUND_Z > SHADOW_Z);
  assert.ok(depths.every((depth) => depth < SHADOW_Z));
  assert.ok(depths.every((depth) => depth > PROJECTILE_Z));
  assert.ok(depths.every((depth) => Math.abs(depth - HERO_Z) < 0.1));
});

test("heroes use the current shadow center as the only depth-sorting pivot", async () => {
  const source = await readFile(new URL("../src/hero.js", import.meta.url), "utf8");

  assert.match(source, /getDepthPivotY\(\)/);
  assert.match(source, /this\.root\.position\.y \+ this\.shadow\.position\.y/);
  assert.match(source, /heroSortValueForPivotY\(pivotY\)/);
  assert.match(source, /heroDepthForPivotY\(pivotY\)/);
  assert.match(
    source,
    /getDepthPivotY\(\)\s*\{\s*return this\.root\.position\.y \+ this\.shadow\.position\.y;\s*\}/,
  );
});
