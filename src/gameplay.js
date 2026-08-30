import {
  COLLISION_ENABLED, resolveCollision, HERO_RENDER_DELAY_MS,
  MOVEMENT_DURATION_MS, lineToY, HERO_CLASSES, selectTarget,
  createMovementVelocity, VERTICAL_SPEED_FACTOR, RETARGET_INTERVAL_SECONDS,
  canUseRangedAttack, createKnockbackDirection, createKnockbackVelocity,
  KNOCKBACK_DURATION_SECONDS, COLLISION_PUSH_DURATION_SECONDS,
  createCollisionPushVelocities,
} from "./battle-rules.js";
import { createSoundPlayer } from "./audio.js";
import { Hero } from "./hero.js";
import { HERO_ANIMATION_STATES } from "./hero-animation.js";
import { Matrix, Vector3 } from "@babylonjs/core";
import { BishopProjectile } from "./projectile.js";
import { ARENAS, applyArenaFriction, createArenaOrder } from "./arena-config.js";
import {
  AUDIO_SETTING_KEYS, GAMEPLAY_SETTING_KEYS, settingsStore,
} from "./settings-store.js";
import { PauseController } from "./pause-controller.js";
import { GROUND_CRACK_EFFECT } from "./environmental-effects.js";
import { GameWindow } from "./game-window.js";
import {
  GAME_PHASES, WAVE_INTRO_TIMINGS, battleResult, chooseHeroForWave,
  arenaForWave, createGameSession, formatXp, lineSlots, resetUnitForNextWave,
  startWave, beginHeroChoice, beginPowerupChoice, choosePowerupForWave,
} from "./game-session.js";
import {
  POWERUP_VARIANTS, applyPowerupVariant, clearWavePowerupModifiers,
  powerupActivationFrame, selectPowerupTargets,
} from "./powerups.js";

const ASSET_BASE = import.meta.env?.BASE_URL ?? "/";
const HEROES = [
  { id: "bishop", name: "Light Bishop", image: `${ASSET_BASE}art/heroes/light-bishop-v1.png` },
  { id: "pawn", name: "Light Pawn", image: `${ASSET_BASE}art/heroes/light-pawn-v2.png` },
  { id: "rook", name: "Light Rook", image: `${ASSET_BASE}art/heroes/light-rook-v2.png` },
];
const SHADOW_IMAGE = `${ASSET_BASE}art/shadow-oval.png`;
const PLAYER_LINES = { 4: 1, 5: 3, 6: 5 };
const ENEMY_LINES = { 1: 5, 2: 3, 3: 1 };
export const CONTACT_DAMAGE_COOLDOWN_SECONDS = 0.2;

export class Gameplay {
  constructor(scene, root, arenaConfig = ARENAS[0], pauseController = null,
    environmentalEffects = null, arenaSession = {}) {
    this.scene = scene;
    this.root = root;
    this.arenaConfig = arenaConfig;
    this.pauseController = pauseController ?? new PauseController({ scene });
    this.environmentalEffects = environmentalEffects;
    this.createArenaOrder = arenaSession.createArenaOrder ?? (() => createArenaOrder());
    this.random = arenaSession.random ?? Math.random;
    this.onArenaChange = arenaSession.onArenaChange ?? (() => {});
    this.playSound = createSoundPlayer(
      globalThis.Audio, () => settingsStore.get(AUDIO_SETTING_KEYS.sfx),
    );
    this.playerUnits = [];
    this.enemyUnits = [];
    this.dyingUnits = new Set();
    this.pendingBattleResult = null;
    this.formationPromises = [];
    this.contactCooldowns = new Map();
    this.projectiles = new Set();
    this.activePrompt = null;
    this.waveIntro = null;
    this.powerupActivation = null;
    this.movementActive = false;
    this.session = createGameSession(
      settingsStore.get(GAMEPLAY_SETTING_KEYS.skipStartMenu),
      arenaSession.initialArenaOrder ?? this.createArenaOrder(),
    );
    this.syncSelectionAliases();
    this.applyWaveArena(1);
    this.renderObserver = this.scene.onBeforeRenderObservable.add(() => {
      const rawDelta = this.scene.getEngine().getDeltaTime() / 1000;
      this.pauseController.update(rawDelta);
      const activeDelta = this.pauseController.getDelta(rawDelta);
      this.updateWaveIntro(activeDelta);
      this.updatePowerupActivation(activeDelta);
      this.updateContactCooldowns(activeDelta);
      if (this.movementActive && activeDelta > 0) this.updateMovement(activeDelta);
      [...this.playerUnits, ...this.enemyUnits].forEach((unit) => {
        if (!unit.removed) {
          unit.hero.updateDepthSort();
          this.syncUnitAnimation(unit);
        }
      });
    });
    if (this.session.phase === GAME_PHASES.MAIN_MENU) this.showStartMenu();
    else this.showWaveIntro(1);
  }

  syncSelectionAliases() {
    this.selected = this.session.selected;
    this.enemySelected = this.session.enemySelected;
  }

  updateContactCooldowns(activeDelta) {
    for (const [contactId, remaining] of this.contactCooldowns) {
      const nextRemaining = remaining - activeDelta;
      if (nextRemaining <= 0) this.contactCooldowns.delete(contactId);
      else this.contactCooldowns.set(contactId, nextRemaining);
    }
  }

  showPrompt(title, bodyText, actionText, action) {
    this.activePrompt?.close();
    const content = document.createElement("div");
    content.className = "game-prompt-content";
    const body = document.createElement("p");
    body.className = "game-prompt-body";
    body.textContent = bodyText;
    const button = document.createElement("button");
    button.className = "game-prompt-action";
    button.type = "button";
    button.textContent = actionText;
    let accepted = false;
    button.addEventListener("click", () => {
      if (accepted || this.pauseController.isPaused) return;
      accepted = true;
      button.disabled = true;
      this.playSound("click");
      this.activePrompt?.close();
      this.activePrompt = null;
      action();
    });
    content.append(body, button);
    this.activePrompt = new GameWindow({
      host: this.root, title, content, showCloseButton: false,
      closeOnBackdrop: false,
    });
    queueMicrotask(() => button.focus());
  }

  showStartMenu() {
    this.session.phase = GAME_PHASES.MAIN_MENU;
    this.removeTransientUi();
    this.showPrompt("Wave Spawn!", "Survive three waves of enemies to win",
      "Play", () => this.showWaveIntro(1));
  }

  showWaveIntro(waveNumber) {
    if (waveNumber > 1) this.prepareSurvivorsForNextWave();
    const generation = startWave(this.session, waveNumber);
    this.applyWaveArena(waveNumber);
    this.syncSelectionAliases();
    this.removeTransientUi();
    const layer = document.createElement("div");
    layer.className = "wave-intro";
    const label = document.createElement("p");
    label.className = "wave-intro-label";
    label.textContent = `Wave ${waveNumber}`;
    label.style.opacity = "0";
    layer.append(label);
    this.root.append(layer);
    this.waveIntro = { elapsed: 0, generation, label, layer };
  }

  applyWaveArena(waveNumber) {
    const arenaConfig = arenaForWave(this.session, waveNumber);
    if (!arenaConfig) return;
    this.arenaConfig = arenaConfig;
    this.onArenaChange(arenaConfig);
  }

  updateWaveIntro(deltaSeconds) {
    if (!this.waveIntro || deltaSeconds <= 0) return;
    const { fadeInSeconds, holdSeconds, fadeOutSeconds } = WAVE_INTRO_TIMINGS;
    const total = fadeInSeconds + holdSeconds + fadeOutSeconds;
    this.waveIntro.elapsed = Math.min(total, this.waveIntro.elapsed + deltaSeconds);
    const elapsed = this.waveIntro.elapsed;
    let opacity = 1;
    if (elapsed < WAVE_INTRO_TIMINGS.fadeInSeconds) {
      opacity = elapsed / fadeInSeconds;
    } else if (elapsed > fadeInSeconds + holdSeconds) {
      opacity = 1 - (elapsed - fadeInSeconds - holdSeconds) / fadeOutSeconds;
    }
    this.waveIntro.label.style.opacity = String(Math.max(0, Math.min(1, opacity)));
    if (elapsed < total) return;
    const { generation, layer } = this.waveIntro;
    this.waveIntro = null;
    layer.remove();
    if (generation !== this.session.generation) return;
    beginHeroChoice(this.session);
    this.showChoices();
  }

  showChoices() {
    const choices = HEROES.filter((hero) => !this.selected.includes(hero.id));
    const step = this.selected.length;
    this.root.querySelector(".selection-layer")?.remove();
    this.root.className = "game-ui choice-phase";
    const layer = document.createElement("div");
    layer.className = "selection-layer";
    const heading = document.createElement("p");
    heading.className = "phase-label";
    heading.textContent = [
      "Choose your backline", "Choose your next line", "Choose your front line",
    ][step];
    layer.append(heading);
    const cards = document.createElement("div");
    cards.className = "hero-cards";
    choices.forEach((hero) => cards.append(this.createHeroCard(hero)));
    layer.append(cards);
    this.root.append(layer);
  }

  createHeroCard(hero) {
    const card = document.createElement("button");
    card.className = "hero-card";
    card.type = "button";
    card.setAttribute("aria-label", `Choose ${hero.name}`);
    card.append(this.createHero(hero, hero.name, "card-hero"));
    const title = document.createElement("span");
    title.className = "hero-card-title";
    const stats = HERO_CLASSES[hero.id];
    const className = hero.id[0].toUpperCase() + hero.id.slice(1);
    const name = document.createElement("span");
    name.className = "hero-card-name";
    name.textContent = className;
    const statLine = document.createElement("span");
    statLine.className = "hero-card-stats";
    statLine.textContent = `❤️:${stats.health} ⚡:${stats.speed} ⚔️:${stats.damage}`;
    const xpLine = document.createElement("span");
    xpLine.className = "hero-card-xp";
    xpLine.textContent = formatXp(this.session.xp[hero.id]);
    title.append(name, statLine, xpLine);
    card.append(title);
    card.addEventListener("click", () => {
      if (this.pauseController.isPaused ||
          this.session.phase !== GAME_PHASES.CHOICE_MENU ||
          this.session.choiceStep !== "hero") return;
      this.playSound("click");
      this.chooseHero(hero);
    });
    return card;
  }

  async chooseHero(hero) {
    if (this.session.phase !== GAME_PHASES.CHOICE_MENU ||
        this.session.choiceStep !== "hero" ||
        this.selected.includes(hero.id)) return;
    this.session.phase = GAME_PHASES.FORMATION;
    this.root.querySelector(".selection-layer")?.remove();
    const line = 6 - this.selected.length;
    const enemyLine = 7 - line;
    const enemyChoices = HEROES.filter(
      (candidate) => !this.enemySelected.includes(candidate.id),
    );
    const enemy = enemyChoices[Math.floor(this.random() * enemyChoices.length)];
    chooseHeroForWave(this.session, hero.id, enemy.id);
    this.syncSelectionAliases();
    const generation = this.session.generation;
    const pairedFormations = Promise.all([
      this.addFormation("player", hero, line, generation),
      this.addFormation("enemy", enemy, enemyLine, generation),
    ]);
    this.formationPromises.push(pairedFormations);
    await pairedFormations;
    if (generation !== this.session.generation) return;
    if (line === 6 && this.session.waveNumber > 1) {
      this.relayoutBackLine("player", 6);
      this.relayoutBackLine("enemy", 1);
    }
    this.pauseController.schedule(0.5, () => {
      if (generation !== this.session.generation) return;
      if (this.selected.length < HEROES.length) {
        beginHeroChoice(this.session);
        this.showChoices();
      } else this.showPowerupChoices();
    });
  }

  showPowerupChoices() {
    const offer = beginPowerupChoice(this.session, this.random);
    this.root.querySelector(".selection-layer")?.remove();
    this.root.className = "game-ui choice-phase";
    const layer = document.createElement("div");
    layer.className = "selection-layer powerup-selection";
    const heading = document.createElement("p");
    heading.className = "phase-label";
    heading.textContent = "Choose Powerup";
    const cards = document.createElement("div");
    cards.className = "hero-cards powerup-cards";
    offer.forEach((variant) => cards.append(this.createPowerupCard(variant)));
    layer.append(heading, cards);
    this.root.append(layer);
  }

  createPowerupCard(variant) {
    const card = document.createElement("button");
    card.className = `hero-card powerup-card powerup-card--${variant.polarity}`;
    card.type = "button";
    const target = variant.targetSide === "player" ? "player row" : "enemy row";
    card.setAttribute("aria-label",
      `Choose ${variant.title} ${variant.sign}${variant.amount} for a ${target}`);
    const badge = document.createElement("span");
    badge.className = `powerup-badge powerup-badge--${variant.badgeColor}`;
    badge.textContent = variant.sign;
    const art = document.createElement("img");
    art.className = "powerup-card-art";
    art.src = variant.art;
    art.alt = variant.title;
    const title = document.createElement("span");
    title.className = "hero-card-title";
    const name = document.createElement("span");
    name.className = "hero-card-name";
    name.textContent = variant.title;
    const statLine = document.createElement("span");
    statLine.className = "hero-card-stats";
    statLine.textContent = `${variant.statIcon}:${variant.sign}${variant.amount}`;
    const xpLine = document.createElement("span");
    xpLine.className = "hero-card-xp";
    xpLine.textContent = formatXp(this.session.powerupXp[variant.id]);
    title.append(name, statLine, xpLine);
    card.append(badge, art, title);
    card.addEventListener("click", () => {
      if (this.pauseController.isPaused ||
          this.session.phase !== GAME_PHASES.CHOICE_MENU ||
          this.session.choiceStep !== "powerup") return;
      this.playSound("click");
      this.choosePowerup(variant);
    });
    return card;
  }

  async choosePowerup(variant) {
    if (this.session.phase !== GAME_PHASES.CHOICE_MENU ||
        this.session.choiceStep !== "powerup") return;
    choosePowerupForWave(this.session, variant.id);
    this.root.querySelector(".selection-layer")?.remove();
    const targets = selectPowerupTargets(
      variant, this.playerUnits, this.enemyUnits, this.random,
    );
    const { defeated } = applyPowerupVariant(variant, targets);
    const activationPromise = variant.baseId === "shield"
      ? this.startShieldActivation(targets, variant)
      : Promise.resolve();
    const removalPromises = defeated.map((unit) =>
      this.removeUnit(unit, Math.abs(variant.signedAmount)));
    await Promise.all([activationPromise, ...removalPromises]);
    if (this.session.choiceStep !== "activation") return;
    await this.finishSetup(this.session.generation);
  }

  startShieldActivation(units, variant) {
    this.clearPowerupActivation();
    const layer = document.createElement("div");
    layer.className = "powerup-effects-layer";
    const entries = units.filter((unit) => !unit.removed).map((unit) => {
      const icon = document.createElement("img");
      icon.className = `powerup-shield-icon powerup-shield-icon--${variant.polarity}`;
      icon.src = variant.art;
      icon.alt = "";
      icon.setAttribute("aria-hidden", "true");
      layer.append(icon);
      return { unit, icon };
    });
    this.root.append(layer);
    return new Promise((resolve) => {
      this.powerupActivation = { elapsed: 0, duration: 0.9, entries, layer, resolve };
      this.updatePowerupActivation(0);
    });
  }

  updatePowerupActivation(deltaSeconds) {
    const activation = this.powerupActivation;
    if (!activation) return;
    activation.elapsed = Math.min(
      activation.duration, activation.elapsed + Math.max(0, deltaSeconds),
    );
    const frame = powerupActivationFrame(activation.elapsed, activation.duration);
    const canvas = this.scene.getEngine().getRenderingCanvas();
    const camera = this.scene.activeCamera;
    if (canvas && camera) {
      const viewport = camera.viewport.toGlobal(canvas.width, canvas.height);
      activation.entries.forEach(({ unit, icon }) => {
        const projected = Vector3.Project(
          unit.hero.root.getAbsolutePosition(), Matrix.IdentityReadOnly,
          this.scene.getTransformMatrix(), viewport,
        );
        icon.style.left = `${projected.x / canvas.width * 100}%`;
        icon.style.top = `${projected.y / canvas.height * 100}%`;
        icon.style.setProperty("--powerup-rise", `${frame.riseCqw}cqw`);
        icon.style.opacity = String(frame.opacity);
      });
    }
    if (frame.complete) this.clearPowerupActivation(true);
  }

  clearPowerupActivation(completed = false) {
    const activation = this.powerupActivation;
    if (!activation) return;
    this.powerupActivation = null;
    activation.layer.remove();
    if (completed) activation.resolve();
  }

  addFormation(side, hero, line, generation = this.session.generation) {
    const count = side === "player" ? PLAYER_LINES[line] : ENEMY_LINES[line];
    return new Promise((resolve) => {
      Array.from({ length: count }, (_, index) => index).forEach((index) => {
        this.pauseController.schedule(index * HERO_RENDER_DELAY_MS / 1000, () => {
          if (generation !== this.session.generation) return;
          const unit = this.createUnit(side, hero, line, index, count);
          if (side === "player") this.playerUnits.push(unit);
          else this.enemyUnits.push(unit);
          if (index === count - 1) resolve();
        });
      });
    });
  }

  createUnit(side, hero, line, index, count) {
    const slot = index - (count - 1) / 2;
    const mesh = new Hero(`${side}-${hero.id}-${line}-${index}`, hero.image,
      new Vector3(slot * 0.58, lineToY(line), 0), this.scene, hero.id, side,
      this.pauseController);
    const unit = {
      side, line, hero: mesh, speed: 0, targetAgeSeconds: 0,
      knockbackDirection: { x: 0, y: 0 }, knockbackElapsedSeconds: 0,
      knockbackRemainingSeconds: 0, collisionPushVelocity: { x: 0, y: 0 },
      collisionPushRemainingSeconds: 0,
    };
    mesh.root.metadata = { unit };
    mesh.physics.body.getCollisionObservable().add((event) => {
      const otherUnit = event.collidedAgainst?.transformNode?.metadata?.unit ??
        event.collidedAgainst?.metadata?.unit;
      if (otherUnit && otherUnit.side !== side) {
        this.applyCollisionPush(unit, otherUnit);
        this.resolveUnitCollision(unit, otherUnit);
      }
    });
    return unit;
  }

  createHero(hero, alt, className) {
    const wrapper = document.createElement("span");
    wrapper.className = `hero ${className}`;
    const shadow = document.createElement("img");
    shadow.className = "hero-shadow";
    shadow.src = SHADOW_IMAGE;
    shadow.alt = "";
    shadow.setAttribute("aria-hidden", "true");
    const sprite = document.createElement("img");
    sprite.className = "hero-sprite";
    sprite.src = hero.image;
    sprite.alt = alt;
    wrapper.append(shadow, sprite);
    return wrapper;
  }

  async finishSetup(generation = this.session.generation) {
    await Promise.all(this.formationPromises);
    if (generation !== this.session.generation) return;
    this.session.phase = GAME_PHASES.FORMATION;
    this.root.className = "game-ui battle-phase";
    this.playSound("levelStart");
    this.pauseController.schedule(1, () => {
      if (generation !== this.session.generation) return;
      this.startFrameMovement();
      if (COLLISION_ENABLED) {
        this.pauseController.schedule(MOVEMENT_DURATION_MS / 2000, () => {
          if (generation === this.session.generation) this.playSound("collision");
        });
      }
    });
  }

  startFrameMovement() {
    this.session.phase = GAME_PHASES.BATTLE;
    this.movementActive = true;
    this.updateMovement();
  }

  updateMovement(deltaSeconds = 1 / 60) {
    [...this.playerUnits, ...this.enemyUnits].forEach((unit) => {
      if (unit.removed) return;
      unit.targetAgeSeconds += deltaSeconds;
      const opponents = unit.side === "player" ? this.enemyUnits : this.playerUnits;
      if (unit.targetAgeSeconds >= RETARGET_INTERVAL_SECONDS) unit.target = null;
      if (!unit.target || unit.target.removed || !opponents.includes(unit.target)) {
        unit.target = selectTarget(unit, opponents);
        unit.targetAgeSeconds = 0;
      }
      if (unit.knockbackRemainingSeconds > 0) {
        const progress = unit.knockbackElapsedSeconds / KNOCKBACK_DURATION_SECONDS;
        const velocity = createKnockbackVelocity(unit.knockbackDirection, progress);
        unit.hero.physics?.body?.setLinearVelocity(new Vector3(velocity.x, velocity.y, 0));
        unit.knockbackElapsedSeconds += deltaSeconds;
        unit.knockbackRemainingSeconds = Math.max(
          0, unit.knockbackRemainingSeconds - deltaSeconds,
        );
        if (unit.knockbackRemainingSeconds === 0) {
          unit.hero.physics?.body?.setLinearVelocity(Vector3.Zero());
        }
        return;
      }
      if (unit.collisionPushRemainingSeconds > 0) {
        const velocity = unit.collisionPushVelocity;
        unit.hero.physics?.body?.setLinearVelocity(
          new Vector3(velocity.x, velocity.y, 0),
        );
        unit.collisionPushRemainingSeconds = Math.max(
          0, unit.collisionPushRemainingSeconds - deltaSeconds,
        );
        if (unit.collisionPushRemainingSeconds === 0) {
          unit.hero.physics?.body?.setLinearVelocity(Vector3.Zero());
        }
        return;
      }
      const target = unit.target;
      if (!target) {
        unit.hero.physics?.body?.setLinearVelocity(Vector3.Zero());
        return;
      }
      unit.speed = applyArenaFriction(
        unit.hero.speed * VERTICAL_SPEED_FACTOR, this.arenaConfig.friction,
      );
      const velocity = createMovementVelocity(unit, target, unit.speed);
      unit.hero.physics.body.setLinearVelocity(new Vector3(velocity.x, velocity.y, 0));
      this.tryRangedAttack(unit, target, deltaSeconds);
    });
  }

  tryRangedAttack(unit, target, deltaSeconds) {
    if (!unit.hero.profile.attacks.includes("ranged")) return;
    unit.rangedCooldown = Math.max(0, (unit.rangedCooldown ?? 0) - deltaSeconds);
    if (unit.rangedCooldown > 0 || !canUseRangedAttack(unit, target)) return;
    unit.rangedCooldown = unit.hero.profile.rangedCooldown;
    const projectile = new BishopProjectile(
      this.scene, unit, target, (defender, attacker, impactDirection) => {
        if (defender.removed) return;
        defender.hero.health = Math.max(0,
          defender.hero.health - attacker.hero.damage);
        if (defender.hero.health <= 0) {
          this.removeUnit(defender, attacker.hero.damage);
        } else this.applyKnockback(defender, impactDirection);
      }, this.pauseController, (position) => {
        this.projectiles.delete(projectile);
        this.environmentalEffects?.create(GROUND_CRACK_EFFECT, position, {
          damage: unit.hero.damage,
        });
      },
    );
    this.playSound("projectileLaunch");
    this.projectiles.add(projectile);
  }

  syncUnitAnimation(unit) {
    const linearVelocity = unit.hero.physics?.body?.getLinearVelocity();
    if (!linearVelocity) return;
    const isMoving = Math.hypot(linearVelocity.x, linearVelocity.y) > 0.01;
    unit.hero.playAnimation(isMoving ? HERO_ANIMATION_STATES.WALKING :
      HERO_ANIMATION_STATES.IDLE);
  }

  applyCollisionPush(first, second) {
    if (first.removed || second.removed) return;
    const firstVelocity = first.hero.physics?.body?.getLinearVelocity();
    const secondVelocity = second.hero.physics?.body?.getLinearVelocity();
    if (!firstVelocity || !secondVelocity) return;
    const fallback = first.side === "player" ? { x: 0, y: 1 } : { x: 0, y: -1 };
    const response = createCollisionPushVelocities({
      position: first.hero.root.position, velocity: firstVelocity,
      mass: first.hero.mass,
    }, {
      position: second.hero.root.position, velocity: secondVelocity,
      mass: second.hero.mass,
    }, fallback);
    first.collisionPushVelocity = response.firstVelocity;
    second.collisionPushVelocity = response.secondVelocity;
    first.collisionPushRemainingSeconds = COLLISION_PUSH_DURATION_SECONDS;
    second.collisionPushRemainingSeconds = COLLISION_PUSH_DURATION_SECONDS;
  }

  resolveUnitCollision(player, enemy) {
    if (this.pauseController.isPaused ||
        this.session.phase !== GAME_PHASES.BATTLE ||
        player.removed || enemy.removed) return;
    const contactId = `${player.hero.name}:${enemy.hero.name}`;
    if (this.contactCooldowns.has(contactId)) return;
    if (!player.hero.canTakeDamage() || !enemy.hero.canTakeDamage()) return;
    this.contactCooldowns.set(contactId, CONTACT_DAMAGE_COOLDOWN_SECONDS);
    const result = resolveCollision(player.hero, enemy.hero);
    const playerPosition = player.hero.root.position.clone();
    const enemyPosition = enemy.hero.root.position.clone();
    player.hero.health = result.attackerHealth;
    enemy.hero.health = result.defenderHealth;
    if (player.hero.health <= 0) this.removeUnit(player, enemy.hero.damage);
    else {
      this.applyKnockback(player, createKnockbackDirection(
        enemyPosition, playerPosition, { x: 0, y: -1 },
      ));
      player.hero.playAnimation(HERO_ANIMATION_STATES.TAKE_DAMAGE);
      player.hero.playDamageEffect();
    }
    if (enemy.hero.health <= 0) this.removeUnit(enemy, player.hero.damage);
    else {
      this.applyKnockback(enemy, createKnockbackDirection(
        playerPosition, enemyPosition, { x: 0, y: 1 },
      ));
      enemy.hero.playAnimation(HERO_ANIMATION_STATES.TAKE_DAMAGE);
      enemy.hero.playDamageEffect();
    }
  }

  applyKnockback(unit, direction) {
    if (unit.removed) return;
    unit.collisionPushRemainingSeconds = 0;
    unit.knockbackDirection = direction;
    unit.knockbackElapsedSeconds = 0;
    unit.knockbackRemainingSeconds = KNOCKBACK_DURATION_SECONDS;
  }

  removeUnit(unit, damage) {
    if (unit.removed) return unit.removalPromise ?? Promise.resolve();
    let resolveRemoval;
    unit.removalPromise = new Promise((resolve) => { resolveRemoval = resolve; });
    unit.removed = true;
    [...this.playerUnits, ...this.enemyUnits].forEach((otherUnit) => {
      if (otherUnit.target === unit) otherUnit.target = null;
    });
    const units = unit.side === "player" ? this.playerUnits : this.enemyUnits;
    const index = units.indexOf(unit);
    if (index !== -1) units.splice(index, 1);
    this.dyingUnits.add(unit);
    this.environmentalEffects?.create(GROUND_CRACK_EFFECT,
      unit.hero.root.position.clone(), { damage });
    unit.hero.disablePhysics();
    unit.hero.playAnimation(HERO_ANIMATION_STATES.DEAD, () => {
      this.dyingUnits.delete(unit);
      unit.hero.dispose();
      resolveRemoval();
      if (this.pendingBattleResult && this.dyingUnits.size === 0) {
        this.finalizeBattle(this.pendingBattleResult);
      }
    });
    if (!this.pendingBattleResult &&
        (!this.playerUnits.length || !this.enemyUnits.length)) {
      this.endBattle(this.playerUnits.length ? "player" : "enemy");
    }
    return unit.removalPromise;
  }

  endBattle(winner) {
    if (this.pendingBattleResult) return;
    this.pendingBattleResult = winner;
    this.movementActive = false;
    this.pauseController.clearScheduled();
    this.stopAllUnits();
    clearWavePowerupModifiers([...this.playerUnits, ...this.enemyUnits]);
    if (this.dyingUnits.size > 0) return;
    this.finalizeBattle(winner);
  }

  finalizeBattle(winner) {
    const result = battleResult(this.session.waveNumber, winner);
    this.pendingBattleResult = null;
    this.session.phase = result.phase;
    this.root.className = "game-ui battle-over";
    this.clearProjectiles();
    this.contactCooldowns.clear();
    this.playSound("levelStop");
    this.showPrompt(result.title, result.body, result.action, () => {
      if (result.phase === GAME_PHASES.WAVE_COMPLETE) {
        this.showWaveIntro(this.session.waveNumber + 1);
      } else this.restartGame();
    });
  }

  prepareSurvivorsForNextWave() {
    this.movementActive = false;
    this.pauseController.clearScheduled();
    this.clearProjectiles();
    this.contactCooldowns.clear();
    this.relayoutBackLine("player", 6, true);
    this.relayoutBackLine("enemy", 1, true);
  }

  relayoutBackLine(side, line, includeAll = false) {
    const units = (side === "player" ? this.playerUnits : this.enemyUnits)
      .filter((unit) => !unit.removed && (includeAll || unit.line === line));
    const slots = lineSlots(units.length);
    units.forEach((unit, index) => resetUnitForNextWave(unit, line, slots[index]));
  }

  stopAllUnits() {
    [...this.playerUnits, ...this.enemyUnits].forEach((unit) => {
      unit.hero.physics?.body?.setLinearVelocity(Vector3.Zero());
      unit.hero.physics?.body?.setAngularVelocity?.(Vector3.Zero());
    });
  }

  clearProjectiles() {
    [...this.projectiles].forEach((projectile) => projectile.dispose());
    this.projectiles.clear();
  }

  restartGame() {
    this.disposeSession();
    this.pauseController.reset();
    this.session = createGameSession(
      settingsStore.get(GAMEPLAY_SETTING_KEYS.skipStartMenu),
      this.createArenaOrder(),
    );
    this.syncSelectionAliases();
    this.applyWaveArena(1);
    if (this.session.phase === GAME_PHASES.MAIN_MENU) this.showStartMenu();
    else this.showWaveIntro(1);
  }

  disposeSession() {
    this.movementActive = false;
    this.waveIntro?.layer.remove();
    this.waveIntro = null;
    this.activePrompt?.close();
    this.activePrompt = null;
    this.pauseController.clearScheduled();
    this.clearPowerupActivation(true);
    clearWavePowerupModifiers([...this.playerUnits, ...this.enemyUnits]);
    this.clearProjectiles();
    [...this.playerUnits, ...this.enemyUnits, ...this.dyingUnits]
      .forEach((unit) => unit.hero.dispose());
    this.playerUnits = [];
    this.enemyUnits = [];
    this.dyingUnits.clear();
    this.pendingBattleResult = null;
    this.formationPromises = [];
    this.contactCooldowns.clear();
    this.removeTransientUi();
  }

  removeTransientUi() {
    this.root.querySelector(".selection-layer")?.remove();
    this.root.querySelector(".wave-intro")?.remove();
    this.root.querySelector(".powerup-effects-layer")?.remove();
  }

  dispose() {
    this.disposeSession();
    this.scene.onBeforeRenderObservable.remove(this.renderObserver);
  }

  getPhysicsBodies() {
    return [...this.playerUnits, ...this.enemyUnits]
      .map((unit) => unit.hero.physics?.body).filter(Boolean);
  }
}
