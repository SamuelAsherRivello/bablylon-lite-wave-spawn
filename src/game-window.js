let windowSequence = 0;

export class GameWindow {
  constructor({
    host,
    title,
    content,
    onClose,
    showCloseButton = true,
    closeOnBackdrop = true,
    closeLabel = "Close window",
    documentRef = globalThis.document,
  }) {
    this.host = host;
    this.onClose = onClose;
    this.backdrop = documentRef.createElement("div");
    this.backdrop.className = "game-window-backdrop";

    this.panel = documentRef.createElement("section");
    this.panel.className = "game-window";
    if (!showCloseButton) this.panel.classList.add("game-window--no-close");
    this.panel.setAttribute("role", "dialog");
    this.panel.setAttribute("aria-modal", "true");

    const titleId = `game-window-title-${windowSequence += 1}`;
    const heading = documentRef.createElement("h2");
    heading.id = titleId;
    heading.className = "game-window-title";
    heading.textContent = title;
    this.panel.setAttribute("aria-labelledby", titleId);

    this.closeButton = null;
    if (showCloseButton) {
      this.closeButton = documentRef.createElement("button");
      this.closeButton.className = "game-window-close";
      this.closeButton.type = "button";
      this.closeButton.setAttribute("aria-label", closeLabel);
      this.closeButton.textContent = "";
    }

    const body = documentRef.createElement("div");
    body.className = "game-window-body";
    body.append(content);
    this.panel.append(heading);
    if (this.closeButton) this.panel.append(this.closeButton);
    this.panel.append(body);
    this.backdrop.append(this.panel);

    this.handleBackdrop = (event) => {
      if (closeOnBackdrop && event.target === this.backdrop) this.close();
    };
    this.handleClose = () => this.close();
    this.backdrop.addEventListener("click", this.handleBackdrop);
    this.closeButton?.addEventListener("click", this.handleClose);
    this.host.append(this.backdrop);
  }

  close() {
    if (!this.backdrop.isConnected && !this.backdrop.parentNode) return;
    this.backdrop.removeEventListener("click", this.handleBackdrop);
    this.closeButton?.removeEventListener("click", this.handleClose);
    this.backdrop.remove();
    this.onClose?.();
  }
}
