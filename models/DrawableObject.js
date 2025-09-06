export default class DrawableObject {
  x = 0;
  y = 0;
  width = 100;
  height = 100;
  img = null;
  debug = false;
  type = null; // optional für World/Collision

  constructor({ x = 0, y = 0, width = 100, height = 100, debug = false } = {}) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.debug = debug;
  }

  /**
   * Bild laden
   * @param {string} path Pfad zum Bild
   */
  loadImage(path) {
    if (!path) return;
    this.img = new Image();
    this.img.src = path;
  }

  /**
   * Zeichnen auf Canvas
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    if (this.img && this.img.complete && this.img.naturalWidth > 0) {
      ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    } else {
      // Platzhalter, falls kein Bild vorhanden
      ctx.fillStyle = "magenta";
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    // Debug-Hitbox
    if (this.debug) {
      ctx.save();
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.strokeRect(this.x, this.y, this.width, this.height);
      ctx.restore();
    }
  }

  /**
   * Update-Logik für Subklassen
   * @param {number} deltaTime Zeit seit letztem Frame in Sekunden
   */
  update(deltaTime) {
    // Leer – Subklassen wie MovableObject oder Character überschreiben dies
  }
}