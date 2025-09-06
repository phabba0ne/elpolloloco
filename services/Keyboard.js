

export default class Keyboard {
  constructor() {
    this.keys = {};      // aktueller Status
    this.prevKeys = {};  // Status im letzten Frame

    window.addEventListener("keydown", (e) => {
      this.keys[e.code] = true;
    });

    window.addEventListener("keyup", (e) => {
      this.keys[e.code] = false;
    });
  }

  /**
   * Muss am Anfang jedes Frames aufgerufen werden!
   */
  update() {
    this.prevKeys = { ...this.keys };
  }

  /**
   * Wird die Taste aktuell gehalten?
   */
  isPressed(code) {
    return !!this.keys[code];
  }

  /**
   * Wurde die Taste gerade in diesem Frame gedrückt?
   */
  justPressed(code) {
    return this.isPressed(code) && !this.prevKeys[code];
  }

  /**
   * Bewegungen: halten erlaubt
   */
  get left() {
    return this.isPressed("ArrowLeft");
  }

  get right() {
    return this.isPressed("ArrowRight");
  }

  get up() {
    return this.isPressed("ArrowUp");
  }

  get down() {
    return this.isPressed("ArrowDown");
  }

  /**
   * Aktionen: nur einmal pro Drücken
   */
  get jump() {
    return this.justPressed("Space");
  }

  get attack() {
    return this.justPressed("KeyF");
  }

    get debug() {
    return this.justPressed("KeyD");
  }
}