import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("camera presents positive X rightward and positive Y upward", async () => {
  const source = await readFile(new URL("../src/main.js", import.meta.url), "utf8");

  assert.match(source, /new FreeCamera\("locked-camera", new Vector3\(0, 0, -10\), scene\)/);
  assert.match(source, /camera\.orthoLeft = -4\.5/);
  assert.match(source, /camera\.orthoRight = 4\.5/);
  assert.match(source, /camera\.orthoBottom = -8/);
  assert.match(source, /camera\.orthoTop = 8/);
});
