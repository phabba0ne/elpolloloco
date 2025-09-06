export default class DrawableObject {
  x = 0;
  y = 0;
  width = 100;
  height = 100;
  img = null;
  debug = false;
  type = null;

  constructor({ x = 0, y = 0, width = 100, height = 100, debug = false } = {}) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.debug = debug;
  }

  loadImage(path) {
    if (!path) return;
    this.img = new Image();
    this.img.src = path;
  }

  draw(ctx) {
    if (this.img && this.img.complete && this.img.naturalWidth > 0) {
      ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    } else {
      ctx.fillStyle = "magenta";
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    if (this.debug) {
      ctx.save();
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.strokeRect(this.x, this.y, this.width, this.height);
      ctx.restore();
    }
  }

  update(deltaTime) {
    // Subklassen überschreiben
  }
}