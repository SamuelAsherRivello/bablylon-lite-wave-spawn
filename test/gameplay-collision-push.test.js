import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { Gameplay } from "../src/gameplay.js";
import { COLLISION_PUSH_DURATION_SECONDS } from "../src/battle-rules.js";

function unit({ side, x, vx, mass }) {
  const values = { velocity: { x: vx, y: 0, z: 0 } };
  return {
    side,
    target: { id: "remembered-target" },
    collisionPushVelocity: { x: 0, y: 0 },
    collisionPushRemainingSeconds: 0,
    knockbackRemainingSeconds: 0,
    hero: {
      mass,
      root: { position: { x, y: 0 } },
      physics: {
        body: {
          getLinearVelocity: () => values.velocity,
          setLinearVelocity: (velocity) => { values.velocity = velocity; },
        },
      },
    },
  };
}

test("gameplay stores the same momentum response on both contacting units", () => {
  const player = unit({ side: "player", x: 0, vx: 1, mass: 1.1 });
  const enemy = unit({ side: "enemy", x: 1, vx: -1, mass: 1 });

  Gameplay.prototype.applyCollisionPush.call({}, player, enemy);

  assert.ok(player.collisionPushVelocity.x > 0);
  assert.deepEqual(player.collisionPushVelocity, enemy.collisionPushVelocity);
  assert.equal(player.collisionPushRemainingSeconds, COLLISION_PUSH_DURATION_SECONDS);
  assert.equal(enemy.collisionPushRemainingSeconds, COLLISION_PUSH_DURATION_SECONDS);
});

test("damage knockback clears stale push without dropping target memory", () => {
  const player = unit({ side: "player", x: 0, vx: 1, mass: 1 });
  const rememberedTarget = player.target;
  player.collisionPushRemainingSeconds = COLLISION_PUSH_DURATION_SECONDS;

  Gameplay.prototype.applyKnockback.call({}, player, { x: 0, y: -1 });

  assert.equal(player.collisionPushRemainingSeconds, 0);
  assert.equal(player.target, rememberedTarget);
  assert.equal(player.knockbackRemainingSeconds > 0, true);
});

test("contact push is evaluated before damage cooldown and before pursuit", async () => {
  const source = await readFile(new URL("../src/gameplay.js", import.meta.url), "utf8");

  assert.match(
    source,
    /if \(otherUnit && otherUnit\.side !== side\) \{\s*this\.applyCollisionPush\(unit, otherUnit\);\s*this\.resolveUnitCollision\(unit, otherUnit\);/s,
  );
  assert.match(
    source,
    /if \(unit\.knockbackRemainingSeconds > 0\)[\s\S]*if \(unit\.collisionPushRemainingSeconds > 0\)[\s\S]*createMovementVelocity\(unit, target, unit\.speed\)/,
  );
  assert.match(source, /collisionPushRemainingSeconds - deltaSeconds/);
});
