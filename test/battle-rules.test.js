import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  ENEMY_LINE_COUNTS,
  COLLISION_ENABLED,
  HERO_RENDER_DELAY_MS,
  PLAYER_LINE_COUNTS,
  VERTICAL_SPEED_FACTOR,
  RETARGET_INTERVAL_SECONDS,
  createFormationPlan,
  createWalkOffsets,
  HERO_HEALTH,
  HERO_DAMAGE,
  HERO_CLASSES,
  HERO_ANGULAR_DAMPING,
  resolveCollision,
  findClosestOpponent,
  selectTarget,
  createMovementVelocity,
  MELEE_ENABLED,
  canUseRangedAttack,
  KNOCKBACK_DISTANCE_WORLD,
  KNOCKBACK_DURATION_SECONDS,
  createKnockbackDirection,
  createKnockbackVelocity,
} from "../src/battle-rules.js";
import { lineToY } from "../src/battle-rules.js";
import { SOUND_PATHS } from "../src/audio.js";

test("the game frame preserves 9:16 within either limiting viewport dimension", async () => {
  const styles = await readFile(new URL("../src/style.css", import.meta.url), "utf8");

  assert.match(styles, /\.stage\s*\{[^}]*place-items:\s*center;[^}]*background:/s);
  assert.match(styles, /\.game-frame\s*\{[^}]*width:\s*min\(100vw,\s*56\.25vh\);[^}]*height:\s*auto;/s);
  assert.match(styles, /\.game-frame\s*\{[^}]*aspect-ratio:\s*9\s*\/\s*16;/s);
  assert.match(styles, /\.game-frame\s*\{[^}]*border:\s*0;/s);
  assert.doesNotMatch(styles, /\.stage\s*\{[^}]*padding:/s);
});

test("game art uses the game frame as its scaling container", async () => {
  const styles = await readFile(new URL("../src/style.css", import.meta.url), "utf8");

  assert.match(styles, /container-type:\s*size/);
  assert.match(styles, /\.hero-card\s*\{[^}]*cqw/s);
  assert.match(styles, /flex:\s*0\s+0\s+25cqw/);
  assert.match(styles, /\.hero-cards\s*\{[^}]*width:\s*min\(85cqw,\s*100%\);[^}]*margin-inline:\s*auto;/s);
  assert.match(styles, /height:\s*34\.5cqw/);
  assert.match(styles, /\.hero-shadow, \.hero-sprite/);
  assert.match(styles, /\.unit\s*\{\s*display:\s*none;/s);
  assert.doesNotMatch(styles, /@keyframes walk-up|@keyframes walk-down/);
});

test("hero movement keeps the sprite and shadow on one root", async () => {
  const heroSource = await readFile(new URL("../src/hero.js", import.meta.url), "utf8");
  const gameplaySource = await readFile(new URL("../src/gameplay.js", import.meta.url), "utf8");

  assert.match(heroSource, /this\.shadow\.parent\s*=\s*this\.root/);
  assert.match(heroSource, /this\.sprite\.parent\s*=\s*this\.root/);
  assert.match(heroSource, /new PhysicsAggregate\(/);
  assert.match(heroSource, /inertia:\s*Vector3\.Zero\(\)/);
  assert.match(heroSource, /setLinearVelocity\(\s*new Vector3\(constrained\.velocity\.x, constrained\.velocity\.y, 0\)/s);
  assert.match(heroSource, /setAngularVelocity\(Vector3\.Zero\(\)\)/);
  assert.match(heroSource, /setAngularDamping\(HERO_ANGULAR_DAMPING\)/);
  assert.match(gameplaySource, /createMovementVelocity\(unit, target, unit\.speed\)/);
  assert.match(gameplaySource, /setLinearVelocity\(new Vector3\(velocity\.x, velocity\.y, 0\)\)/);
});

test("battle heroes receive a side-colored glow behind their sprite", async () => {
  const heroSource = await readFile(new URL("../src/hero.js", import.meta.url), "utf8");
  const gameplaySource = await readFile(new URL("../src/gameplay.js", import.meta.url), "utf8");

  assert.match(heroSource, /ShaderMaterial\(`\$\{name\}-glow-material`/);
  assert.match(heroSource, /neighborAlpha/);
  assert.match(heroSource, /setVector2\("texelSize"/);
  assert.match(heroSource, /side === "enemy"/);
  assert.match(heroSource, /new Color3\(0\.05, 0\.3, 1\)/);
  assert.match(heroSource, /if \(alpha > 0\.1 \|\| neighborAlpha <= 0\.1\) discard/);
  assert.match(gameplaySource, /hero\.id, side,\s*this\.pauseController\)/);
});

test("heroes preserve planar physics while using the shared depth-sort hook", async () => {
  const heroSource = await readFile(new URL("../src/hero.js", import.meta.url), "utf8");
  const gameplaySource = await readFile(new URL("../src/gameplay.js", import.meta.url), "utf8");

  assert.match(heroSource, /this\.physicsPlaneZ\s*=\s*heroDepthForPivotY\(/);
  assert.match(heroSource, /this\.root\.position\.z\s*=\s*heroDepthForPivotY\(pivotY\)/);
  assert.match(gameplaySource, /scene\.onBeforeRenderObservable\.add\(\(\)\s*=>/);
  assert.match(gameplaySource, /unit\.hero\.updateDepthSort\(\)/);
});

test("gameplay sound effects use the public audio files", () => {
  assert.equal(SOUND_PATHS.collision, "/audio/sfx/collision.wav");
  assert.equal(SOUND_PATHS.click, "/audio/sfx/click.wav");
  assert.equal(SOUND_PATHS.levelStart, "/audio/sfx/levelstart.wav");
});

test("Havok loads its WASM through Vite's asset pipeline", async () => {
  const source = await readFile(new URL("../src/main.js", import.meta.url), "utf8");

  assert.match(source, /HavokPhysics\.wasm\?url/);
  assert.match(source, /HavokPhysics\(\{\s*locateFile:\s*\(\)\s*=>\s*havokWasmUrl/s);
});

test("gameplay creates heroes on all six lines", () => {
  const plan = createFormationPlan();

  assert.deepEqual(plan.player.map(({ line }) => line), [6, 5, 4]);
  assert.deepEqual(plan.enemy.map(({ line }) => line), [1, 2, 3]);
  assert.deepEqual(plan.player, PLAYER_LINE_COUNTS);
  assert.deepEqual(plan.enemy, ENEMY_LINE_COUNTS);
});

test("hero lines use the requested mirrored vertical positions", () => {
  assert.deepEqual(
    [1, 2, 3, 4, 5, 6].map(lineToY),
    [6.5, 4.5, 2.2, -2.2, -4.5, -6.5],
  );
});

test("formation rendering uses the shared hero line Y mapping", async () => {
  const gameplaySource = await readFile(new URL("../src/gameplay.js", import.meta.url), "utf8");

  assert.match(gameplaySource, /new Vector3\(slot \* 0\.58, lineToY\(line\), 0\)/);
  assert.doesNotMatch(gameplaySource, /new Vector3\(slot \* 0\.58, this\.lineToY\(line\), 0\.2\)/);
});

test("depth sorting does not translate heroes on Z", async () => {
  const heroSource = await readFile(new URL("../src/hero.js", import.meta.url), "utf8");

  assert.doesNotMatch(heroSource, /0\.5\s*-\s*this\.root\.position\.y\s*\*\s*0\.01/);
});

test("depth layers keep ground behind shadows and Y-sorted actors", async () => {
  const depthSource = await readFile(new URL("../src/depth.js", import.meta.url), "utf8");
  const heroSource = await readFile(new URL("../src/hero.js", import.meta.url), "utf8");
  const projectileSource = await readFile(new URL("../src/projectile.js", import.meta.url), "utf8");
  assert.match(depthSource, /GROUND_Z = 1/);
  assert.match(depthSource, /SHADOW_Z = 0\.8/);
  assert.match(depthSource, /HERO_Z = 0\.4/);
  assert.match(depthSource, /PROJECTILE_Z = 0\.2/);
  assert.match(heroSource, /heroDepthForPivotY\(pivotY\)/);
  assert.match(projectileSource, /depthForY\(PROJECTILE_Z, this\.root\.position\.y\)/);
  assert.match(projectileSource, /this\.shadow\.position\.z = SHADOW_Z - PROJECTILE_Z/);
});

test("hero formations render left to right with a 0.05-second delay", () => {
  assert.equal(HERO_RENDER_DELAY_MS, 50);
});

test("movement is slow and each hero walks with zero-drift jiggle", () => {
  assert.equal(VERTICAL_SPEED_FACTOR, 0.1);
  assert.equal(RETARGET_INTERVAL_SECONDS, 3);
  const offsets = createWalkOffsets(() => 0.5);

  assert.equal(offsets.reduce((sum, offset) => sum + offset, 0), 0);
  assert.ok(offsets.some((offset) => offset < 0));
  assert.ok(offsets.some((offset) => offset > 0));
});

test("each unit targets the closest opposing unit", () => {
  const unit = { hero: { root: { position: { x: 0, y: 0 } } } };
  const opponents = [
    { id: "far", hero: { root: { position: { x: 0, y: 5 } } } },
    { id: "near", hero: { root: { position: { x: 2, y: 0 } } } },
  ];

  assert.equal(findClosestOpponent(unit, opponents), opponents[1]);
  assert.deepEqual(createMovementVelocity(unit, opponents[1], 3), { x: 3, y: 0 });
});

test("target selection prefers untargeted enemies, then distance and health", () => {
  const unit = { hero: { root: { position: { x: 0, y: 0 } } } };
  const targeted = { id: "targeted", target: {}, hero: { health: 1, root: { position: { x: 1, y: 0 } } } };
  const farther = { id: "farther", hero: { health: 100, root: { position: { x: 2, y: 0 } } } };
  const nearer = { id: "nearer", hero: { health: 50, root: { position: { x: 1, y: 0 } } } };

  assert.equal(selectTarget(unit, [targeted, farther, nearer]), nearer);
});

test("target selection uses lower health and stable order for equal distance", () => {
  const unit = { hero: { root: { position: { x: 0, y: 0 } } } };
  const first = { id: "first", hero: { health: 20, root: { position: { x: 2, y: 0 } } } };
  const second = { id: "second", hero: { health: 10, root: { position: { x: 2, y: 0 } } } };
  const dead = { id: "dead", removed: true, hero: { health: 0, root: { position: { x: 0, y: 0 } } } };

  assert.equal(selectTarget(unit, [first, second, dead]), second);
  assert.equal(selectTarget(unit, [first, { ...second, hero: { ...second.hero, health: 20 } }]), first);
  assert.equal(selectTarget(unit, []), null);
});

test("collision damage is enabled during movement", () => {
  assert.equal(COLLISION_ENABLED, true);
});

test("all heroes use melee and bishops additionally use ranged attacks", () => {
  assert.equal(MELEE_ENABLED, true);
  assert.deepEqual(HERO_CLASSES.rook.attacks, ["melee"]);
  assert.deepEqual(HERO_CLASSES.pawn.attacks, ["melee"]);
  assert.deepEqual(HERO_CLASSES.bishop.attacks, ["melee", "ranged"]);
  assert.equal(HERO_CLASSES.bishop.range > 0, true);
  const bishop = { hero: { profile: HERO_CLASSES.bishop, root: { position: { x: 0, y: 0 } } } };
  const target = { hero: { root: { position: { x: 2, y: 0 } } } };
  assert.equal(canUseRangedAttack(bishop, target), true);
  assert.equal(HERO_ANGULAR_DAMPING, 8);
  assert.equal(HERO_CLASSES.rook.health > HERO_CLASSES.pawn.health, true);
  assert.equal(HERO_CLASSES.pawn.speed > HERO_CLASSES.rook.speed, true);
  assert.equal(HERO_CLASSES.bishop.damage > HERO_CLASSES.rook.damage, true);
});

test("hero cards show name, emoji stats, and XP on three lines", async () => {
  const gameplaySource = await readFile(new URL("../src/gameplay.js", import.meta.url), "utf8");
  const styles = await readFile(new URL("../src/style.css", import.meta.url), "utf8");

  assert.match(gameplaySource, /statLine\.textContent\s*=\s*`❤️:\$\{stats\.health\} ⚡:\$\{stats\.speed\} ⚔️:\$\{stats\.damage\}`/);
  assert.match(gameplaySource, /xpLine\.textContent\s*=\s*"XP:000"/);
  assert.match(styles, /\.hero-card\s*\{[^}]*flex:\s*0\s+0\s+25cqw;/s);
  assert.match(styles, /\.hero-card\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\);/s);
  assert.match(styles, /\.hero-card-stats, \.hero-card-xp\s*\{[^}]*font-family:\s*inherit;[^}]*font-size:\s*1\.45cqw;[^}]*font-weight:\s*inherit;/s);
});

test("collision uses the attacker and defender class damage", () => {
  assert.equal(HERO_HEALTH, 120);
  assert.equal(HERO_DAMAGE, 20);

  const result = resolveCollision({ health: 100, damage: 20 }, { health: 100, damage: 30 });
  assert.deepEqual(result, { attackerHealth: 70, defenderHealth: 80 });
});

test("collision resolution identifies a defeated hero", () => {
  assert.deepEqual(
    resolveCollision({ health: 20, damage: 20 }, { health: 1, damage: 30 }),
    { attackerHealth: 0, defenderHealth: 0 },
  );
});

test("knockback uses a shared walk-scale ease-out profile", () => {
  assert.equal(KNOCKBACK_DISTANCE_WORLD, 0.25);
  assert.equal(KNOCKBACK_DURATION_SECONDS, 0.16);
  assert.deepEqual(createKnockbackDirection({ x: 0, y: 0 }, { x: 3, y: 4 }), { x: 0.6, y: 0.8 });
  const start = createKnockbackVelocity({ x: 1, y: 0 }, 0);
  const midpoint = createKnockbackVelocity({ x: 1, y: 0 }, 0.5);
  const end = createKnockbackVelocity({ x: 1, y: 0 }, 1);
  assert.ok(start.x > midpoint.x && midpoint.x > end.x);
  assert.equal(end.x, 0);
  assert.equal(start.x * KNOCKBACK_DURATION_SECONDS / 2, KNOCKBACK_DISTANCE_WORLD);
});

test("knockback direction uses a finite deterministic fallback", () => {
  assert.deepEqual(
    createKnockbackDirection({ x: 1, y: 1 }, { x: 1, y: 1 }, { x: 0, y: -1 }),
    { x: 0, y: -1 },
  );
  assert.deepEqual(createKnockbackDirection({ x: 1, y: 1 }, { x: 1, y: 1 }), { x: 0, y: 0 });
});

test("gameplay removes heroes when collision damage reaches zero", async () => {
  const gameplaySource = await readFile(new URL("../src/gameplay.js", import.meta.url), "utf8");

  assert.match(
    gameplaySource,
    /if \(player\.hero\.health <= 0\) this\.removeUnit\(player, enemy\.hero\.damage\)/,
  );
  assert.match(
    gameplaySource,
    /if \(enemy\.hero\.health <= 0\) this\.removeUnit\(enemy, player\.hero\.damage\)/,
  );
  assert.match(gameplaySource, /event\.collidedAgainst\?\.metadata\?\.unit/);
});

test("continuous contact damage uses a 0.2 second cooldown", async () => {
  const gameplaySource = await readFile(new URL("../src/gameplay.js", import.meta.url), "utf8");

  assert.match(gameplaySource, /CONTACT_DAMAGE_COOLDOWN_SECONDS\s*=\s*0\.2/);
  assert.match(gameplaySource, /this\.contactCooldowns\.has\(contactId\)/);
  assert.match(gameplaySource, /this\.contactCooldowns\.set\(contactId, CONTACT_DAMAGE_COOLDOWN_SECONDS\)/);
  assert.match(gameplaySource, /this\.contactCooldowns\.delete\(contactId\)/);
  const heroSource = await readFile(new URL("../src/hero.js", import.meta.url), "utf8");
  const projectileSource = await readFile(new URL("../src/projectile.js", import.meta.url), "utf8");
  assert.match(heroSource, /canTakeDamage\(\)/);
  assert.match(heroSource, /this\.damageCooldownRemaining\s*=\s*0\.2/);
  assert.match(projectileSource, /this\.target\.hero\.canTakeDamage\(\)/);
});

test("damage paths apply directional knockback without dropping target memory", async () => {
  const gameplaySource = await readFile(new URL("../src/gameplay.js", import.meta.url), "utf8");
  const projectileSource = await readFile(new URL("../src/projectile.js", import.meta.url), "utf8");

  assert.match(gameplaySource, /knockbackDirection/);
  assert.match(gameplaySource, /knockbackRemainingSeconds/);
  assert.match(gameplaySource, /if \(unit\.knockbackRemainingSeconds > 0\)/);
  assert.match(gameplaySource, /this\.applyKnockback\(\s*player/);
  assert.match(gameplaySource, /this\.applyKnockback\(\s*enemy/);
  assert.match(gameplaySource, /createKnockbackDirection\(enemyPosition, playerPosition/);
  assert.match(gameplaySource, /createKnockbackDirection\(playerPosition, enemyPosition/);
  assert.match(projectileSource, /previousGroundPosition/);
  assert.match(projectileSource, /this\.onHit\(this\.target, this\.attacker, impactDirection\)/);
});

test("projectiles have a ground collider, lifted body art, and attached shadow", async () => {
  const projectileSource = await readFile(new URL("../src/projectile.js", import.meta.url), "utf8");

  assert.match(projectileSource, /this\.root\s*=\s*new TransformNode/);
  assert.match(projectileSource, /this\.collider\s*=\s*MeshBuilder\.CreateDisc/);
  assert.match(projectileSource, /this\.mesh\s*=\s*MeshBuilder\.CreateDisc/);
  assert.match(projectileSource, /this\.shadow\s*=\s*MeshBuilder\.CreateDisc/);
  assert.match(projectileSource, /const fauxHeight = Math\.sin\(progress \* Math\.PI\)/);
  assert.match(projectileSource, /this\.mesh\.position\.y = fauxHeight/);
  assert.match(projectileSource, /this\.shadow\.parent = this\.root/);
});
