import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("Wave Spawn branding is consistent across the app and repository metadata", async () => {
  const [index, gameplay, readme, packageJson, packageLock, workflow] = await Promise.all([
    read("../index.html"),
    read("../src/gameplay.js"),
    read("../README.md"),
    read("../package.json"),
    read("../package-lock.json"),
    read("../.github/workflows/release-web-build-to-github-pages.yml"),
  ]);

  assert.match(index, /<title>Wave Spawn!<\/title>/);
  assert.match(index, /aria-label="Wave Spawn! game"/);
  assert.match(gameplay, /showPrompt\("Wave Spawn!"/);
  assert.match(readme, /^# Wave Spawn!$/m);
  assert.match(readme, /samuelasherrivello\.github\.io\/bablylon-lite-wave-spawn\/latest\//);
  assert.equal(JSON.parse(packageJson).name, "bablylon-lite-wave-spawn");
  assert.equal(JSON.parse(packageLock).name, "bablylon-lite-wave-spawn");
  assert.match(workflow, /<title>Wave Spawn!<\/title>/g);
});
