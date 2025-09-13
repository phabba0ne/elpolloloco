export default class OnscreenControls {
  constructor() {
    this.container = document.createElement("div");
    this.container.id = "onscreen-controls";
    document.body.appendChild(this.container);

    this.createButton("left", "◀", "ArrowLeft");
    this.createButton("right", "▶", "ArrowRight");
    this.createButton("up", "▲", "ArrowUp");
    this.createButton("down", "▼", "ArrowDown");
    this.createButton("jump", "⭡", "Space");
    this.createButton("attack", "⚔", "KeyF");
  }

  createButton(name, label, keyCode) {
    const btn = document.createElement("button");
    btn.className = `btn-${name}`;
    btn.textContent = label;
    this.container.appendChild(btn);

    // simulate keydown / keyup
    const trigger = (type) => {
      document.dispatchEvent(new KeyboardEvent(type, { code: keyCode }));
    };

    btn.addEventListener("touchstart", (e) => {
      e.preventDefault();
      trigger("keydown");
    });
    btn.addEventListener("touchend", (e) => {
      e.preventDefault();
      trigger("keyup");
    });
  }
}