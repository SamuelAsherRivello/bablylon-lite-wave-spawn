const HEROES = [
  { id: "bishop", label: "A", name: "Light Bishop", image: "/art/heroes/light-bishop-v1.png" },
  { id: "pawn", label: "B", name: "Light Pawn", image: "/art/heroes/light-pawn-v2.png" },
  { id: "rook", label: "C", name: "Light Rook", image: "/art/heroes/light-rook-v2.png" },
];

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
    card.innerHTML = `<span class="card-label">${hero.label}</span><img src="${hero.image}" alt="${hero.name}" />`;
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
          window.setTimeout(() => this.startBattle(), 500);
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
    const unit = document.createElement("img");
    unit.className = `unit ${side}-unit`;
    unit.src = hero.image;
    unit.alt = `${hero.name} on line ${line}`;
    unit.dataset.line = String(line);
    unit.style.setProperty("--line", String(line));
    unit.style.setProperty("--slot", String(index - (count - 1) / 2));
    unit.style.setProperty("--jiggle", String(1 + Math.floor(Math.random() * 3)));
    unit.style.setProperty("--jiggle-delay", `${Math.random() * 0.6}s`);
    if (side === "player") this.playerUnits.push(unit);
    else this.enemyUnits.push(unit);
    return unit;
  }

  placeEnemy(playerLine, onComplete) {
    const enemyLine = playerLine - 5;
    const choices = HEROES.filter((hero) => !this.enemySelected.includes(hero.id));
    const hero = choices[Math.floor(Math.random() * choices.length)];
    this.enemySelected.push(hero.id);
    this.addUnits("enemy", hero, enemyLine, ENEMY_LINES[enemyLine], onComplete);
  }

  startBattle() {
    window.setTimeout(() => {
      this.gameState = "Started";
      [...this.playerUnits, ...this.enemyUnits].forEach((unit) => {
        unit.classList.add("walking");
      });
    }, 1000);
  }
}
