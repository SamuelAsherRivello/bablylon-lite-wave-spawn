import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import {
  POWERUP_BASES,
  POWERUP_VARIANTS,
  applyPowerupVariant,
  clearWavePowerupModifiers,
  createPowerupXp,
  powerupActivationFrame,
  samplePowerupOffer,
  selectPowerupTargets,
} from "../src/powerups.js";

function unit(side, line, stats = {}) {
  return {
    side,
    line,
    hero: {
      health: stats.health ?? 40,
      maxHealth: stats.maxHealth ?? 40,
      damage: stats.damage ?? 10,
      speed: stats.speed ?? 15,
    },
  };
}

test("five bases produce ten independently identified polarity variants", () => {
  assert.equal(POWERUP_BASES.length, 5);
  assert.equal(POWERUP_VARIANTS.length, 10);
  assert.equal(new Set(POWERUP_VARIANTS.map(({ id }) => id)).size, 10);
  assert.deepEqual(
    POWERUP_BASES.map(({ id, amount }) => [id, amount]),
    [["shield", 20], ["healing-heart", 20], ["war-banner", 5],
      ["winged-boots", 5], ["battle-cry", 2]],
  );
  const positiveShield = POWERUP_VARIANTS.find(({ id }) => id === "shield-positive");
  const negativeBoots = POWERUP_VARIANTS.find(({ id }) => id === "winged-boots-negative");
  assert.deepEqual(
    [positiveShield.sign, positiveShield.badgeColor, positiveShield.targetSide,
      positiveShield.signedAmount],
    ["+", "blue", "player", 20],
  );
  assert.deepEqual(
    [negativeBoots.sign, negativeBoots.badgeColor, negativeBoots.targetSide,
      negativeBoots.signedAmount],
    ["−", "red", "enemy", -5],
  );
  assert.match(positiveShield.art, /powerups\/shield\.svg$/);
  assert.deepEqual(Object.values(createPowerupXp()), Array(10).fill(0));
});

test("offers contain three distinct variants and may pair opposite polarities", () => {
  const offer = samplePowerupOffer(() => 0);
  assert.deepEqual(offer.map(({ id }) => id), [
    "shield-positive", "shield-negative", "healing-heart-positive",
  ]);
  assert.equal(new Set(offer.map(({ id }) => id)).size, 3);
});

test("polarity chooses exactly one occupied row on the correct side", () => {
  const playerUnits = [unit("player", 4), unit("player", 5), unit("player", 5)];
  const enemyUnits = [unit("enemy", 1), unit("enemy", 2), unit("enemy", 2)];
  const positive = POWERUP_VARIANTS.find(({ id }) => id === "war-banner-positive");
  const negative = POWERUP_VARIANTS.find(({ id }) => id === "war-banner-negative");
  assert.deepEqual(
    selectPowerupTargets(positive, playerUnits, enemyUnits, () => 0),
    [playerUnits[0]],
  );
  assert.deepEqual(
    selectPowerupTargets(negative, playerUnits, enemyUnits, () => 0.99),
    [enemyUnits[1], enemyUnits[2]],
  );
});

test("signed row effects apply once with floors and temporary cleanup", () => {
  const rook = unit("player", 4, { health: 120, maxHealth: 120, damage: 20, speed: 10 });
  const pawn = unit("enemy", 1, { health: 40, maxHealth: 40, damage: 3, speed: 4 });
  applyPowerupVariant(
    POWERUP_VARIANTS.find(({ id }) => id === "shield-positive"), [rook],
  );
  assert.deepEqual([rook.hero.health, rook.hero.maxHealth], [140, 140]);
  applyPowerupVariant(
    POWERUP_VARIANTS.find(({ id }) => id === "war-banner-negative"), [pawn],
  );
  applyPowerupVariant(
    POWERUP_VARIANTS.find(({ id }) => id === "winged-boots-negative"), [pawn],
  );
  assert.equal(pawn.hero.damage, 0);
  assert.equal(pawn.hero.speed, 0);
  clearWavePowerupModifiers([rook, pawn]);
  assert.deepEqual([rook.hero.health, rook.hero.maxHealth], [120, 120]);
  assert.deepEqual([pawn.hero.damage, pawn.hero.speed], [3, 4]);
});

test("Healing Heart is immediate, capped, lethal when negative, and not reversed", () => {
  const healed = unit("player", 5, { health: 32, maxHealth: 40 });
  const hurt = unit("enemy", 2, { health: 15, maxHealth: 40 });
  applyPowerupVariant(
    POWERUP_VARIANTS.find(({ id }) => id === "healing-heart-positive"), [healed],
  );
  const result = applyPowerupVariant(
    POWERUP_VARIANTS.find(({ id }) => id === "healing-heart-negative"), [hurt],
  );
  assert.equal(healed.hero.health, 40);
  assert.equal(hurt.hero.health, 0);
  assert.deepEqual(result.defeated, [hurt]);
  clearWavePowerupModifiers([healed, hurt]);
  assert.deepEqual([healed.hero.health, hurt.hero.health], [40, 0]);
});

test("Choice Menu renders exact heading, polarity cards, and delayed activation", async () => {
  const [gameplay, styles] = await Promise.all([
    readFile(new URL("../src/gameplay.js", import.meta.url), "utf8"),
    readFile(new URL("../src/style.css", import.meta.url), "utf8"),
  ]);
  assert.match(gameplay, /heading\.textContent = "Choose Powerup"/);
  assert.match(gameplay, /powerup-badge--\$\{variant\.badgeColor\}/);
  assert.match(gameplay, /formatXp\(this\.session\.powerupXp\[variant\.id\]\)/);
  assert.match(gameplay, /await Promise\.all\(\[activationPromise, \.\.\.removalPromises\]\)/);
  assert.match(styles, /\.powerup-badge\s*\{[^}]*cqw/s);
  assert.match(styles, /\.powerup-shield-icon\s*\{[^}]*width:\s*8cqw;[^}]*height:\s*8cqw;/s);
  assert.doesNotMatch(
    styles.match(/\.powerup-card-art\s*\{[^}]*\}/s)?.[0] ?? "",
    /\d+(?:\.\d+)?(?:px|vw|vh)/,
  );
});

test("all five shared powerup artworks exist", async () => {
  await Promise.all(POWERUP_BASES.map(({ art }) =>
    access(new URL(`../public${new URL(art, "https://game.test").pathname}`, import.meta.url)),
  ));
});

test("Shield activation fades in, rises, fades out, and completes", () => {
  assert.deepEqual(powerupActivationFrame(0), {
    progress: 0, opacity: 0, riseCqw: 0, complete: false,
  });
  const peak = powerupActivationFrame(0.27);
  assert.equal(peak.opacity, 1);
  assert.equal(peak.riseCqw, -2.4);
  const end = powerupActivationFrame(0.9);
  assert.equal(end.opacity, 0);
  assert.equal(end.riseCqw, -8);
  assert.equal(end.complete, true);
});

test("gameplay owns effect cleanup and temporary modifier cleanup", async () => {
  const gameplay = await readFile(new URL("../src/gameplay.js", import.meta.url), "utf8");
  assert.match(gameplay, /powerup-shield-icon--\$\{variant\.polarity\}/);
  assert.match(gameplay, /Vector3\.Project\(/);
  assert.match(gameplay, /this\.updatePowerupActivation\(activeDelta\)/);
  assert.match(gameplay, /this\.clearPowerupActivation\(true\)/);
  assert.ok((gameplay.match(/clearWavePowerupModifiers\(/g) ?? []).length >= 2);
});
