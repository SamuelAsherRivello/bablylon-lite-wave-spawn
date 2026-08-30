import { PhysicsViewer } from "@babylonjs/core/Debug/physicsViewer.js";

export class ColliderDebugController {
  constructor({ scene, getBodies, createViewer = (targetScene) => new PhysicsViewer(targetScene) }) {
    this.scene = scene;
    this.getBodies = getBodies;
    this.createViewer = createViewer;
    this.viewer = null;
    this.enabled = false;
    this.visibleBodies = new Set();
    this.observer = scene.onBeforeRenderObservable.add(() => this.sync());
  }

  setEnabled(enabled) {
    const next = enabled === true;
    if (this.enabled === next) return;
    this.enabled = next;
    if (next) {
      this.viewer ??= this.createViewer(this.scene);
      this.sync();
      return;
    }
    for (const body of this.visibleBodies) this.viewer?.hideBody(body);
    this.visibleBodies.clear();
  }

  sync() {
    if (!this.enabled) return;
    const currentBodies = new Set(this.getBodies().filter(Boolean));
    for (const body of this.visibleBodies) {
      if (!currentBodies.has(body)) {
        this.viewer.hideBody(body);
        this.visibleBodies.delete(body);
      }
    }
    for (const body of currentBodies) {
      if (!this.visibleBodies.has(body)) {
        this.viewer.showBody(body);
        this.visibleBodies.add(body);
      }
    }
  }

  dispose() {
    this.setEnabled(false);
    this.scene.onBeforeRenderObservable.remove(this.observer);
    this.viewer?.dispose();
    this.viewer = null;
  }
}
