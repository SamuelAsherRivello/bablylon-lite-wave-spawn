import {
  COLLISION_ENABLED,
  resolveCollision,
  HERO_RENDER_DELAY_MS,
  MOVEMENT_DURATION_MS,
} from "./battle-rules.js";
import { createSoundPlayer } from "./audio.js";
import { Hero } from "./hero.js";
import { Vector3 } from "@babylonjs/core";

const HEROES = [
  { id: "bishop", name: "Light Bishop", image: "/art/heroes/light-bishop-v1.png" },
  { id: "pawn", name: "Light Pawn", image: "/art/heroes/light-pawn-v2.png" },
  { id: "rook", name: "Light Rook", image: "/art/heroes/light-rook-v2.png" },
];
const SHADOW_IMAGE = "/art/shadow-oval.png";

const PLAYER_LINES = { 4: 1, 5: 3, 6: 5 };
const ENEMY_LINES = { 1: 5, 2: 3, 3: 1 };

export class Gameplay {
  constructor(scene, root) {
    this.scene = scene;
    this.root = root;
    this.playSound = createSoundPlayer();
    this.selected = [];
    this.enemySelected = [];
    this.playerUnits = [];
    this.enemyUnits = [];
    this.formationPromises = [];
    this.contacts = new Set();
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
    heading.textContent = step === 0 ? "Choose your first hero" : "Choose your next hero";
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
    card.addEventListener("click", () => {
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
        window.setTimeout(() => {
          const unit = this.createUnit(side, hero, line, index, count);
          if (side === "player") this.playerUnits.push(unit);
          else this.enemyUnits.push(unit);
          if (index === count - 1) resolve();
        }, index * HERO_RENDER_DELAY_MS);
      });
    });
  }

  createUnit(side, hero, line, index, count) {
    const slot = index - (count - 1) / 2;
    const mesh = new Hero(`${side}-${hero.id}-${line}-${index}`, hero.image,
      new Vector3(slot * 0.58, this.lineToY(line), 0.2), this.scene);
    return { side, hero: mesh, speed: 0 };
  }

  lineToY(line) { return 6.8 - (line - 1) * 2.3; }

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
    window.setTimeout(() => {
      this.startFrameMovement();
      if (COLLISION_ENABLED) {
        window.setTimeout(
          () => this.playSound("collision"),
          MOVEMENT_DURATION_MS / 2,
        );
      }
    }, 1000);
  }

  startFrameMovement() {
    const speed = (this.lineToY(1) - this.lineToY(6)) /
      (MOVEMENT_DURATION_MS / 1000);
    [...this.playerUnits, ...this.enemyUnits].forEach((unit) => {
      unit.speed = unit.side === "player" ? speed : -speed;
    });
    this.scene.onBeforeRenderObservable.add(() => {
      const units = [...this.playerUnits, ...this.enemyUnits];
      units.forEach((unit) => {
        unit.hero.physics.body.setLinearVelocity(
          new Vector3(0, unit.speed, 0),
        );
      });
    });
  }

  resolveCollisions() {
    for (const player of this.playerUnits) {
      for (const enemy of this.enemyUnits) {
        const contactId = `${player.hero.name}:${enemy.hero.name}`;
        const verticalDistance = Math.abs(player.hero.root.position.y - enemy.hero.root.position.y);
        const horizontalDistance = Math.abs(player.hero.root.position.x - enemy.hero.root.position.x);
        if (verticalDistance > 0.42 || horizontalDistance > 0.58 || this.contacts.has(contactId)) continue;
        this.contacts.add(contactId);
        const result = resolveCollision(player.hero, enemy.hero);
        player.hero.health = result.attackerHealth;
        enemy.hero.health = result.defenderHealth;
        if (player.hero.health === 0) this.removeUnit(player);
        if (enemy.hero.health === 0) this.removeUnit(enemy);
        if (!this.playerUnits.length || !this.enemyUnits.length) {
          this.endBattle(this.playerUnits.length ? "Player wins" : "Enemy wins");
          return;
        }
      }
    }
  }

  removeUnit(unit) {
    const units = unit.side === "player" ? this.playerUnits : this.enemyUnits;
    const index = units.indexOf(unit);
    if (index !== -1) units.splice(index, 1);
    unit.hero.dispose();
  }

  endBattle(message) {
    this.scene.getEngine().stopRenderLoop();
    this.root.className = "game-ui battle-over";
    const result = document.createElement("p");
    result.className = "winner-label";
    result.textContent = message;
    this.root.replaceChildren(result);
  }
}
