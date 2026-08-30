import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Vector3 } from "@babylonjs/core";
import { Gameplay } from "../src/gameplay.js";
import { HERO_ANIMATION_STATES } from "../src/hero-animation.js";
import { GROUND_CRACK_EFFECT } from "../src/environmental-effects.js";

test("hero death entry creates one crack with killing-blow damage at a cloned final ground position", () => {
  const created = [];
  const gameplay = Object.create(Gameplay.prototype);
  gameplay.playerUnits = [];
  gameplay.enemyUnits = [];
  gameplay.dyingUnits = new Set();
  gameplay.pendingBattleResult = null;
  gameplay.endBattle = () => {};
  gameplay.environmentalEffects = {
    create: (type, position, options) => created.push({ type, position, options }),
  };
  const finalPosition = new Vector3(1.5, -2.25, 0.4);
  let deathAnimation = null;
  const unit = {
    side: "player",
    hero: {
      root: { position: finalPosition },
      disablePhysics: () => {},
      playAnimation: (state) => { deathAnimation = state; },
    },
  };
  gameplay.playerUnits.push(unit);

  gameplay.removeUnit(unit, 30);
  gameplay.removeUnit(unit, 10);
  finalPosition.set(9, 9, 9);

  assert.equal(deathAnimation, HERO_ANIMATION_STATES.DEAD);
  assert.equal(created.length, 1);
  assert.equal(created[0].type, GROUND_CRACK_EFFECT);
  assert.deepEqual(created[0].position.asArray().slice(0, 2), [1.5, -2.25]);
  assert.deepEqual(created[0].options, { damage: 30 });
});

test("combat wiring passes source damage to hero and projectile cracks", () => {
  const source = readFileSync(new URL("../src/gameplay.js", import.meta.url), "utf8");

  assert.match(source, /this\.removeUnit\(defender, attacker\.hero\.damage\)/);
  assert.match(source, /this\.removeUnit\(player, enemy\.hero\.damage\)/);
  assert.match(source, /this\.removeUnit\(enemy, player\.hero\.damage\)/);
  assert.match(
    source,
    /this\.environmentalEffects\?\.create\(GROUND_CRACK_EFFECT, position, \{\s*damage: unit\.hero\.damage,?\s*\}\)/,
  );
});
