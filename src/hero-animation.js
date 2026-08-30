import {
  BackEase,
  BezierCurveEase,
  BounceEase,
  CircleEase,
  CubicEase,
  EasingFunction,
  ElasticEase,
  ExponentialEase,
  PowerEase,
  QuadraticEase,
  QuarticEase,
  QuinticEase,
  SineEase,
} from "@babylonjs/core/Animations/easing.js";

export const HERO_ANIMATION_STATES = Object.freeze({
  SPAWN: "spawn",
  IDLE: "idle",
  WALKING: "walking",
  TAKE_DAMAGE: "take-damage",
  DEAD: "dead",
});

export const HERO_ANIMATION_CONFIG = Object.freeze({
  spawn: Object.freeze({
    durationSeconds: 0.2,
    easingType: "BackEase",
    easingMode: "EASEOUT",
  }),
  idle: Object.freeze({
    minimumCycleSeconds: 0.1,
    maximumCycleSeconds: 0.2,
    maximumVerticalOffset: 0.025,
    maximumHorizontalOffset: 0,
    maximumRotationRadians: 0.02,
  }),
  walking: Object.freeze({
    minimumCycleSeconds: 0.1,
    maximumCycleSeconds: 0.2,
    maximumVerticalOffset: 0.08,
    maximumHorizontalOffset: 0.035,
    maximumRotationRadians: 0.06,
  }),
  damage: Object.freeze({
    blinkColor: "#ff453a",
    blinkDurationSeconds: 0.1,
  }),
  dead: Object.freeze({
    blinkColor: "#ffffff",
    blinkDurationSeconds: 0.1,
    shrinkDurationSeconds: 0.1,
  }),
});

export const HERO_EASING_TYPES = Object.freeze([
  "CircleEase",
  "BackEase",
  "BounceEase",
  "CubicEase",
  "ElasticEase",
  "ExponentialEase",
  "PowerEase",
  "QuadraticEase",
  "QuarticEase",
  "QuinticEase",
  "SineEase",
  "BezierCurveEase",
]);

const EASING_CLASSES = {
  CircleEase,
  BackEase,
  BounceEase,
  CubicEase,
  ElasticEase,
  ExponentialEase,
  PowerEase,
  QuadraticEase,
  QuarticEase,
  QuinticEase,
  SineEase,
  BezierCurveEase,
};

const EASING_MODES = {
  EASEIN: EasingFunction.EASINGMODE_EASEIN,
  EASEOUT: EasingFunction.EASINGMODE_EASEOUT,
  EASEINOUT: EasingFunction.EASINGMODE_EASEINOUT,
};

export function createSpawnEasing(config = HERO_ANIMATION_CONFIG.spawn) {
  const EasingType = EASING_CLASSES[config.easingType] ?? BackEase;
  const easing = new EasingType();
  easing.setEasingMode(
    EASING_MODES[config.easingMode] ?? EasingFunction.EASINGMODE_EASEOUT,
  );
  return easing;
}

function randomBetween(minimum, maximum, random) {
  return minimum + ((maximum - minimum) * random());
}

function randomSigned(maximum, random) {
  return maximum === 0 ? 0 : ((random() * 2) - 1) * maximum;
}

function variationsMatch(first, second) {
  return first && second &&
    first.durationSeconds === second.durationSeconds &&
    first.verticalOffset === second.verticalOffset &&
    first.horizontalOffset === second.horizontalOffset &&
    first.rotationRadians === second.rotationRadians;
}

export function createCycleVariation(config, random = Math.random, previous = null) {
  const variation = {
    durationSeconds: randomBetween(
      config.minimumCycleSeconds,
      config.maximumCycleSeconds,
      random,
    ),
    verticalOffset: randomSigned(config.maximumVerticalOffset, random),
    horizontalOffset: randomSigned(config.maximumHorizontalOffset ?? 0, random),
    rotationRadians: randomSigned(config.maximumRotationRadians, random),
  };

  if (variationsMatch(variation, previous)) {
    const durationStep = (config.maximumCycleSeconds - config.minimumCycleSeconds) * 0.1;
    variation.durationSeconds = variation.durationSeconds + durationStep <=
        config.maximumCycleSeconds
      ? variation.durationSeconds + durationStep
      : variation.durationSeconds - durationStep;
  }

  return variation;
}

function isRepeatingState(state) {
  return state === HERO_ANIMATION_STATES.IDLE ||
    state === HERO_ANIMATION_STATES.WALKING;
}

export class HeroAnimationController {
  constructor({
    visual,
    random = Math.random,
    config = HERO_ANIMATION_CONFIG,
    onDeathComplete = () => {},
  }) {
    this.visual = visual;
    this.random = random;
    this.config = config;
    this.onDeathComplete = onDeathComplete;
    this.state = HERO_ANIMATION_STATES.SPAWN;
    this.previousRepeatingState = HERO_ANIMATION_STATES.IDLE;
    this.elapsedSeconds = 0;
    this.cycleVariation = null;
    this.deathCompleted = false;
    this.spawnEasing = createSpawnEasing(this.config.spawn);
    this.visual.setOffset(0, 0);
    this.visual.setRotation(0);
    this.visual.setScale(0);
  }

  requestState(nextState) {
    if (this.state === HERO_ANIMATION_STATES.DEAD) return;

    if (nextState === HERO_ANIMATION_STATES.DEAD) {
      this.state = HERO_ANIMATION_STATES.DEAD;
      this.elapsedSeconds = 0;
      this.resetPose();
      this.visual.setBlinkColor(this.config.dead.blinkColor);
      return;
    }

    if (nextState === HERO_ANIMATION_STATES.TAKE_DAMAGE) {
      if (isRepeatingState(this.state)) {
        this.previousRepeatingState = this.state;
      }
      this.state = HERO_ANIMATION_STATES.TAKE_DAMAGE;
      this.elapsedSeconds = 0;
      this.resetPose();
      this.visual.setBlinkColor(this.config.damage.blinkColor);
      return;
    }

    if (!isRepeatingState(nextState)) return;

    if (this.state === HERO_ANIMATION_STATES.SPAWN) {
      this.previousRepeatingState = nextState;
      return;
    }

    if (this.state === HERO_ANIMATION_STATES.TAKE_DAMAGE) {
      this.previousRepeatingState = nextState;
      return;
    }

    if (this.state !== nextState) {
      this.state = nextState;
      this.previousRepeatingState = nextState;
      this.beginRepeatingCycle();
    }
  }

  update(deltaSeconds) {
    const safeDeltaSeconds = Math.max(0, deltaSeconds);
    if (this.state === HERO_ANIMATION_STATES.DEAD) {
      this.updateDead(safeDeltaSeconds);
    } else if (this.state === HERO_ANIMATION_STATES.TAKE_DAMAGE) {
      this.updateDamage(safeDeltaSeconds);
    } else if (this.state === HERO_ANIMATION_STATES.SPAWN) {
      this.updateSpawn(safeDeltaSeconds);
    } else {
      this.updateRepeating(safeDeltaSeconds);
    }
  }

  updateSpawn(deltaSeconds) {
    this.elapsedSeconds += deltaSeconds;
    const progress = Math.min(
      1,
      this.elapsedSeconds / this.config.spawn.durationSeconds,
    );
    this.visual.setScale(this.spawnEasing.ease(progress));

    if (progress === 1) {
      this.state = this.previousRepeatingState;
      this.beginRepeatingCycle();
    }
  }

  beginRepeatingCycle() {
    const stateConfig = this.config[this.state];
    this.cycleVariation = createCycleVariation(
      stateConfig,
      this.random,
      this.cycleVariation,
    );
    this.elapsedSeconds = 0;
    this.resetPose();
  }

  updateRepeating(deltaSeconds) {
    this.elapsedSeconds += deltaSeconds;
    while (this.elapsedSeconds >= this.cycleVariation.durationSeconds) {
      this.elapsedSeconds -= this.cycleVariation.durationSeconds;
      const carrySeconds = this.elapsedSeconds;
      this.beginRepeatingCycle();
      this.elapsedSeconds = carrySeconds;
    }

    const progress = this.elapsedSeconds / this.cycleVariation.durationSeconds;
    const motion = Math.sin(Math.PI * progress);
    this.visual.setOffset(
      this.cycleVariation.horizontalOffset * motion,
      this.cycleVariation.verticalOffset * motion,
    );
    this.visual.setRotation(this.cycleVariation.rotationRadians * motion);
    this.visual.setScale(1);
  }

  updateDamage(deltaSeconds) {
    this.elapsedSeconds += deltaSeconds;
    if (this.elapsedSeconds < this.config.damage.blinkDurationSeconds) return;

    this.visual.setBlinkColor(null);
    this.state = this.previousRepeatingState;
    this.beginRepeatingCycle();
  }

  updateDead(deltaSeconds) {
    this.elapsedSeconds += deltaSeconds;
    const blinkDuration = this.config.dead.blinkDurationSeconds;
    if (this.elapsedSeconds < blinkDuration) return;

    this.visual.setBlinkColor(null);
    const shrinkElapsed = this.elapsedSeconds - blinkDuration;
    const shrinkProgress = Math.min(
      1,
      shrinkElapsed / this.config.dead.shrinkDurationSeconds,
    );
    this.visual.setScale(1 - shrinkProgress);

    if (shrinkProgress === 1 && !this.deathCompleted) {
      this.deathCompleted = true;
      this.onDeathComplete();
    }
  }

  resetPose() {
    this.visual.setOffset(0, 0);
    this.visual.setRotation(0);
    this.visual.setScale(1);
  }
}
