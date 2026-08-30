const LOADING_SCREEN_Z_INDEX = "1000";

function containLoadingScreen(loadingDiv) {
  loadingDiv.style.zIndex = LOADING_SCREEN_Z_INDEX;
  loadingDiv.style.overflow = "hidden";

  const [logo, spinner] = loadingDiv.querySelectorAll("img");
  if (logo) {
    logo.style.width = "min(22%, 72px)";
    logo.style.height = "auto";
    logo.style.maxHeight = "30%";
  }

  const spinnerContainer = loadingDiv.children[2];
  if (spinnerContainer) {
    spinnerContainer.style.width = "min(32%, 112px)";
    spinnerContainer.style.height = "auto";
    spinnerContainer.style.aspectRatio = "1 / 1";
  }

  if (spinner) {
    spinner.style.width = "100%";
    spinner.style.height = "100%";
  }
}

export async function initializeWithDefaultLoadingScreen(
  engine,
  initialize,
  documentRef = globalThis.document,
) {
  engine.displayLoadingUI();
  const loadingDivs = documentRef?.querySelectorAll?.(
    '[id^="babylonjsLoadingDiv-"]',
  ) ?? [];
  for (const loadingDiv of loadingDivs) {
    containLoadingScreen(loadingDiv);
  }
  const result = await initialize();
  engine.hideLoadingUI();
  return result;
}
