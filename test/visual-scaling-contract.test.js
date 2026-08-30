import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

function ruleFor(styles, selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = styles.match(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`, "s"));
  assert.ok(match, `Expected a CSS rule for ${selector}`);
  return match[1];
}

test("game-frame compositions avoid independent pixel and viewport sizing", async () => {
  const styles = await readFile(new URL("../src/style.css", import.meta.url), "utf8");
  const scalableSelectors = [
    ".selection-layer",
    ".phase-label",
    ".hero-cards",
    ".hero-card",
    ".hero",
    ".card-hero",
    ".hero-card-title",
    ".hero-card-stats, .hero-card-xp",
    ".hero-shadow",
    ".winner-label",
    ".powerup-selection .phase-label",
    ".powerup-card-art",
    ".powerup-badge",
    ".powerup-effects-layer",
    ".powerup-shield-icon",
  ];

  for (const selector of scalableSelectors) {
    const declarations = ruleFor(styles, selector);
    assert.doesNotMatch(
      declarations,
      /(?:^|[\s:(,+-])-?(?:\d*\.)?\d+(?:px|vw|vh)\b/,
      `${selector} must scale from the game frame`,
    );
  }

  assert.match(ruleFor(styles, ".card-hero"), /width:\s*\d+(?:\.\d+)?cqw/);
  assert.match(ruleFor(styles, ".card-hero"), /height:\s*\d+(?:\.\d+)?cqw/);
  assert.match(ruleFor(styles, ".hero-card"), /flex:\s*0\s+0\s+25cqw/);
});

test("project guidance requires every future game-frame feature to preserve composition", async () => {
  const [agents, readme, layoutGuide, config] = await Promise.all([
    readFile(new URL("../AGENTS.md", import.meta.url), "utf8"),
    readFile(new URL("../README.md", import.meta.url), "utf8"),
    readFile(new URL("../docs/game-size-relative-layout.md", import.meta.url), "utf8"),
    readFile(new URL("../openspec/config.yaml", import.meta.url), "utf8"),
  ]);

  assert.match(agents, /Read `docs\/game-size-relative-layout\.md` before designing or implementing/i);
  assert.match(agents, /Use `cqw`[\s\S]*Use `%`[\s\S]*Babylon world units/i);
  assert.match(readme, /future feature[\s\S]*relative siz(?:e|ing)[\s\S]*relative position/i);
  assert.match(readme, /\[Game-size-relative layout\]\(docs\/game-size-relative-layout\.md\)/i);
  assert.match(layoutGuide, /Component to the whole game frame[\s\S]*`cqw`/i);
  assert.match(layoutGuide, /Child to its already-scaled component[\s\S]*`%`/i);
  assert.match(config, /frame-relative sizing and positioning/i);
  assert.match(config, /large desktop and narrow portrait viewport/i);
  assert.match(config, /explicitly defines another composition/i);
});
