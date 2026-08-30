import test from "node:test";
import assert from "node:assert/strict";
import { initializeWithDefaultLoadingScreen } from "../src/startup.js";

test("default loading screen wraps asynchronous game initialization", async () => {
  const events = [];
  const logo = { style: {} };
  const spinner = { style: {} };
  const spinnerContainer = { style: {} };
  const loadingDiv = {
    id: "babylonjsLoadingDiv-0",
    style: {},
    children: [{ style: {} }, logo, spinnerContainer],
    querySelectorAll: (selector) => selector === "img" ? [logo, spinner] : [],
  };
  const engine = {
    displayLoadingUI: () => events.push("show"),
    hideLoadingUI: () => events.push("hide"),
  };
  const documentRef = {
    querySelectorAll: (selector) => selector === '[id^="babylonjsLoadingDiv-"]'
      ? [loadingDiv]
      : [],
  };

  const result = await initializeWithDefaultLoadingScreen(engine, async () => {
    events.push("initialize");
    return "ready";
  }, documentRef);

  assert.equal(result, "ready");
  assert.deepEqual(events, ["show", "initialize", "hide"]);
  assert.equal(loadingDiv.style.zIndex, "1000");
  assert.equal(loadingDiv.style.overflow, "hidden");
  assert.equal(logo.style.width, "min(22%, 72px)");
  assert.equal(spinnerContainer.style.width, "min(32%, 112px)");
  assert.equal(spinnerContainer.style.height, "auto");
  assert.equal(spinnerContainer.style.aspectRatio, "1 / 1");
  assert.equal(spinner.style.width, "100%");
  assert.equal(spinner.style.height, "100%");
});
