import {
  COLLISION_ENABLED,
  resolveCollision,
  HERO_RENDER_DELAY_MS,
  MOVEMENT_DURATION_MS,
  lineToY,
  HERO_CLASSES,
  selectTarget,
  createMovementVelocity,
  VERTICAL_SPEED_FACTOR,
  RETARGET_INTERVAL_SECONDS,
  canUseRangedAttack,
  createKnockbackDirection,
  createKnockbackVelocity,
  KNOCKBACK_DURATION_SECONDS,
} from "./battle-rules.js";
import { createSoundPlayer } from "./audio.js";
import { Hero } from "./hero.js";
import { HERO_ANIMATION_STATES } from "./hero-animation.js";
import { Vector3 } from "@babylonjs/core";
import { BishopProjectile } from "./projectile.js";
import { ARENAS, applyArenaFriction } from "./arena-config.js";
import { AUDIO_SETTING_KEYS, settingsStore } from "./settings-store.js";
import { PauseController } from "./pause-controller.js";
import { GROUND_CRACK_EFFECT } from "./environmental-effects.js";
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
  constructor(
    scene,
    root,
    arenaConfig = ARENAS[0],
    pauseController = null,
    environmentalEffects = null,
  ) {
    this.scene = scene;
    this.root = root;
    this.arenaConfig = arenaConfig;
    this.pauseController = pauseController ?? new PauseController({ scene });
    this.environmentalEffects = environmentalEffects;
    this.playSound = createSoundPlayer(
      globalThis.Audio,
      () => settingsStore.get(AUDIO_SETTING_KEYS.sfx),
    );
    this.selected = [];
    this.enemySelected = [];
    this.playerUnits = [];
    this.enemyUnits = [];
    this.dyingUnits = new Set();
    this.pendingBattleResult = null;
    this.formationPromises = [];
    this.contactCooldowns = new Map();
    this.projectiles = new Set();
    this.scene.onBeforeRenderObservable.add(() => {
      const rawDelta = this.scene.getEngine().getDeltaTime() / 1000;
      this.pauseController.update(rawDelta);
      const activeDelta = this.pauseController.getDelta(rawDelta);
      for (const [contactId, remaining] of this.contactCooldowns) {
        const nextRemaining = remaining - activeDelta;
        if (nextRemaining <= 0) this.contactCooldowns.delete(contactId);
        else this.contactCooldowns.set(contactId, nextRemaining);
      }
      [...this.playerUnits, ...this.enemyUnits].forEach((unit) => {
        if (!unit.removed) {
          unit.hero.updateDepthSort();
          this.syncUnitAnimation(unit);
        }
      });
    });
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
      "Choose your backline",
      "Choose your next line",
      "Choose your front line",
    ][step];
    layer.append(heading);

    const cards = document.createElement("div");
    cards.className = "hero-cards";
    choices.forEach((hero) => cards.append(this.createCard(hero)));
    layer.append(cards);
    this.root.append(layer);
  }

  createCard(hero) {
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
    xpLine.textContent = "XP:000";
    title.append(name, statLine, xpLine);
    card.append(title);
    card.addEventListener("click", () => {
      if (this.pauseController.isPaused) return;
      this.playSound("click");
      this.chooseHero(hero);
    });
    return card;
  }

  async chooseHero(hero) {
    this.root.querySelector(".selection-layer")?.remove();
    this.selected.push(hero.id);
    const line = 6 - this.selected.length + 1;
    const enemyLine = 7 - line;
    const enemyChoices = HEROES.filter(
      (candidate) => !this.enemySelected.includes(candidate.id),
    );
    const enemy = enemyChoices[Math.floor(Math.random() * enemyChoices.length)];
    this.enemySelected.push(enemy.id);
    const playerFormation = this.addFormation("player", hero, line);
    const enemyFormation = this.addFormation("enemy", enemy, enemyLine);
    const pairedFormations = Promise.all([playerFormation, enemyFormation]);
    this.formationPromises.push(pairedFormations);
    await pairedFormations;
    if (this.selected.length < HEROES.length) {
      this.showChoices();
      return;
    }
    this.finishSetup();
  }

  addFormation(side, hero, line) {
    const count = side === "player" ? PLAYER_LINES[line] : ENEMY_LINES[line];
    return new Promise((resolve) => {
      Array.from({ length: count }, (_, index) => index).forEach((index) => {
        this.pauseController.schedule(index * HERO_RENDER_DELAY_MS / 1000, () => {
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
      side,
      hero: mesh,
      speed: 0,
      targetAgeSeconds: 0,
      knockbackDirection: { x: 0, y: 0 },
      knockbackElapsedSeconds: 0,
      knockbackRemainingSeconds: 0,
    };
    mesh.root.metadata = { unit };
    mesh.physics.body.getCollisionObservable().add((event) => {
      const otherUnit =
        event.collidedAgainst?.transformNode?.metadata?.unit ??
        event.collidedAgainst?.metadata?.unit;
      if (otherUnit && otherUnit.side !== side) {
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

  async finishSetup() {
    await Promise.all(this.formationPromises);
    this.root.className = "game-ui battle-phase";
    this.playSound("levelStart");
    this.pauseController.schedule(1, () => {
      this.startFrameMovement();
      if (COLLISION_ENABLED) {
        this.pauseController.schedule(
          MOVEMENT_DURATION_MS / 2000,
          () => this.playSound("collision"),
        );
      }
    });
  }

  startFrameMovement() {
    const updateMovement = (deltaSeconds = 1 / 60) => [...this.playerUnits, ...this.enemyUnits].forEach((unit) => {
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
          0,
          unit.knockbackRemainingSeconds - deltaSeconds,
        );
        if (unit.knockbackRemainingSeconds === 0) {
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
        unit.hero.speed * VERTICAL_SPEED_FACTOR,
        this.arenaConfig.friction,
      );
      const velocity = createMovementVelocity(unit, target, unit.speed);
      unit.hero.physics.body.setLinearVelocity(new Vector3(velocity.x, velocity.y, 0));
      this.tryRangedAttack(unit, target, deltaSeconds);
    });
    updateMovement();
    this.scene.onBeforeRenderObservable.add(() => {
      const rawDelta = this.scene.getEngine().getDeltaTime() / 1000;
      const activeDelta = this.pauseController.getDelta(rawDelta);
      if (activeDelta > 0) updateMovement(activeDelta);
    });
  }

  tryRangedAttack(unit, target, deltaSeconds) {
    if (!unit.hero.profile.attacks.includes("ranged")) return;
    unit.rangedCooldown = Math.max(0, (unit.rangedCooldown ?? 0) - deltaSeconds);
    if (unit.rangedCooldown > 0 || !canUseRangedAttack(unit, target)) return;
    unit.rangedCooldown = unit.hero.profile.rangedCooldown;
    const projectile = new BishopProjectile(this.scene, unit, target, (defender, attacker, impactDirection) => {
      if (defender.removed) return;
      defender.hero.health = Math.max(0, defender.hero.health - attacker.hero.damage);
      if (defender.hero.health <= 0) this.removeUnit(defender, attacker.hero.damage);
      else {
        this.applyKnockback(defender, impactDirection);
      }
    }, this.pauseController, (position) => {
      this.projectiles.delete(projectile);
      this.environmentalEffects?.create(GROUND_CRACK_EFFECT, position, {
        damage: unit.hero.damage,
      });
    });
    this.playSound("projectileLaunch");
    this.projectiles.add(projectile);
  }

  syncUnitAnimation(unit) {
    const linearVelocity = unit.hero.physics?.body?.getLinearVelocity();
    if (!linearVelocity) return;
    const isMoving = Math.hypot(linearVelocity.x, linearVelocity.y) > 0.01;
    unit.hero.playAnimation(
      isMoving ? HERO_ANIMATION_STATES.WALKING : HERO_ANIMATION_STATES.IDLE,
    );
  }

  resolveUnitCollision(player, enemy) {
    if (this.pauseController.isPaused || player.removed || enemy.removed) return;
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
      this.applyKnockback(
        player,
        createKnockbackDirection(enemyPosition, playerPosition, { x: 0, y: -1 }),
      );
      player.hero.playAnimation(HERO_ANIMATION_STATES.TAKE_DAMAGE);
      player.hero.playDamageEffect();
    }
    if (enemy.hero.health <= 0) this.removeUnit(enemy, player.hero.damage);
    else {
      this.applyKnockback(
        enemy,
        createKnockbackDirection(playerPosition, enemyPosition, { x: 0, y: 1 }),
      );
      enemy.hero.playAnimation(HERO_ANIMATION_STATES.TAKE_DAMAGE);
      enemy.hero.playDamageEffect();
    }
    if (!this.playerUnits.length || !this.enemyUnits.length) {
      this.endBattle(this.playerUnits.length ? "Player wins" : "Enemy wins");
    }
  }

  applyKnockback(unit, direction) {
    if (unit.removed) return;
    unit.knockbackDirection = direction;
    unit.knockbackElapsedSeconds = 0;
    unit.knockbackRemainingSeconds = KNOCKBACK_DURATION_SECONDS;
  }

  removeUnit(unit, damage) {
    if (unit.removed) return;
    unit.removed = true;
    [...this.playerUnits, ...this.enemyUnits].forEach((otherUnit) => {
      if (otherUnit.target === unit) otherUnit.target = null;
    });
    const units = unit.side === "player" ? this.playerUnits : this.enemyUnits;
    const index = units.indexOf(unit);
    if (index !== -1) units.splice(index, 1);
    this.dyingUnits.add(unit);
    this.environmentalEffects?.create(
      GROUND_CRACK_EFFECT,
      unit.hero.root.position.clone(),
      { damage },
    );
    unit.hero.disablePhysics();
    unit.hero.playAnimation(HERO_ANIMATION_STATES.DEAD, () => {
      this.dyingUnits.delete(unit);
      unit.hero.dispose();
      if (this.pendingBattleResult && this.dyingUnits.size === 0) {
        this.finalizeBattle(this.pendingBattleResult);
      }
    });
  }

  endBattle(message) {
    this.pendingBattleResult = message;
    if (this.dyingUnits.size > 0) return;
    this.finalizeBattle(message);
  }

  finalizeBattle(message) {
    this.pauseController.setTerminal();
    this.root.className = "game-ui battle-over";
    const result = document.createElement("p");
    result.className = "winner-label";
    result.textContent = message;
    this.root.replaceChildren(result);
  }

  getPhysicsBodies() {
    return [...this.playerUnits, ...this.enemyUnits]
      .map((unit) => unit.hero.physics?.body)
      .filter(Boolean);
  }
}
