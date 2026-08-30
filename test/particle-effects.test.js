import test from "node:test";
import assert from "node:assert/strict";
import { fadeOpacity } from "../src/particle-effects.js";

test("damage clouds fade in and back out", () => {
  assert.equal(fadeOpacity(0), 0);
  assert.equal(fadeOpacity(0.25), 0.5);
  assert.equal(fadeOpacity(0.5), 1);
  assert.equal(fadeOpacity(0.75), 0.5);
  assert.equal(fadeOpacity(1), 0);
});
