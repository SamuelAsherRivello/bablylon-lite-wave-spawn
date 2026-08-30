import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const workflowUrl = new URL(
  "../.github/workflows/release-web-build-to-github-pages.yml",
  import.meta.url,
);

test("release workflow builds and packages exact release metadata", async () => {
  const workflow = await readFile(workflowUrl, "utf8");
  const resolveIndex = workflow.indexOf("- name: Resolve release version");
  const buildIndex = workflow.indexOf("- name: Build browser app");
  const sizeIndex = workflow.indexOf("- name: Record total browser download size");
  const validateIndex = workflow.indexOf("- name: Validate browser build");
  const packageIndex = workflow.indexOf("- name: Package release web build");

  assert.match(workflow, /version_pattern='\^v\[0-9\]\+\[\.\]\[0-9\]\+\[\.\]\[0-9\]\+\$'/);
  assert.match(workflow, /"releaseVersion": "%s"/);
  assert.match(workflow, /"downloadSize": "000000000000"/);
  assert.match(workflow, /> public\/environment\.json/);
  assert.match(workflow, /artifact_size="\$\(find dist -type f/);
  assert.match(workflow, /\^\[0-9\]\{1,12\}\$/);
  assert.match(workflow, /printf '%012d'/);
  assert.match(workflow, /dist\/environment\.json/);
  assert.match(workflow, /final_size="\$\(find dist -type f/);
  assert.match(workflow, /test "\$\{final_size\}" = "\$\{artifact_size\}"/);
  assert.match(workflow, /grep -Eq '"downloadSize": "\[0-9\]\{12\}"'/);
  assert.ok(resolveIndex < buildIndex);
  assert.ok(buildIndex < sizeIndex);
  assert.ok(sizeIndex < validateIndex);
  assert.ok(validateIndex < packageIndex);

  assert.match(workflow, /pages-store\/releases\/\$\{release_version\}/);
  assert.match(workflow, /gh release upload/);
});

test("checked-in environment has a release version and unknown size", async () => {
  const environment = JSON.parse(await readFile(
    new URL("../public/environment.json", import.meta.url),
    "utf8",
  ));

  assert.match(environment.releaseVersion, /^v[0-9]+[.][0-9]+[.][0-9]+$/);
  assert.equal(environment.downloadSize, undefined);
});

test("release documentation keeps source metadata and published fields aligned", async () => {
  const readme = await readFile(new URL("../README.md", import.meta.url), "utf8");

  assert.match(readme, /update `public\/environment\.json`/i);
  assert.match(readme, /matching three-component GitHub Release tag/i);
  assert.match(readme, /releaseVersion/);
  assert.match(readme, /downloadSize/);
  assert.match(readme, /total uncompressed browser-build size/i);
});
