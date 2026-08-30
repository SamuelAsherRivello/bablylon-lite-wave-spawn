function cloneVector(value) {
  if (typeof value?.clone === "function") return value.clone();
  return { x: value?.x ?? 0, y: value?.y ?? 0, z: value?.z ?? 0 };
}

function zeroVector(value) {
  if (value?.constructor && value.constructor !== Object) {
    return new value.constructor(0, 0, 0);
  }
  return { x: 0, y: 0, z: 0 };
}

export class PauseController {
  constructor({ scene = null, getBodies = () => [] } = {}) {
    this.scene = scene;
    this.getBodies = getBodies;
    this.isPaused = false;
    this.isTerminal = false;
    this.scheduled = new Set();
    this.velocitySnapshots = new Map();
  }

  getDelta(deltaSeconds) {
    return this.isPaused || this.isTerminal ? 0 : Math.max(0, deltaSeconds);
  }

  schedule(delaySeconds, callback) {
    const task = { remaining: Math.max(0, delaySeconds), callback };
    this.scheduled.add(task);
    return () => this.scheduled.delete(task);
  }

  update(deltaSeconds) {
    const activeDelta = this.getDelta(deltaSeconds);
    if (activeDelta <= 0) return;
    for (const task of [...this.scheduled]) {
      task.remaining -= activeDelta;
      if (task.remaining > Number.EPSILON * 8) continue;
      this.scheduled.delete(task);
      task.callback();
    }
  }

  pause() {
    if (this.isPaused || this.isTerminal) return;
    this.isPaused = true;
    for (const body of this.getBodies()) {
      if (!body?.getLinearVelocity || !body?.setLinearVelocity) continue;
      const linear = body.getLinearVelocity();
      const angular = body.getAngularVelocity?.();
      this.velocitySnapshots.set(body, {
        linear: cloneVector(linear),
        angular: cloneVector(angular),
      });
      body.setLinearVelocity(zeroVector(linear));
      body.setAngularVelocity?.(zeroVector(angular));
    }
    if (this.scene) this.scene.physicsEnabled = false;
  }

  resume() {
    if (!this.isPaused || this.isTerminal) return;
    if (this.scene) this.scene.physicsEnabled = true;
    for (const [body, snapshot] of this.velocitySnapshots) {
      try {
        body.setLinearVelocity?.(snapshot.linear);
        body.setAngularVelocity?.(snapshot.angular);
      } catch {
        // A body can be disposed while a terminal transition completes.
      }
    }
    this.velocitySnapshots.clear();
    this.isPaused = false;
  }

  setTerminal() {
    this.isTerminal = true;
    this.isPaused = false;
    this.velocitySnapshots.clear();
    this.scheduled.clear();
    if (this.scene) this.scene.physicsEnabled = false;
  }

  clearScheduled() {
    this.scheduled.clear();
  }

  reset() {
    this.isTerminal = false;
    this.isPaused = false;
    this.scheduled.clear();
    this.velocitySnapshots.clear();
    if (this.scene) this.scene.physicsEnabled = true;
  }
}
