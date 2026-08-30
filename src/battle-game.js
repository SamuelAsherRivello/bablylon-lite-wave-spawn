const HEROES = [
  { id: "bishop", name: "Light Bishop", image: "/art/heroes/light-bishop-v1.png" },
  { id: "pawn", name: "Light Pawn", image: "/art/heroes/light-pawn-v2.png" },
  { id: "rook", name: "Light Rook", image: "/art/heroes/light-rook-v2.png" },
];
import { MOVEMENT_DURATION_MS, createWalkOffsets } from "./battle-rules.js";

const PLAYER_LINES = { 4: 1, 5: 3, 6: 5 };
const ENEMY_LINES = { 1: 5, 2: 3, 3: 1 };

export class BattleGame {
  constructor(root) {
    this.root = root;
    this.selected = [];
    this.enemySelected = [];
    this.playerUnits = [];
    this.enemyUnits = [];
    this.appState = "MainMenu";
    this.gameState = "Starting";
    this.showMainMenu();
  }

  showMainMenu() {
    this.root.replaceChildren();
    this.root.className = "game-ui main-menu";
    this.root.addEventListener("click", () => this.startGameplay(), { once: true });
  }

  startGameplay() {
    this.appState = "Gameplay";
    this.gameState = "Starting";
    this.root.className = "game-ui gameplay";
    window.setTimeout(() => {
      this.gameState = "HeroSelection";
      this.showChoices();
    }, 250);
  }

  showChoices() {
    if (this.gameState === "Started") return;
    this.removeSelectionLayer();
    const choices = HEROES.filter((hero) => !this.selected.includes(hero.id));
    const layer = document.createElement("div");
    layer.className = "selection-layer";
    const heading = document.createElement("p");
    heading.className = "phase-label";
    heading.textContent = "Choose your hero";
    layer.append(heading);
    const cards = document.createElement("div");
    cards.className = "hero-cards";
    choices.forEach((hero) => cards.append(this.createCard(hero)));
    layer.append(cards);
    this.root.append(layer);
  }

  removeSelectionLayer() {
    this.root.querySelector(".selection-layer")?.remove();
  }

  createCard(hero) {
    const card = document.createElement("button");
    card.className = "hero-card";
    card.type = "button";
    card.setAttribute("aria-label", `Choose ${hero.name}`);

    card.append(this.createHero(hero, hero.name, "card-hero"));
    card.addEventListener("click", () => this.chooseHero(hero));
    return card;
  }

  chooseHero(hero) {
    this.selected.push(hero.id);
    this.removeSelectionLayer();
    this.gameState = "FormationReady";
    const line = 7 - this.selected.length;
    this.addUnits("player", hero, line, PLAYER_LINES[line], () => {
      this.placeEnemy(line, () => {
        if (this.selected.length < HEROES.length) {
          window.setTimeout(() => {
            this.gameState = "HeroSelection";
            this.showChoices();
          }, 500);
        } else {
          window.setTimeout(() => this.startBattle(), 200);
        }
      });
    });
  }

  addUnits(side, hero, line, count, onComplete) {
    let index = 0;
    const placeNext = () => {
      this.root.append(this.createUnit(side, hero, line, index, count));
      index += 1;
      if (index < count) window.setTimeout(placeNext, 250);
      else onComplete();
    };
    placeNext();
  }

  createUnit(side, hero, line, index, count) {
    const unit = document.createElement("span");
    unit.className = `unit ${side}-unit`;
    unit.dataset.line = String(line);
    unit.style.setProperty("--line", String(line));
    unit.style.setProperty("--slot", String(index - (count - 1) / 2));
    const walkOffsets = createWalkOffsets();
    unit.style.setProperty("--jiggle", String(Math.max(...walkOffsets)));
    unit.style.setProperty("--jiggle-delay", `${Math.random() * 0.6}s`);
    unit.style.setProperty("--movement-duration", `${MOVEMENT_DURATION_MS}ms`);
    unit.append(this.createHero(hero, `${hero.name} on line ${line}`, "unit-hero"));
    if (side === "player") this.playerUnits.push(unit);
    else this.enemyUnits.push(unit);
    return unit;
  }

  createHero(hero, alt, className) {
    const wrapper = document.createElement("span");
    wrapper.className = `hero ${className}`;

    const shadow = document.createElement("img");
    shadow.className = "hero-shadow";
    shadow.src = "/art/shadow-oval.png";
    shadow.alt = "";
    shadow.setAttribute("aria-hidden", "true");

    const sprite = document.createElement("img");
    sprite.className = "hero-sprite";
    sprite.src = hero.image;
    sprite.alt = alt;
    wrapper.append(shadow, sprite);
    return wrapper;
  }

  placeEnemy(playerLine, onComplete) {
    const enemyLine = 7 - playerLine;
    const choices = HEROES.filter((hero) => !this.enemySelected.includes(hero.id));
    const hero = choices[Math.floor(Math.random() * choices.length)];
    this.enemySelected.push(hero.id);
    this.addUnits("enemy", hero, enemyLine, ENEMY_LINES[enemyLine], onComplete);
  }

  startBattle() {
    this.removeSelectionLayer();
    this.root.className = "game-ui gameplay battle-phase";
    window.setTimeout(() => {
      this.gameState = "Started";
      this.removeSelectionLayer();
      [...this.playerUnits, ...this.enemyUnits].forEach((unit) => {
        unit.classList.add("walking");
      });
    }, 1000);
  }
}
