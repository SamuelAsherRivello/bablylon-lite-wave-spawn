import test from "node:test";
import assert from "node:assert/strict";
import { ColliderDebugController } from "../src/collider-debug-controller.js";

class FakeObservable {
  constructor() { this.callbacks = new Set(); }
  add(callback) { this.callbacks.add(callback); return callback; }
  remove(callback) { this.callbacks.delete(callback); }
  notify() { this.callbacks.forEach((callback) => callback()); }
}

test("collider debug controller tracks current and newly created bodies while enabled", () => {
  const beforeRender = new FakeObservable();
  const first = { id: "first" };
  const second = { id: "second" };
  let bodies = [first];
  const shown = [];
  const hidden = [];
  let disposed = false;
  const controller = new ColliderDebugController({
    scene: { onBeforeRenderObservable: beforeRender },
    getBodies: () => bodies,
    createViewer: () => ({
      showBody: (body) => shown.push(body),
      hideBody: (body) => hidden.push(body),
      dispose: () => { disposed = true; },
    }),
  });

  controller.setEnabled(true);
  assert.deepEqual(shown, [first]);
  bodies = [first, second];
  beforeRender.notify();
  assert.deepEqual(shown, [first, second]);
  bodies = [second];
  beforeRender.notify();
  assert.deepEqual(hidden, [first]);
  controller.setEnabled(false);
  assert.deepEqual(hidden, [first, second]);
  controller.dispose();
  assert.equal(disposed, true);
  assert.equal(beforeRender.callbacks.size, 0);
});

test("collider debug controller leaves bodies untouched while disabled", () => {
  const beforeRender = new FakeObservable();
  const body = { id: "body", velocity: 7 };
  let viewerCreated = false;
  const controller = new ColliderDebugController({
    scene: { onBeforeRenderObservable: beforeRender },
    getBodies: () => [body],
    createViewer: () => { viewerCreated = true; return {}; },
  });
  beforeRender.notify();
  assert.equal(viewerCreated, false);
  assert.equal(body.velocity, 7);
  controller.dispose();
});
