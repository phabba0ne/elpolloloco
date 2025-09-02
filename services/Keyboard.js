class Keyboard {
  constructor() {
    this.keys = {};
    this.prevKeys = {};

    window.addEventListener("keydown", (e) => {
      this.keys[e.code] = true;
    });

    window.addEventListener("keyup", (e) => {
      this.keys[e.code] = false;
    });
  }

  // Muss am Anfang jedes Frames aufgerufen werden!
  update() {
    this.prevKeys = { ...this.keys };
  }

  // Wird die Taste aktuell gehalten?
  isPressed(code) {
    return !!this.keys[code];
  }

  // Wurde die Taste gerade in diesem Frame gedrückt?
  justPressed(code) {
    return this.isPressed(code) && !this.prevKeys[code];
  }

  // Aliase für Bewegungen (halten erlaubt)
  get left() {
    return this.justPressed("ArrowLeft");
  }

  get right() {
    return this.justPressed("ArrowRight");
  }

  get up() {
    return this.justPressed("ArrowUp");
  }

  get down() {
    return this.justPressed("ArrowDown");
  }

  // Aliase für Aktionen (nur einmal beim Drücken)
  get jump() {
    return this.justPressed("Space");
  }

  get attack() {
    return this.justPressed("KeyF");
  }
}